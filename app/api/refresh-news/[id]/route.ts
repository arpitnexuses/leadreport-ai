import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import { fetchCompanyNews } from '@/app/actions';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Connect to database
    const client = await clientPromise;
    const db = client.db('lead-reports');
    const reports = db.collection('reports');

    // Find the report
    const report = await reports.findOne({ _id: new ObjectId(id) });
    
    if (!report) {
      return NextResponse.json(
        { success: false, error: 'Report not found' },
        { status: 404 }
      );
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
