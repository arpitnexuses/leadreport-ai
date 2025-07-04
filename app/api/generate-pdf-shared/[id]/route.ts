import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import puppeteer from 'puppeteer';
import jsPDF from 'jspdf';

// Helper function to get base URL
function getBaseUrl() {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3000' 
    : `https://${process.env.NEXT_PUBLIC_VERCEL_URL || 'localhost:3000'}`;
}

// Fallback PDF generation using jsPDF
async function generateSimplePDF(report: any): Promise<Buffer> {
  const doc = new jsPDF();
  const leadData = report.leadData;
  const aiContent = report.aiContent || {};

  // Helper functions
  const hasNumericKeys = (obj: any): boolean => {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return false;
    return Object.keys(obj).every(key => !isNaN(Number(key)));
  };

  const objectToArray = (obj: any): any[] => {
    if (!hasNumericKeys(obj)) return [];
    return Object.values(obj);
  };

  const hasSectionData = (section: string) => {
    const content = aiContent[section];
    if (!content) return false;
    if (typeof content === 'string') return content.trim().length > 0;
    if (typeof content === 'object' && content !== null) {
      return Object.keys(content).some(key => {
        const value = content[key];
        if (typeof value === 'string') return value.trim().length > 0;
        if (Array.isArray(value)) return value.length > 0;
        if (typeof value === 'object' && value !== null) return Object.keys(value).length > 0;
        return value !== null && value !== undefined;
      });
    }
    return false;
  };

  const formatSectionContent = (content: any): string => {
    if (!content) return '';
    if (typeof content === 'string') return content;
    
    let formattedContent = '';
    
    if (content.summary) formattedContent += content.summary + '\n\n';
    if (content.description) formattedContent += content.description + '\n\n';
    if (content.content) formattedContent += content.content + '\n\n';
    
    if (content.keyPoints) {
      formattedContent += 'Key Points:\n';
      const points = Array.isArray(content.keyPoints) ? 
        content.keyPoints : 
        typeof content.keyPoints === 'object' ? Object.values(content.keyPoints) : [content.keyPoints];
      points.forEach((point: any) => {
        const pointText = typeof point === 'string' ? point : JSON.stringify(point);
        formattedContent += `• ${pointText}\n`;
      });
      formattedContent += '\n';
    }
    
    if (content.recommendations || content.recommendedActions) {
      const recommendationsField = content.recommendations || content.recommendedActions;
      formattedContent += 'Recommendations:\n';
      const recommendations = Array.isArray(recommendationsField) ? 
        recommendationsField : 
        typeof recommendationsField === 'object' ? Object.values(recommendationsField) : [recommendationsField];
      recommendations.forEach((rec: any) => {
        if (typeof rec === 'string') {
          formattedContent += `• ${rec}\n`;
        } else if (rec && typeof rec === 'object') {
          const recObj = rec as Record<string, any>;
          const recText = recObj.title || recObj.description || '';
          if (recText) {
            formattedContent += `• ${recText}\n`;
            if (recObj.rationale) {
              formattedContent += `  Rationale: ${recObj.rationale}\n`;
            }
            if (recObj.priority) {
              formattedContent += `  Priority: ${recObj.priority}\n`;
            }
          }
        }
      });
      formattedContent += '\n';
    }
    
    return formattedContent.trim();
  };

  // Create sections map
  const sectionsToRender: Record<string, boolean> = {};
  Object.keys(aiContent).forEach(section => {
    const hasData = hasSectionData(section);
    const isToggledOn = report.sections ? report.sections[section] !== false : true;
    sectionsToRender[section] = hasData && isToggledOn;
  });

  let yPos = 20;

  // Header
  doc.setFontSize(24);
  doc.setTextColor(30, 64, 175);
  doc.text(`${leadData.name} - Lead Report`, 20, yPos);
  yPos += 15;

  doc.setFontSize(14);
  doc.setTextColor(75, 85, 99);
  doc.text(`${leadData.position} at ${leadData.companyName}`, 20, yPos);
  yPos += 10;

  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128);
  doc.text(`Generated on ${new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })}`, 20, yPos);
  yPos += 20;

  // Company Profile
  doc.setFontSize(16);
  doc.setTextColor(30, 64, 175);
  doc.text('Company Profile', 20, yPos);
  yPos += 10;

  doc.setFontSize(12);
  doc.setTextColor(75, 85, 99);
  
  if (leadData.companyDetails?.industry) {
    doc.text(`Industry: ${leadData.companyDetails.industry}`, 20, yPos);
    yPos += 8;
  }
  
  if (leadData.companyDetails?.employees) {
    doc.text(`Employees: ${leadData.companyDetails.employees}`, 20, yPos);
    yPos += 8;
  }
  
  if (leadData.companyDetails?.headquarters) {
    doc.text(`Headquarters: ${leadData.companyDetails.headquarters}`, 20, yPos);
    yPos += 8;
  }
  
  if (leadData.companyDetails?.website) {
    doc.text(`Website: ${leadData.companyDetails.website}`, 20, yPos);
    yPos += 8;
  }
  yPos += 10;

  // Contact Details
  doc.setFontSize(16);
  doc.setTextColor(30, 64, 175);
  doc.text('Contact Details', 20, yPos);
  yPos += 10;

  doc.setFontSize(12);
  doc.setTextColor(75, 85, 99);
  
  if (leadData.contactDetails?.email) {
    doc.text(`Email: ${leadData.contactDetails.email}`, 20, yPos);
    yPos += 8;
  }
  
  if (leadData.contactDetails?.phone) {
    doc.text(`Phone: ${leadData.contactDetails.phone}`, 20, yPos);
    yPos += 8;
  }
  
  if (leadData.contactDetails?.linkedin) {
    doc.text(`LinkedIn: ${leadData.contactDetails.linkedin}`, 20, yPos);
    yPos += 8;
  }
  yPos += 15;

  // Add sections function
  const addSection = (title: string, content: any, startY: number): number => {
    let y = startY;
    
    if (y > 250) {
      doc.addPage();
      y = 20;
    }
    
    // Section header with blue background
    doc.setFillColor(30, 64, 175);
    doc.rect(15, y - 5, 180, 12, 'F');
    
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text(title, 20, y + 2);
    y += 15;
    
    doc.setFontSize(12);
    doc.setTextColor(75, 85, 99);
    
    if (!content) {
      doc.text('No information available', 20, y);
      return y + 10;
    }
    
    const formattedContent = formatSectionContent(content);
    if (formattedContent) {
      const textLines = doc.splitTextToSize(formattedContent, 170);
      doc.text(textLines, 20, y);
      y += textLines.length * 7;
    }
    
    return y + 10;
  };

  // Add sections in same order as shared report
  const sectionOrder = ['overview', 'company', 'competitors', 'techStack', 'meeting', 'news', 'interactions', 'nextSteps'];
  
  sectionOrder.forEach(section => {
    if (sectionsToRender[section]) {
      const sectionTitles = {
        overview: 'Overview',
        company: 'Company Analysis',
        competitors: 'Competitive Analysis',
        techStack: 'Technology Stack',
        meeting: 'Meeting Information',
        news: 'News & Updates',
        interactions: 'Interactions',
        nextSteps: 'Next Steps'
      };
      
      yPos = addSection(sectionTitles[section as keyof typeof sectionTitles], aiContent[section], yPos);
    }
  });

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${pageCount} - © ${new Date().getFullYear()} Lead Report AI`,
      20,
      doc.internal.pageSize.height - 10
    );
  }
  
  const pdfBuffer = doc.output('arraybuffer');
  return Buffer.from(pdfBuffer);
}

// Improved Puppeteer PDF generation
async function generatePuppeteerPDF(reportId: string): Promise<Buffer | null> {
  let browser = null;
  
  try {
    console.log('Attempting Puppeteer PDF generation with basic approach');
    
    // Launch browser with minimal configuration
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    // Create a new page
    const page = await browser.newPage();
    
    // Set longer timeouts
    await page.setDefaultNavigationTimeout(60000);
    await page.setDefaultTimeout(60000);
    
    // Set viewport
    await page.setViewport({
      width: 1200,
      height: 800,
      deviceScaleFactor: 1
    });
    
    // Navigate directly to the page
    const baseUrl = getBaseUrl();
    const reportUrl = `${baseUrl}/shared-report/${reportId}`;
    console.log(`Navigating to: ${reportUrl}`);
    
    // Navigate with basic settings
    await page.goto(reportUrl, { 
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // Wait for content to load
    console.log('Waiting for content to load');
    await page.waitForSelector('main', { timeout: 10000 });
    
    // Add a delay to ensure everything is rendered
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Hide elements that shouldn't be in the PDF
    await page.evaluate(() => {
      // Hide navigation elements
      const elements = document.querySelectorAll('nav, header, footer, [role="navigation"], button');
      elements.forEach(el => {
        if (el instanceof HTMLElement) {
          el.style.display = 'none';
        }
      });
      
      // Add watermark
      const watermark = document.createElement('div');
      watermark.style.position = 'fixed';
      watermark.style.bottom = '10px';
      watermark.style.right = '10px';
      watermark.style.fontSize = '10px';
      watermark.style.color = '#aaa';
      watermark.innerText = `Generated on ${new Date().toLocaleString()}`;
      document.body.appendChild(watermark);
    });
    
    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
    });
    
    // Close browser
    await browser.close();
    
    return Buffer.from(pdfBuffer);
  } catch (error) {
    console.error('Puppeteer PDF generation failed:', error);
    
    // Ensure browser is closed on error
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('Error closing browser:', closeError);
      }
    }
    
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`PDF generation started for shared report: ${params.id}`);
    
    // Connect to database
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

    // Try Puppeteer first, fall back to jsPDF if it fails
    console.log('Attempting Puppeteer PDF generation');
    const puppeteerPdf = await generatePuppeteerPDF(params.id);
    
    if (puppeteerPdf) {
      console.log('Puppeteer PDF generation successful');
      return new NextResponse(puppeteerPdf, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${report.leadData.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-shared-report.pdf"`,
        },
      });
    }
    
    // Fallback to jsPDF
    console.log('Falling back to jsPDF');
    const jspdfBuffer = await generateSimplePDF(report);
    console.log('jsPDF generation successful');
    
    return new NextResponse(jspdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${report.leadData.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-shared-report.pdf"`,
      },
    });
  } catch (error: unknown) {
    console.error('API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate PDF', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 