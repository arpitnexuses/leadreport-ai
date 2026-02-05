# News API Setup Guide

## Overview
The LeadReport AI now includes a real-time company news feature that fetches recent news articles about the lead's company using NewsAPI.org.

## Features
- **Real-time News**: Fetches recent news articles (last 30 days) about the company
- **Smart Positioning**: News section appears right above the Engagement Timeline
- **Graceful Fallback**: If NewsAPI is not configured or fails, the report still generates successfully
- **Rich Display**: Shows article title, description, source, publish date, and thumbnail images

## Setup Instructions

### 1. Get a NewsAPI Key

1. Visit [https://newsapi.org/](https://newsapi.org/)
2. Click "Get API Key" and sign up for a free account
3. Free tier includes:
   - 100 requests per day
   - Access to news from 150,000+ sources worldwide
   - Last 30 days of articles

### 2. Add to Environment Variables

Add your NewsAPI key to your `.env.local` file:

```bash
NEWS_API_KEY=your_newsapi_key_here
```

### 3. Restart Your Development Server

After adding the environment variable, restart your Next.js development server:

```bash
npm run dev
```

## How It Works

1. **Data Fetching**: When a report is generated, the system:
   - Fetches company data from Apollo
   - Simultaneously fetches recent news about the company using NewsAPI
   - Stores both in the MongoDB report document

2. **Display**: The news section shows:
   - Article title (clickable link to original source)
   - Article description/summary
   - Source name
   - Publication date (formatted as "X days ago" or specific date)
   - Thumbnail image (if available)

3. **Fallback Behavior**: 
   - If NEWS_API_KEY is not set, news fetching is skipped (no errors)
   - If news fetch fails, the report continues without news
   - AI-generated industry trends are still shown if available

## News Section Location

The news section appears in the report:
- **Above** the Engagement Timeline
- **Below** the Strategic Brief section
- Only displays if there are news articles or AI content available

## Customization

You can customize the news fetching in `app/actions.ts`:

```typescript
// Change the number of articles fetched (default: 5)
pageSize=5

// Change the date range (default: 30 days)
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
```

## Rate Limits

**Free Tier:**
- 100 requests per day
- 1 request every 5 seconds

**Best Practices:**
- News is fetched once per report generation
- Results are cached in the database
- Re-viewing a report doesn't make new API calls

## Troubleshooting

### News section not showing
1. Check if `NEWS_API_KEY` is set in `.env.local`
2. Check browser console for errors
3. Verify the company has a valid name in Apollo data

### Rate limit errors
- NewsAPI free tier has 100 requests/day limit
- Consider upgrading to a paid plan for production use
- Error handling prevents report generation from failing

### No news found
- Some companies may have limited news coverage
- Try testing with well-known company names (e.g., "Microsoft", "Tesla")
- The system will still show AI-generated industry trends as fallback

## Production Deployment

When deploying to Vercel or other platforms:

1. Add `NEWS_API_KEY` to your environment variables in the platform settings
2. Consider upgrading to NewsAPI Business plan for:
   - Higher rate limits (up to 250,000 requests/day)
   - Commercial use license
   - Better support

## Alternative News Sources

If you prefer a different news source, you can modify the `fetchCompanyNews` function in `app/actions.ts` to use:
- Google News API
- Bing News Search API
- Custom RSS feed aggregators
- Other news aggregation services

The `NewsContent` component is designed to display any news format that matches the structure:
```typescript
{
  articles: Array<{
    title: string;
    description?: string;
    url: string;
    source: string;
    publishedAt: string;
    urlToImage?: string;
  }>;
  totalResults: number;
}
```
