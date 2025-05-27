import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import puppeteer from 'puppeteer';

// Helper function to get base URL
function getBaseUrl() {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3000' 
    : `https://${process.env.NEXT_PUBLIC_VERCEL_URL || 'localhost:3000'}`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let browser = null;
  
  try {
    console.log(`PDF generation started for report: ${params.id}`);
    
    // Connect to database using the clientPromise
    const client = await clientPromise;
    const db = client.db('lead-reports');
    
    // Validate report ID
    if (!params.id || !ObjectId.isValid(params.id)) {
      console.error(`Invalid report ID: ${params.id}`);
      return NextResponse.json({ error: 'Invalid report ID' }, { status: 400 });
    }

    // Get report from database
    console.log(`Fetching report from database: ${params.id}`);
    const report = await db.collection('reports').findOne({
      _id: new ObjectId(params.id)
    });

    if (!report) {
      console.error(`Report not found: ${params.id}`);
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    console.log(`Preparing to launch Puppeteer for report: ${params.id}`);
    
    // More robust Puppeteer launch options
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ],
      // @ts-expect-error - ignoreHTTPSErrors may not be in the type definitions but works in Puppeteer
      ignoreHTTPSErrors: true
    });
    
    console.log('Browser launched successfully');
    
    const page = await browser.newPage();
    console.log('New page created');
    
    // Set a more generous timeout
    page.setDefaultNavigationTimeout(60000);
    page.setDefaultTimeout(60000);
    
    // Set viewport size for the PDF
    await page.setViewport({
      width: 1200,
      height: 800,
      deviceScaleFactor: 1,
    });
    console.log('Viewport set');

    // Navigate to the shared report page
    const baseUrl = getBaseUrl();
    const reportUrl = `${baseUrl}/shared-report/${params.id}`;
    console.log(`Navigating to URL: ${reportUrl}`);
    
    // Navigate to the page with detailed error handling
    try {
      await page.goto(reportUrl, { 
        waitUntil: 'networkidle2',
        timeout: 60000
      });
      console.log('Successfully navigated to report page');
    } catch (navigationError: unknown) {
      console.error('Navigation error:', navigationError);
      const errorMessage = navigationError instanceof Error ? navigationError.message : 'Unknown navigation error';
      throw new Error(`Failed to navigate to report page: ${errorMessage}`);
    }

    // Wait for the content to be fully loaded with better error handling
    try {
      console.log('Waiting for main content to load');
      await page.waitForSelector('main', { timeout: 30000 });
      console.log('Main content loaded successfully');
    } catch (waitError: unknown) {
      console.error('Error waiting for content:', waitError);
      
      // Take a screenshot for debugging
      try {
        const screenshot = await page.screenshot({ fullPage: true });
        console.log('Captured error screenshot, would save to storage in production');
        // In production, you might want to save this screenshot to a storage service
      } catch (screenshotError) {
        console.error('Failed to capture error screenshot:', screenshotError);
      }
      
      const errorMessage = waitError instanceof Error ? waitError.message : 'Unknown wait error';
      throw new Error(`Failed to load report content: ${errorMessage}`);
    }
    
    // Optional: Add a timestamp or watermark to the PDF
    await page.evaluate(() => {
      try {
        const watermark = document.createElement('div');
        watermark.style.position = 'fixed';
        watermark.style.bottom = '10px';
        watermark.style.right = '10px';
        watermark.style.fontSize = '12px';
        watermark.style.color = '#888';
        watermark.style.zIndex = '9999';
        watermark.innerText = `Generated on ${new Date().toLocaleString()}`;
        document.body.appendChild(watermark);

        // Remove any download buttons from the PDF
        const downloadButtons = document.querySelectorAll('button');
        downloadButtons.forEach(button => {
          if (button.textContent?.includes('Download PDF')) {
            button.style.display = 'none';
          }
        });
        return true;
      } catch (e) {
        console.error('Client-side error:', e);
        return false;
      }
    });
    console.log('Added watermark to PDF');

    // Generate the PDF with improved error handling
    console.log('Generating PDF');
    let pdfBuffer;
    try {
      pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px'
        },
        timeout: 60000
      });
      console.log('PDF generated successfully');
    } catch (pdfError: unknown) {
      console.error('PDF generation error:', pdfError);
      const errorMessage = pdfError instanceof Error ? pdfError.message : 'Unknown PDF generation error';
      throw new Error(`Failed to generate PDF: ${errorMessage}`);
    }

    // Close the browser
    if (browser) {
      await browser.close();
      console.log('Browser closed successfully');
    }

    console.log('Returning PDF response');
    // Return the PDF as a response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${report.leadData.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-report.pdf"`,
      },
    });
  } catch (error: unknown) {
    console.error('API error:', error);
    
    // Ensure browser is closed if there was an error
    if (browser) {
      try {
        await browser.close();
        console.log('Browser closed after error');
      } catch (closeError) {
        console.error('Error closing browser:', closeError);
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to generate PDF', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 