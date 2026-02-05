# Testing News API Integration

## Quick Test Steps

### Step 1: Test the API Directly

I've created a test endpoint for you. Open your browser and visit:

```
http://localhost:3000/api/test-news?company=Microsoft
```

**Expected Response (if working):**
```json
{
  "success": true,
  "message": "NewsAPI is working correctly!",
  "companySearched": "Microsoft",
  "totalResults": 150,
  "articlesReturned": 5,
  "articles": [...],
  "envCheck": {
    "hasKey": true,
    "keyLength": 32,
    "keyPrefix": "12345678..."
  }
}
```

**Error Response Examples:**

1. **If API key is not configured:**
```json
{
  "success": false,
  "error": "NEWS_API_KEY is not configured in environment variables",
  "envCheck": {
    "hasKey": false,
    "keyLength": 0
  }
}
```

2. **If API key is invalid:**
```json
{
  "success": false,
  "error": "NewsAPI returned error: 401 Unauthorized",
  "statusCode": 401,
  "apiResponse": {
    "status": "error",
    "code": "apiKeyInvalid",
    "message": "Your API key is invalid or incorrect."
  }
}
```

### Step 2: Check Environment Variables

1. **Make sure your `.env.local` file exists** in the root directory:
   ```bash
   ls -la .env.local
   ```

2. **Check the contents** (mask your actual key):
   ```bash
   cat .env.local | grep NEWS_API_KEY
   ```
   
   Should show:
   ```
   NEWS_API_KEY=your_actual_key_here
   ```

3. **Important:** Make sure there are NO spaces around the `=` sign:
   - ✅ Correct: `NEWS_API_KEY=abc123`
   - ❌ Wrong: `NEWS_API_KEY = abc123`
   - ❌ Wrong: `NEWS_API_KEY= abc123`

### Step 3: Restart Your Server

After adding or changing the `.env.local` file, you MUST restart your development server:

```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 4: Check Server Logs

When you generate a new report, check your terminal/console logs for:

```
=== FETCHING COMPANY NEWS ===
Company Name: Microsoft
Industry: Technology
NEWS_API_KEY exists: true
NEWS_API_KEY length: 32
Search query: Microsoft
Date range from: 2026-01-06
Full query: "Microsoft"
Fetching from NewsAPI...
NewsAPI Response Status: 200
✅ NewsAPI Response: { totalResults: 250, articlesCount: 5 }
✅ Formatted articles: 5
=== NEWS FETCH COMPLETE ===
```

### Step 5: Create a Test Report

1. Go to your dashboard: `http://localhost:3000`
2. Create a new report with an email from a well-known company
3. Check the terminal logs for the news fetch output
4. Once the report loads, look for the "Company News & Updates" section above the "Engagement Timeline"

## Troubleshooting Common Issues

### Issue 1: "NEWS_API_KEY not set"

**Problem:** The environment variable is not being loaded.

**Solutions:**
1. Make sure the file is named `.env.local` (not `.env` or `env.local`)
2. Make sure it's in the root directory of your project (same level as `package.json`)
3. Restart your dev server after creating/editing the file
4. Check for typos in the variable name (it must be exactly `NEWS_API_KEY`)

### Issue 2: API Key Invalid (401 Error)

**Problem:** NewsAPI says your key is invalid.

**Solutions:**
1. Verify your API key is correct on [newsapi.org/account](https://newsapi.org/account)
2. Make sure you copied the entire key (usually 32 characters)
3. Make sure there are no extra spaces or quotes around the key
4. Try regenerating your API key on NewsAPI

### Issue 3: Rate Limit Exceeded (429 Error)

**Problem:** You've hit the free tier limit (100 requests/day).

**Solutions:**
1. Wait 24 hours for the limit to reset
2. Upgrade to a paid NewsAPI plan
3. Use existing reports instead of creating new ones (news is cached)

### Issue 4: No News Articles Found

**Problem:** NewsAPI returns 0 results for the company.

**Possible Reasons:**
1. The company name is too generic or misspelled
2. The company has little media coverage
3. No news in the last 30 days

**Test with well-known companies:**
- Microsoft
- Apple
- Tesla
- Google
- Amazon

### Issue 5: News Section Not Appearing in Report

**Problem:** Report loads but news section is missing.

**Check:**
1. Is the `sections.news` toggle enabled? (It's enabled by default)
2. Check browser console for errors
3. Check if `companyNews` data is in the report:
   - Open browser DevTools (F12)
   - Go to Console
   - Type: `report.companyNews`
   - Should show articles array

## Advanced Debugging

### Check Database

If news was fetched but not showing:

```javascript
// In MongoDB, check a report document:
db.reports.findOne({ _id: ObjectId("your_report_id") }, { companyNews: 1 })
```

Should show:
```json
{
  "companyNews": {
    "articles": [...],
    "totalResults": 150
  }
}
```

### Check Network Requests

1. Open browser DevTools (F12)
2. Go to Network tab
3. Create a new report
4. Look for requests to `newsapi.org`
5. Check the response

### Manual API Test

Test NewsAPI directly with curl:

```bash
curl "https://newsapi.org/v2/everything?q=Microsoft&from=2026-01-06&sortBy=publishedAt&language=en&pageSize=5&apiKey=YOUR_KEY_HERE"
```

## Getting Help

If you're still having issues:

1. **Check the test endpoint response** at `/api/test-news?company=Microsoft`
2. **Copy the server logs** when generating a report
3. **Check the browser console** for errors
4. **Verify your NewsAPI account status** at newsapi.org

The logs should tell you exactly what's wrong!
