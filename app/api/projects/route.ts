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
  if (!tokenUser?.userId) return null;

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
    console.error("Failed to refresh user permissions for projects route:", error);
  }

  return {
    userId: tokenUser.userId,
    role: tokenUser.role,
  };
}

function normalizeProjectName(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function projectNamesMatch(value: unknown, target: string): boolean {
  const normalizedValue = normalizeProjectName(value).toLowerCase();
  const normalizedTarget = normalizeProjectName(target).toLowerCase();
  if (!normalizedValue || !normalizedTarget) return false;
  return normalizedValue === normalizedTarget;
}

function normalizeSolutions(values: unknown): string[] {
  if (!Array.isArray(values)) return [];
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
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const reportsCollection = db.collection("reports");
    const usersCollection = db.collection("users");
    const projectSolutionsCollection = db.collection("project_solutions");
    const projectsCollection = db.collection("projects");

    const [reports, users, projectSolutionsDocs, projectDocs] = await Promise.all([
      reportsCollection
        .find(
          {},
          {
            projection: {
              "leadData.project": 1,
              "leadData.status": 1,
              "leadData.solutions": 1,
              reportOwnerName: 1,
            },
          }
        )
        .toArray(),
      usersCollection.find({}, { projection: { role: 1, assignedProjects: 1 } }).toArray(),
      projectSolutionsCollection.find({}).toArray(),
      projectsCollection.find({}).toArray(),
    ]);

    const projectNames = new Set<string>();
    reports.forEach((report) => {
      const project = normalizeProjectName(report?.leadData?.project);
      if (project && project !== "Unassigned") projectNames.add(project);
    });
    users.forEach((userDoc) => {
      if (Array.isArray(userDoc.assignedProjects)) {
        userDoc.assignedProjects.forEach((project: string) => {
          const cleaned = normalizeProjectName(project);
          if (cleaned) projectNames.add(cleaned);
        });
      }
    });
    projectSolutionsDocs.forEach((doc) => {
      const project = normalizeProjectName(doc.project);
      if (project) projectNames.add(project);
    });
    projectDocs.forEach((doc) => {
      const project = normalizeProjectName(doc.name);
      if (project) projectNames.add(project);
    });

    const projectStatsMap = Array.from(projectNames).reduce((acc, project) => {
      acc[project] = {
        name: project,
        description: "",
        isActive: true,
        totalLeads: 0,
        assignedUsers: 0,
        reportOwners: 0,
        solutionsCount: 0,
        statusCounts: {
          hot: 0,
          warm: 0,
          meeting_scheduled: 0,
          meeting_rescheduled: 0,
          meeting_done: 0,
        } as Record<string, number>,
      };
      return acc;
    }, {} as Record<string, any>);

    reports.forEach((report) => {
      const project = normalizeProjectName(report?.leadData?.project);
      if (!project || !projectStatsMap[project]) return;
      projectStatsMap[project].totalLeads += 1;
      const status = normalizeProjectName(report?.leadData?.status) || "warm";
      projectStatsMap[project].statusCounts[status] = (projectStatsMap[project].statusCounts[status] || 0) + 1;
    });

    users.forEach((userDoc) => {
      const assigned = Array.isArray(userDoc.assignedProjects) ? userDoc.assignedProjects : [];
      assigned.forEach((project: string) => {
        const cleaned = normalizeProjectName(project);
        if (cleaned && projectStatsMap[cleaned] && userDoc.role !== "admin") {
          projectStatsMap[cleaned].assignedUsers += 1;
        }
      });
    });

    const ownersByProject = reports.reduce((acc, report) => {
      const project = normalizeProjectName(report?.leadData?.project);
      if (!project || !projectStatsMap[project]) return acc;
      const owner = normalizeProjectName(report?.reportOwnerName);
      if (!owner) return acc;
      if (!acc[project]) acc[project] = new Set<string>();
      acc[project].add(owner);
      return acc;
    }, {} as Record<string, Set<string>>);

    Object.entries(ownersByProject).forEach(([project, owners]) => {
      if (projectStatsMap[project]) {
        projectStatsMap[project].reportOwners = owners.size;
      }
    });

    const solutionsFromReports = reports.reduce((acc, report) => {
      const project = normalizeProjectName(report?.leadData?.project);
      if (!project || !projectStatsMap[project]) return acc;
      if (!acc[project]) acc[project] = new Set<string>();
      normalizeSolutions(report?.leadData?.solutions).forEach((solution) => acc[project].add(solution));
      return acc;
    }, {} as Record<string, Set<string>>);

    const configuredSolutions = projectSolutionsDocs.reduce((acc, doc) => {
      const project = normalizeProjectName(doc.project);
      if (!project || !projectStatsMap[project]) return acc;
      if (!acc[project]) acc[project] = new Set<string>();
      normalizeSolutions(doc.solutions).forEach((solution) => acc[project].add(solution));
      return acc;
    }, {} as Record<string, Set<string>>);

    Object.keys(projectStatsMap).forEach((project) => {
      const merged = new Set<string>([
        ...(solutionsFromReports[project] ? Array.from(solutionsFromReports[project]) : []),
        ...(configuredSolutions[project] ? Array.from(configuredSolutions[project]) : []),
      ]);
      projectStatsMap[project].solutionsCount = merged.size;
    });

    projectDocs.forEach((doc: any) => {
      const project = normalizeProjectName(doc.name);
      if (!project || !projectStatsMap[project]) return;
      projectStatsMap[project].description = doc.description || "";
      projectStatsMap[project].isActive = doc.isActive !== false;
    });

    const projects = Object.values(projectStatsMap).sort((a: any, b: any) =>
      String(a.name).localeCompare(String(b.name))
    );

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const currentName = normalizeProjectName(body.currentName);
    const newName = normalizeProjectName(body.newName || body.currentName);
    const description = typeof body.description === "string" ? body.description.trim() : "";
    const isActive = body.isActive === false ? false : true;

    if (!currentName || !newName) {
      return NextResponse.json({ error: "Project name is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("lead-reports");
    const user = await getAuthorizedUser(request, db);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const reportsCollection = db.collection("reports");
    const usersCollection = db.collection("users");
    const projectSolutionsCollection = db.collection("project_solutions");
    const projectsCollection = db.collection("projects");

    if (currentName !== newName) {
      // Update report project names with robust matching (trim + case-insensitive).
      const reportsToFix = await reportsCollection
        .find(
          { "leadData.project": { $exists: true } },
          { projection: { _id: 1, "leadData.project": 1 } }
        )
        .toArray();
      await Promise.all(
        reportsToFix
          .filter((report) => projectNamesMatch(report?.leadData?.project, currentName))
          .map((report) =>
            reportsCollection.updateOne(
              { _id: report._id },
              { $set: { "leadData.project": newName, updatedAt: new Date() } }
            )
          )
      );

      // Update user assigned projects with robust matching as well.
      const allUsers = await usersCollection
        .find({ assignedProjects: { $exists: true } }, { projection: { assignedProjects: 1 } })
        .toArray();
      await Promise.all(
        allUsers.map((userDoc) => {
          const existingAssigned = Array.isArray(userDoc.assignedProjects) ? userDoc.assignedProjects : [];
          const updatedAssigned = Array.from(
            new Set(
              existingAssigned.map((project: string) =>
                projectNamesMatch(project, currentName) ? newName : project
              )
            )
          );
          const changed = JSON.stringify(updatedAssigned) !== JSON.stringify(existingAssigned);
          if (!changed) return Promise.resolve();
          return usersCollection.updateOne(
            { _id: userDoc._id },
            { $set: { assignedProjects: updatedAssigned, updatedAt: new Date() } }
          );
        })
      );

      const currentSolutionsDoc = await projectSolutionsCollection.findOne({ project: currentName });
      const targetSolutionsDoc = await projectSolutionsCollection.findOne({ project: newName });
      if (currentSolutionsDoc) {
        const mergedSolutions = Array.from(
          new Set([
            ...normalizeSolutions(targetSolutionsDoc?.solutions),
            ...normalizeSolutions(currentSolutionsDoc?.solutions),
          ])
        ).sort();
        await projectSolutionsCollection.updateOne(
          { project: newName },
          {
            $set: {
              project: newName,
              solutions: mergedSolutions,
              updatedAt: new Date(),
            },
            $setOnInsert: { createdAt: new Date() },
          },
          { upsert: true }
        );
        await projectSolutionsCollection.deleteOne({ project: currentName });
      }

      const existingProjectTarget = await projectsCollection.findOne({ name: newName });
      const existingProjectCurrent = await projectsCollection.findOne({ name: currentName });

      const mergedDescription =
        description || existingProjectCurrent?.description || existingProjectTarget?.description || "";
      const mergedIsActive =
        typeof body.isActive === "boolean"
          ? body.isActive
          : existingProjectCurrent?.isActive ?? existingProjectTarget?.isActive ?? true;

      await projectsCollection.updateOne(
        { name: newName },
        {
          $set: {
            name: newName,
            description: mergedDescription,
            isActive: mergedIsActive,
            updatedAt: new Date(),
          },
          $setOnInsert: {
            createdAt: existingProjectCurrent?.createdAt || new Date(),
          },
        },
        { upsert: true }
      );

      if (existingProjectCurrent && currentName !== newName) {
        await projectsCollection.deleteOne({ name: currentName });
      }
    } else {
      await projectsCollection.updateOne(
        { name: currentName },
        {
          $set: {
            name: currentName,
            description,
            isActive,
            updatedAt: new Date(),
          },
          $setOnInsert: { createdAt: new Date() },
        },
        { upsert: true }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update project:", error);
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const projectName = normalizeProjectName(body.projectName);

    if (!projectName) {
      return NextResponse.json({ error: "Project name is required" }, { status: 400 });
    }
    if (projectName === "Unassigned") {
      return NextResponse.json({ error: "Cannot delete Unassigned project" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("lead-reports");
    const user = await getAuthorizedUser(request, db);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const reportsCollection = db.collection("reports");
    const usersCollection = db.collection("users");
    const projectSolutionsCollection = db.collection("project_solutions");
    const projectsCollection = db.collection("projects");

    // Preserve reports but detach from deleted project (robust name matching).
    const reportsToFix = await reportsCollection
      .find(
        { "leadData.project": { $exists: true } },
        { projection: { _id: 1, "leadData.project": 1 } }
      )
      .toArray();
    await Promise.all(
      reportsToFix
        .filter((report) => projectNamesMatch(report?.leadData?.project, projectName))
        .map((report) =>
          reportsCollection.updateOne(
            { _id: report._id },
            {
              $set: {
                "leadData.project": "Unassigned",
                "leadData.solutions": [],
                updatedAt: new Date(),
              },
            }
          )
        )
    );

    const allUsers = await usersCollection
      .find({ assignedProjects: { $exists: true } }, { projection: { assignedProjects: 1 } })
      .toArray();
    await Promise.all(
      allUsers.map((userDoc) => {
        const existingAssigned = Array.isArray(userDoc.assignedProjects) ? userDoc.assignedProjects : [];
        const updatedAssigned = existingAssigned.filter(
          (project: string) => !projectNamesMatch(project, projectName)
        );
        const changed = JSON.stringify(updatedAssigned) !== JSON.stringify(existingAssigned);
        if (!changed) return Promise.resolve();
        return usersCollection.updateOne(
          { _id: userDoc._id },
          { $set: { assignedProjects: updatedAssigned, updatedAt: new Date() } }
        );
      })
    );

    await Promise.all([
      projectSolutionsCollection.deleteMany({
        project: { $regex: `^\\s*${projectName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`, $options: "i" },
      }),
      projectsCollection.deleteMany({
        name: { $regex: `^\\s*${projectName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`, $options: "i" },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete project:", error);
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
