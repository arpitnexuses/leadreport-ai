import { NextRequest, NextResponse } from "next/server";
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { canAccessProject, getUserFromRequest } from '@/lib/auth';

interface AuthorizedUser {
  userId: string;
  email: string;
  role: 'admin' | 'project_user' | 'client';
  assignedProjects?: string[];
}

const getAuthorizedUser = async (request: NextRequest, db: any): Promise<AuthorizedUser | null> => {
  const tokenUser = getUserFromRequest(request);
  if (!tokenUser?.userId) {
    return null;
  }

  try {
    if (ObjectId.isValid(tokenUser.userId)) {
      const dbUser = await db.collection('users').findOne({ _id: new ObjectId(tokenUser.userId) });
      if (dbUser) {
        return {
          userId: tokenUser.userId,
          email: tokenUser.email,
          role: dbUser.role || tokenUser.role,
          assignedProjects: dbUser.assignedProjects || tokenUser.assignedProjects || []
        };
      }
    }
  } catch (error) {
    console.error('Failed to refresh user permissions for report status route:', error);
  }

  return {
    userId: tokenUser.userId,
    email: tokenUser.email,
    role: tokenUser.role,
    assignedProjects: tokenUser.assignedProjects || []
  };
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const reportId = id;
    
    if (!reportId) {
      return NextResponse.json({ error: "Report ID is required" }, { status: 400 });
    }
    
    // Validate ObjectId format
    if (!ObjectId.isValid(reportId)) {
      return NextResponse.json({ error: "Invalid report ID format" }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db("lead-reports");
    const collection = db.collection('reports');
    const user = await getAuthorizedUser(request, db);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Find the report by ID
    const report = await collection.findOne({ _id: new ObjectId(reportId) });
    
    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    if (user.role !== 'admin') {
      const reportProject = report?.leadData?.project?.trim();
      if (!reportProject || !canAccessProject(user, reportProject)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }
    
    // Return status information only
    return NextResponse.json({
      status: report.status || 'processing',
      error: report.error || null
    });
    
  } catch (error) {
    return NextResponse.json(
      { 
        error: "Failed to fetch report status",
        details: error instanceof Error ? error.message : String(error)
      }, 
      { status: 500 }
    );
  }
} 