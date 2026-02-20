import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { getUserFromRequest } from "@/lib/auth";

type AuthorizedUser = {
  userId: string;
  role: "admin" | "project_user" | "client";
};

async function getAuthorizedUser(request: NextRequest, db: any): Promise<AuthorizedUser | null> {
  const tokenUser = getUserFromRequest(request);
  if (!tokenUser?.userId) {
    return null;
  }

  try {
    if (ObjectId.isValid(tokenUser.userId)) {
      const dbUser = await db.collection("users").findOne({ _id: new ObjectId(tokenUser.userId) });
      if (dbUser) {
        return {
          userId: tokenUser.userId,
          role: dbUser.role || tokenUser.role,
        };
      }
    }
  } catch (error) {
    console.error("Failed to refresh user permissions for project-solutions route:", error);
  }

  return {
    userId: tokenUser.userId,
    role: tokenUser.role,
  };
}

function normalizeSolutions(values: unknown): string[] {
  if (!Array.isArray(values)) {
    return [];
  }

  return Array.from(
    new Set(
      values
        .map((value) => (typeof value === "string" ? value.trim() : ""))
        .filter((value) => value !== "")
    )
  ).sort();
}

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db("lead-reports");
    const user = await getAuthorizedUser(request, db);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const collection = db.collection("project_solutions");
    const docs = await collection.find({}).toArray();
    const projectSolutions = docs.reduce((acc, doc) => {
      const project = typeof doc.project === "string" ? doc.project.trim() : "";
      if (!project) return acc;
      acc[project] = normalizeSolutions(doc.solutions);
      return acc;
    }, {} as Record<string, string[]>);

    return NextResponse.json({ projectSolutions });
  } catch (error) {
    console.error("Error loading project solutions:", error);
    return NextResponse.json({ error: "Failed to load project solutions" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const project = typeof body.project === "string" ? body.project.trim() : "";
    const solutions = normalizeSolutions(body.solutions);

    if (!project) {
      return NextResponse.json({ error: "Project is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("lead-reports");
    const user = await getAuthorizedUser(request, db);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const collection = db.collection("project_solutions");
    await collection.updateOne(
      { project },
      {
        $set: {
          project,
          solutions,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true, project, solutions });
  } catch (error) {
    console.error("Error saving project solutions:", error);
    return NextResponse.json({ error: "Failed to save project solutions" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const project = typeof body.project === "string" ? body.project.trim() : "";
    if (!project) {
      return NextResponse.json({ error: "Project is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("lead-reports");
    const user = await getAuthorizedUser(request, db);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const collection = db.collection("project_solutions");
    await collection.deleteOne({ project });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting project solutions:", error);
    return NextResponse.json({ error: "Failed to delete project solutions" }, { status: 500 });
  }
}
