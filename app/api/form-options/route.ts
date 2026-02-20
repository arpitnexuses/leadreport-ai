import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getCurrentUser, getAccessibleProjects } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    console.log('[form-options] GET request received');
    console.log('[form-options] Request URL:', request.url);
    console.log('[form-options] Request headers:', Object.fromEntries(request.headers));
    
    const user = await getCurrentUser();
    console.log('[form-options] Current user:', user ? { email: user.email, role: user.role } : 'null');
    
    if (!user) {
      console.log('[form-options] No user found, returning 401');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { reports } = await getDb();
    console.log('[form-options] Database connected');
    
    // Get all reports
    const allReports = await reports.find({}).toArray();
    console.log('[form-options] Total reports found:', allReports.length);

    const { db } = await getDb();
    const projectDocs = await db.collection("projects").find({}).toArray();
    const configuredProjects = projectDocs
      .map((doc) => (typeof doc.name === "string" ? doc.name.trim() : ""))
      .filter((name): name is string => !!name);

    const configuredProjectSolutionsDocs = await db
      .collection("project_solutions")
      .find({})
      .toArray();
    const configuredProjectSolutions = configuredProjectSolutionsDocs.reduce((acc, doc) => {
      const project = typeof doc.project === "string" ? doc.project.trim() : "";
      if (!project) return acc;
      const solutions = Array.isArray(doc.solutions)
        ? doc.solutions
            .map((solution: string) => solution?.trim())
            .filter((solution: string | undefined): solution is string => !!solution)
        : [];
      acc[project] = Array.from(new Set(solutions)).sort();
      return acc;
    }, {} as Record<string, string[]>);
    
    // Extract unique projects (excluding empty/null/undefined and "Unassigned")
    const allProjects = [...new Set([
      ...allReports
        .map(report => report.leadData?.project)
        .filter(project => project && project.trim() !== '' && project !== 'Unassigned'),
      ...Object.keys(configuredProjectSolutions),
      ...configuredProjects,
    ])].sort() as string[];
    console.log('[form-options] All projects extracted:', allProjects.length);
    
    // Filter projects based on user role
    const projects = getAccessibleProjects(user, allProjects);
    // Build project -> solutions mapping for accessible projects only
    const projectSolutions = projects.reduce((acc, projectName) => {
      const solutions = Array.from(
        new Set(
          [
            ...(configuredProjectSolutions[projectName] || []),
            ...allReports
            .filter(report => report.leadData?.project?.trim() === projectName)
            .flatMap(report => Array.isArray(report.leadData?.solutions) ? report.leadData.solutions : [])
            .map((solution: string) => solution?.trim())
            .filter((solution: string | undefined): solution is string => !!solution),
          ]
        )
      ).sort();

      acc[projectName] = solutions;
      return acc;
    }, {} as Record<string, string[]>);

    console.log('[form-options] Accessible projects for user:', projects.length);
    
    // Extract unique report owner names (excluding empty/null/undefined)
    const reportOwners = [...new Set(
      allReports
        .map(report => report.reportOwnerName)
        .filter(name => name && name.trim() !== '')
    )].sort();
    console.log('[form-options] Report owners extracted:', reportOwners.length);
    
    const response = {
      projects,
      reportOwners,
      projectSolutions
    };
    console.log('[form-options] Returning response:', response);
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('[form-options] Error fetching form options:', error);
    console.error('[form-options] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { error: 'Failed to fetch form options', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
