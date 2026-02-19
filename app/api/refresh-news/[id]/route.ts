import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import { fetchCompanyNews } from '@/app/actions';
import { canAccessProject, getUserFromRequest } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid report ID format' },
        { status: 400 }
      );
    }
    
    // Connect to database
    const client = await clientPromise;
    const db = client.db('lead-reports');
    const reports = db.collection('reports');
    const tokenUser = getUserFromRequest(request);

    if (!tokenUser?.userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let role = tokenUser.role;
    let assignedProjects = tokenUser.assignedProjects || [];
    if (ObjectId.isValid(tokenUser.userId)) {
      const dbUser = await db.collection('users').findOne({ _id: new ObjectId(tokenUser.userId) });
      if (dbUser) {
        role = dbUser.role || role;
        assignedProjects = dbUser.assignedProjects || assignedProjects;
      }
    }

    if (role === 'client') {
      return NextResponse.json(
        { success: false, error: 'Clients cannot edit reports' },
        { status: 403 }
      );
    }

    // Find the report
    const report = await reports.findOne({ _id: new ObjectId(id) });
    
    if (!report) {
      return NextResponse.json(
        { success: false, error: 'Report not found' },
        { status: 404 }
      );
    }

    if (role !== 'admin') {
      const reportProject = report?.leadData?.project?.trim();
      if (!reportProject || !canAccessProject({ userId: tokenUser.userId, email: tokenUser.email, role, assignedProjects }, reportProject)) {
        return NextResponse.json(
          { success: false, error: 'Forbidden' },
          { status: 403 }
        );
      }
    }

    // Get company name from Apollo data
    const companyName = report.apolloData?.person?.organization?.name;
    const industry = report.apolloData?.person?.organization?.industry;

    if (!companyName || companyName === 'N/A') {
      return NextResponse.json(
        { success: false, error: 'No company name found in report' },
        { status: 400 }
      );
    }

    console.log(`Refreshing news for report ${id}, company: ${companyName}`);

    // Fetch fresh news
    const companyNews = await fetchCompanyNews(companyName, industry);

    if (!companyNews || companyNews.articles.length === 0) {
      return NextResponse.json(
        { 
          success: true, 
          message: 'No news articles found for this company',
          companyNews: { articles: [], totalResults: 0 }
        }
      );
    }

    // Update the report with news
    await reports.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          companyNews,
          newsRefreshedAt: new Date()
        } 
      }
    );

    console.log(`Successfully refreshed news for report ${id}: ${companyNews.articles.length} articles`);

    return NextResponse.json({
      success: true,
      message: `Found ${companyNews.articles.length} news articles`,
      companyNews
    });

  } catch (error) {
    console.error('Error refreshing news:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to refresh news' 
      },
      { status: 500 }
    );
  }
}
