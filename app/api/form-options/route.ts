import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getCurrentUser, getAccessibleProjects } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { reports } = await getDb();
    
    // Get all reports
    const allReports = await reports.find({}).toArray();
    
    // Extract unique projects (excluding empty/null/undefined and "Unassigned")
    const allProjects = [...new Set(
      allReports
        .map(report => report.leadData?.project)
        .filter(project => project && project.trim() !== '' && project !== 'Unassigned')
    )].sort() as string[];
    
    // Filter projects based on user role
    const projects = getAccessibleProjects(user, allProjects);
    
    // Extract unique report owner names (excluding empty/null/undefined)
    const reportOwners = [...new Set(
      allReports
        .map(report => report.reportOwnerName)
        .filter(name => name && name.trim() !== '')
    )].sort();
    
    return NextResponse.json({
      projects,
      reportOwners
    });
  } catch (error) {
    console.error('Error fetching form options:', error);
    return NextResponse.json(
      { error: 'Failed to fetch form options' },
      { status: 500 }
    );
  }
}
