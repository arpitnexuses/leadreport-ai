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
    console.log(`PDF generation started for shared report: ${params.id}`);
    
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

    console.log(`Preparing to launch Puppeteer for shared report: ${params.id}`);
    
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
    
    // Set viewport size for the PDF - optimized for 2-column layout
    await page.setViewport({
      width: 1600,
      height: 1200,
      deviceScaleFactor: 1.5, // Balanced DPI for quality and size
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
      console.log('Successfully navigated to shared report page');
    } catch (navigationError: unknown) {
      console.error('Navigation error:', navigationError);
      const errorMessage = navigationError instanceof Error ? navigationError.message : 'Unknown navigation error';
      throw new Error(`Failed to navigate to shared report page: ${errorMessage}`);
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
      throw new Error(`Failed to load shared report content: ${errorMessage}`);
    }
    
    // Optimize layout for PDF generation
    await page.evaluate(() => {
      try {
        // Hide sidebar
        const sidebar = document.querySelector('[class*="fixed md:static inset-y-0 left-0"]');
        if (sidebar) {
          (sidebar as HTMLElement).style.display = 'none';
        }
        
        // Hide mobile menu button
        const mobileMenuButton = document.querySelector('[class*="fixed top-4 left-4 z-30 md:hidden"]');
        if (mobileMenuButton) {
          (mobileMenuButton as HTMLElement).style.display = 'none';
        }
        
        // Hide mobile overlay
        const mobileOverlay = document.querySelector('[class*="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"]');
        if (mobileOverlay) {
          (mobileOverlay as HTMLElement).style.display = 'none';
        }
        
        // Remove any download buttons from the PDF
        const downloadButtons = document.querySelectorAll('button');
        downloadButtons.forEach(button => {
          if (button.textContent?.includes('Download PDF')) {
            button.style.display = 'none';
          }
        });
        
        // Optimize main content layout for PDF
        const mainContent = document.querySelector('main');
        if (mainContent) {
          const mainEl = mainContent as HTMLElement;
          mainEl.style.marginLeft = '0';
          mainEl.style.width = '100%';
          mainEl.style.maxWidth = 'none';
          mainEl.style.padding = '15px';
        }
        
        // Preserve grid layouts and prevent page breaks
        const grids = document.querySelectorAll('[class*="grid"]');
        grids.forEach(grid => {
          const gridEl = grid as HTMLElement;
          gridEl.style.pageBreakInside = 'avoid';
          gridEl.style.breakInside = 'avoid';
          gridEl.style.marginBottom = '20px';
        });
        
        // Optimize card layouts for PDF - keep them together
        const cards = document.querySelectorAll('[class*="shadow-lg"]');
        cards.forEach(card => {
          const cardEl = card as HTMLElement;
          cardEl.style.pageBreakInside = 'avoid';
          cardEl.style.breakInside = 'avoid';
          cardEl.style.marginBottom = '15px';
        });
        
        // Ensure sections stay together
        const sections = document.querySelectorAll('[id*="-section"]');
        sections.forEach(section => {
          const sectionEl = section as HTMLElement;
          sectionEl.style.pageBreakInside = 'avoid';
          sectionEl.style.breakInside = 'avoid';
          sectionEl.style.marginBottom = '20px';
        });
        
        // Add a subtle watermark to the PDF
        const watermark = document.createElement('div');
        watermark.style.position = 'fixed';
        watermark.style.bottom = '10px';
        watermark.style.right = '10px';
        watermark.style.fontSize = '10px';
        watermark.style.color = '#ccc';
        watermark.style.zIndex = '9999';
        watermark.style.fontFamily = 'Arial, sans-serif';
        watermark.innerText = `Generated on ${new Date().toLocaleString()}`;
        document.body.appendChild(watermark);
        
        // Ensure proper spacing and typography
        document.body.style.fontFamily = 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        document.body.style.lineHeight = '1.4';
        document.body.style.fontSize = '12px';
        
        // Force grid layouts to display properly
        const gridContainers = document.querySelectorAll('.grid');
        gridContainers.forEach(grid => {
          const gridEl = grid as HTMLElement;
          gridEl.style.display = 'grid';
          gridEl.style.gridTemplateColumns = '1fr 1fr';
          gridEl.style.gap = '15px';
          gridEl.style.marginBottom = '20px';
          gridEl.style.pageBreakInside = 'avoid';
          gridEl.style.breakInside = 'avoid';
        });
        
        // Optimize content containers for better flow
        const contentContainers = document.querySelectorAll('[class*="p-8"], [class*="p-6"]');
        contentContainers.forEach(container => {
          const containerEl = container as HTMLElement;
          containerEl.style.padding = '12px';
          containerEl.style.fontSize = '11px';
        });
        
        // PROFESSIONAL PDF CSS INJECTION (Blue header only, white card background)
        const pdfStyles = document.createElement('style');
        pdfStyles.textContent = `
          @media print {
            html, body {
              background: #f4f6fa !important;
              font-family: 'Inter', 'Roboto', 'Helvetica Neue', Arial, sans-serif !important;
              font-size: 12px !important;
              color: #222 !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            main {
              background: #f4f6fa !important;
              padding: 0 !important;
              margin: 0 !important;
              width: 100% !important;
              max-width: none !important;
            }
            .grid, .lg\\:grid-cols-2 {
              display: grid !important;
              grid-template-columns: 1fr 1fr !important;
              gap: 18px !important;
              margin-bottom: 0 !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            .card, .shadow-lg, .shadow-md {
              background: #fff !important;
              border-radius: 14px !important;
              border: 1px solid #e5e7eb !important;
              box-shadow: 0 2px 8px 0 rgba(30, 64, 175, 0.07) !important;
              margin-bottom: 0 !important;
              padding: 18px 20px !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            /* Only header bar is blue */
            .CardHeader, .cardHeader, .card-header, .CardHeader, .bg-gradient-to-r {
              background: linear-gradient(90deg, #2563eb 0%, #1d4ed8 100%) !important;
              color: #fff !important;
              border-top-left-radius: 14px !important;
              border-top-right-radius: 14px !important;
              border-bottom-left-radius: 0 !important;
              border-bottom-right-radius: 0 !important;
              padding: 18px 20px 12px 20px !important;
              margin: -18px -20px 16px -20px !important;
              font-size: 1.1em !important;
              font-weight: 700 !important;
              border-bottom: 3px solid #2563eb !important;
              text-color: #ffffff !important;
            }
            .CardHeader *, .cardHeader *, .card-header *, .bg-gradient-to-r * {
              color: #fff !important;
              fill: #fff !important;
              stroke: #fff !important;
              border-color: #fff !important;
              opacity: 1 !important;
              text-shadow: none !important;
              filter: none !important;
              background: none !important;
            }
            .CardHeader svg, .cardHeader svg, .card-header svg, .bg-gradient-to-r svg,
            .CardHeader path, .cardHeader path, .card-header path, .bg-gradient-to-r path {
              color: #fff !important;
              fill: #fff !important;
              stroke: #fff !important;
              opacity: 1 !important;
            }
            h2, h3, h4 {
              color: #2563eb !important;
              font-weight: 700 !important;
              margin-bottom: 4px !important;
            }
            .badge, .Badge {
              background: #e0e7ff !important;
              color: #2563eb !important;
              border-radius: 6px !important;
              font-size: 11px !important;
              padding: 2px 8px !important;
              border: none !important;
            }
            .flex, .items-center, .gap-2, .gap-3, .gap-6 {
              gap: 8px !important;
            }
            .p-8, .p-6, .p-4 {
              padding: 16px !important;
            }
            .mb-8, .mb-6, .mb-4 {
              margin-bottom: 12px !important;
            }
            .mt-6, .mt-4, .mt-3 {
              margin-top: 10px !important;
            }
            .rounded-xl, .rounded-lg {
              border-radius: 12px !important;
            }
            .text-blue-600, .text-blue-800, .text-blue-100 {
              color: #2563eb !important;
            }
            .text-gray-800, .text-gray-900, .text-gray-700 {
              color: #222 !important;
            }
            .text-yellow-300, .text-yellow-400 {
              color: #facc15 !important;
            }
            .text-white {
              color: #fff !important;
            }
            .border-0, .border {
              border: none !important;
            }
            .shadow-md {
              box-shadow: 0 1px 4px 0 rgba(30, 64, 175, 0.06) !important;
            }
            .overflow-hidden {
              overflow: visible !important;
            }
            .min-h-\[60vh\] {
              min-height: 0 !important;
            }
            .text-lg, .text-xl, .text-2xl, .text-3xl {
              font-weight: 600 !important;
            }
            .font-bold {
              font-weight: 700 !important;
            }
            .font-medium {
              font-weight: 500 !important;
            }
            .italic {
              font-style: italic !important;
            }
            .text-center {
              text-align: center !important;
            }
            .w-10, .h-10, .h-5, .w-5, .h-4, .w-4 {
              width: 24px !important;
              height: 24px !important;
            }
            .flex-col {
              flex-direction: column !important;
            }
            .flex-row {
              flex-direction: row !important;
            }
            .items-end {
              align-items: flex-end !important;
            }
            .items-start {
              align-items: flex-start !important;
            }
            .justify-between {
              justify-content: space-between !important;
            }
            .rounded-full {
              border-radius: 9999px !important;
            }
            .border-b, .border-t, .border-gray-100, .border-gray-200 {
              border: none !important;
            }
            .bg-white\/20, .bg-white\/10, .bg-white\/30 {
              background: #e0e7ff !important;
              color: #2563eb !important;
            }
            .bg-blue-500\/30 {
              background: #dbeafe !important;
              color: #2563eb !important;
            }
            .bg-yellow-100 {
              background: #fef9c3 !important;
              color: #b45309 !important;
            }
            .bg-green-100 {
              background: #dcfce7 !important;
              color: #166534 !important;
            }
            .bg-gray-100 {
              background: #f3f4f6 !important;
              color: #222 !important;
            }
            .bg-purple-500\/30 {
              background: #ede9fe !important;
              color: #7c3aed !important;
            }
            .bg-orange-500\/30 {
              background: #ffedd5 !important;
              color: #ea580c !important;
            }
            .bg-red-500\/30 {
              background: #fee2e2 !important;
              color: #dc2626 !important;
            }
            .bg-blue-100 {
              background:rgb(255, 255, 255) !important;
              color: #2563eb !important;
            }
            .footer-pdf {
              position: fixed;
              left: 0;
              bottom: 0;
              width: 100vw;
              text-align: right;
              font-size: 11px;
              color: #b0b7c3;
              padding: 8px 24px 8px 0;
              background: none;
              z-index: 9999;
            }
            /* Force all blue/gray text classes in header to white */
            .CardHeader [class*='text-blue-'], .cardHeader [class*='text-blue-'], .card-header [class*='text-blue-'], .bg-gradient-to-r [class*='text-blue-'],
            .CardHeader [class*='text-gray-'], .cardHeader [class*='text-gray-'], .card-header [class*='text-gray-'], .bg-gradient-to-r [class*='text-gray-'] {
              color: #fff !important;
              fill: #fff !important;
              stroke: #fff !important;
              opacity: 1 !important;
            }
          }
        `;
        document.head.appendChild(pdfStyles);
        // Add PDF footer
        const footer = document.createElement('div');
        footer.className = 'footer-pdf';
        footer.innerText = `LeadReport AI © ${new Date().getFullYear()}`;
        document.body.appendChild(footer);
        
        return true;
      } catch (e) {
        console.error('Client-side error:', e);
        return false;
      }
    });
    console.log('Optimized layout for PDF generation');

    // Wait a bit for all content to be properly rendered
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate the PDF with optimized settings for better layout
    console.log('Generating PDF');
    let pdfBuffer;
    try {
      pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '10px',
          right: '10px',
          bottom: '10px',
          left: '10px'
        },
        preferCSSPageSize: false,
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
        'Content-Disposition': `attachment; filename="${report.leadData.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-shared-report.pdf"`,
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