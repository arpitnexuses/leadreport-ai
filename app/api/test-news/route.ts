import { NextResponse } from 'next/server';

const NEWS_API_KEY = process.env.NEWS_API_KEY;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyName = searchParams.get('company') || 'Microsoft';
  
  // Check if API key is configured
  if (!NEWS_API_KEY) {
    return NextResponse.json({
      success: false,
      error: 'NEWS_API_KEY is not configured in environment variables',
      envCheck: {
        hasKey: false,
        keyLength: 0
      }
    });
  }

  try {
    // Build the NewsAPI request
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const fromDate = thirtyDaysAgo.toISOString().split('T')[0];

    const searchQuery = companyName.replace(/\s+(Inc|LLC|Ltd|Corporation|Corp)\.?$/i, '').trim();
    const query = `"${searchQuery}"`;
    
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&from=${fromDate}&sortBy=publishedAt&language=en&pageSize=5&apiKey=${NEWS_API_KEY}`;
    
    console.log('Testing NewsAPI with company:', companyName);
    console.log('Request URL (without API key):', url.replace(NEWS_API_KEY, 'HIDDEN'));

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'LeadReport-AI/1.0'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: `NewsAPI returned error: ${response.status} ${response.statusText}`,
        statusCode: response.status,
        apiResponse: data,
        envCheck: {
          hasKey: true,
          keyLength: NEWS_API_KEY.length,
          keyPrefix: NEWS_API_KEY.substring(0, 8) + '...'
        }
      });
    }

    // Success - return the formatted response
    return NextResponse.json({
      success: true,
      message: 'NewsAPI is working correctly!',
      companySearched: companyName,
      totalResults: data.totalResults || 0,
      articlesReturned: data.articles?.length || 0,
      articles: (data.articles || []).slice(0, 3).map((article: any) => ({
        title: article.title,
        source: article.source?.name,
        publishedAt: article.publishedAt,
        url: article.url
      })),
      envCheck: {
        hasKey: true,
        keyLength: NEWS_API_KEY.length,
        keyPrefix: NEWS_API_KEY.substring(0, 8) + '...'
      }
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      envCheck: {
        hasKey: true,
        keyLength: NEWS_API_KEY.length
      }
    });
  }
}
