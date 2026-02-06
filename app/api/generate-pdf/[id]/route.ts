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

// jsPDF generation function
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

  // Helper to check if we need a new page
  const checkPageBreak = (spaceNeeded: number = 40): void => {
    if (yPos + spaceNeeded > 270) {
      doc.addPage();
      yPos = 20;
    }
  };

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
  yPos += 8;

  // Report owner if available
  if (report.reportOwnerName || report.email) {
    doc.text(`Report by: ${report.reportOwnerName || report.email.split('@')[0]}`, 20, yPos);
    yPos += 8;
  }
  yPos += 10;

  // Lead Score & Status
  checkPageBreak(30);
  doc.setFontSize(16);
  doc.setTextColor(30, 64, 175);
  doc.text('Lead Overview', 20, yPos);
  yPos += 10;

  doc.setFontSize(12);
  doc.setTextColor(75, 85, 99);
  
  if (leadData.leadScoring?.score) {
    doc.text(`Lead Score: ${leadData.leadScoring.score}/100`, 20, yPos);
    yPos += 8;
  }
  
  if (leadData.leadScoring?.rating) {
    doc.text(`Overall Rating: ${leadData.leadScoring.rating}/5 stars`, 20, yPos);
    yPos += 8;
  }
  
  if (leadData.status) {
    doc.text(`Status: ${leadData.status.charAt(0).toUpperCase() + leadData.status.slice(1).replace('_', ' ')}`, 20, yPos);
    yPos += 8;
  }
  yPos += 10;

  // Company Profile
  checkPageBreak(40);
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

  // Company overview from form
  if (leadData.companyOverview) {
    yPos += 5;
    doc.setFontSize(11);
    doc.setTextColor(75, 85, 99);
    const overviewLines = doc.splitTextToSize(leadData.companyOverview, 170);
    doc.text(overviewLines, 20, yPos);
    yPos += overviewLines.length * 6;
  }
  yPos += 10;

  // Contact Details
  checkPageBreak(30);
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
  yPos += 10;

  // Lead Qualification
  if (leadData.leadScoring?.qualificationCriteria && Object.keys(leadData.leadScoring.qualificationCriteria).length > 0) {
    checkPageBreak(50);
    doc.setFontSize(16);
    doc.setTextColor(30, 64, 175);
    doc.text('Lead Qualification', 20, yPos);
    yPos += 10;

    doc.setFontSize(11);
    doc.setTextColor(75, 85, 99);
    
    Object.entries(leadData.leadScoring.qualificationCriteria).forEach(([key, value]) => {
      checkPageBreak(15);
      const label = key.replace(/([A-Z])/g, ' $1').trim();
      doc.text(`${label}: ${value}`, 25, yPos);
      yPos += 7;
    });
    yPos += 10;
  }

  // Meeting Details
  if (report.meetingDate || report.meetingTime) {
    checkPageBreak(40);
    doc.setFontSize(16);
    doc.setTextColor(30, 64, 175);
    doc.text('Meeting Details', 20, yPos);
    yPos += 10;

    doc.setFontSize(12);
    doc.setTextColor(75, 85, 99);
    
    if (report.meetingDate) {
      doc.text(`Date: ${new Date(report.meetingDate).toLocaleDateString()}`, 20, yPos);
      yPos += 8;
    }
    
    if (report.meetingTime) {
      doc.text(`Time: ${report.meetingTime}${report.meetingTimezone ? ` ${report.meetingTimezone}` : ''}`, 20, yPos);
      yPos += 8;
    }
    
    if (report.meetingPlatform) {
      doc.text(`Platform: ${report.meetingPlatform}`, 20, yPos);
      yPos += 8;
    }
    
    if (report.meetingLocation) {
      doc.text(`Location: ${report.meetingLocation}`, 20, yPos);
      yPos += 8;
    }
    
    if (report.meetingAgenda || report.meetingObjective) {
      yPos += 3;
      doc.setFontSize(11);
      doc.text('Agenda:', 20, yPos);
      yPos += 6;
      const agendaLines = doc.splitTextToSize(report.meetingAgenda || report.meetingObjective, 170);
      doc.text(agendaLines, 25, yPos);
      yPos += agendaLines.length * 6;
    }
    yPos += 10;
  }

  // Strategic Brief
  if (aiContent.strategicBrief) {
    checkPageBreak(60);
    doc.setFontSize(16);
    doc.setTextColor(30, 64, 175);
    doc.text('Strategic Meeting Brief', 20, yPos);
    yPos += 10;

    doc.setFontSize(11);
    doc.setTextColor(75, 85, 99);
    
    if (aiContent.strategicBrief.primaryObjective) {
      doc.setFontSize(10);
      doc.setTextColor(107, 114, 128);
      doc.text('PRIMARY OBJECTIVE:', 20, yPos);
      yPos += 6;
      doc.setFontSize(11);
      doc.setTextColor(75, 85, 99);
      const objectiveLines = doc.splitTextToSize(aiContent.strategicBrief.primaryObjective, 170);
      doc.text(objectiveLines, 25, yPos);
      yPos += objectiveLines.length * 6 + 5;
    }
    
    if (aiContent.strategicBrief.recommendedApproach) {
      checkPageBreak(20);
      doc.setFontSize(10);
      doc.setTextColor(107, 114, 128);
      doc.text('RECOMMENDED APPROACH:', 20, yPos);
      yPos += 6;
      doc.setFontSize(11);
      doc.setTextColor(75, 85, 99);
      const approachLines = doc.splitTextToSize(aiContent.strategicBrief.recommendedApproach, 170);
      doc.text(approachLines, 25, yPos);
      yPos += approachLines.length * 6 + 5;
    }
    
    if (aiContent.strategicBrief.keyBenefits && aiContent.strategicBrief.keyBenefits.length > 0) {
      checkPageBreak(30);
      doc.setFontSize(10);
      doc.setTextColor(107, 114, 128);
      doc.text('KEY BENEFITS:', 20, yPos);
      yPos += 6;
      doc.setFontSize(11);
      doc.setTextColor(75, 85, 99);
      aiContent.strategicBrief.keyBenefits.forEach((benefit: string) => {
        checkPageBreak(10);
        const benefitLines = doc.splitTextToSize(`• ${benefit}`, 170);
        doc.text(benefitLines, 25, yPos);
        yPos += benefitLines.length * 6;
      });
      yPos += 5;
    }
    
    if (aiContent.strategicBrief.criticalDiscipline) {
      checkPageBreak(20);
      doc.setFontSize(10);
      doc.setTextColor(220, 38, 38);
      doc.text('!! CRITICAL DISCIPLINE:', 20, yPos);
      yPos += 6;
      doc.setFontSize(11);
      doc.setTextColor(75, 85, 99);
      const disciplineLines = doc.splitTextToSize(aiContent.strategicBrief.criticalDiscipline, 170);
      doc.text(disciplineLines, 25, yPos);
      yPos += disciplineLines.length * 6;
    }
    yPos += 10;
  }

  // Engagement Timeline
  if (leadData.engagementTimeline && Array.isArray(leadData.engagementTimeline) && leadData.engagementTimeline.length > 0) {
    checkPageBreak(40);
    doc.setFontSize(16);
    doc.setTextColor(30, 64, 175);
    doc.text('Engagement Timeline', 20, yPos);
    yPos += 10;

    doc.setFontSize(11);
    doc.setTextColor(75, 85, 99);
    
    leadData.engagementTimeline
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
      .forEach((activity: any) => {
        checkPageBreak(15);
        const typeLabel = activity.type.charAt(0).toUpperCase() + activity.type.slice(1);
        const dateStr = new Date(activity.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        doc.setFontSize(10);
        doc.setTextColor(107, 114, 128);
        doc.text(`${dateStr} - ${typeLabel}`, 20, yPos);
        yPos += 6;
        doc.setFontSize(11);
        doc.setTextColor(75, 85, 99);
        const contentLines = doc.splitTextToSize(activity.content, 170);
        doc.text(contentLines, 25, yPos);
        yPos += contentLines.length * 6 + 3;
      });
    yPos += 10;
  }

  // Notes
  if (leadData.notes && Array.isArray(leadData.notes) && leadData.notes.length > 0) {
    checkPageBreak(40);
    doc.setFontSize(16);
    doc.setTextColor(30, 64, 175);
    doc.text('Internal Notes', 20, yPos);
    yPos += 10;

    doc.setFontSize(11);
    doc.setTextColor(75, 85, 99);
    
    leadData.notes.forEach((note: any) => {
      checkPageBreak(20);
      const dateStr = new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      doc.setFontSize(10);
      doc.setTextColor(107, 114, 128);
      doc.text(`${dateStr}:`, 20, yPos);
      yPos += 6;
      doc.setFontSize(11);
      doc.setTextColor(75, 85, 99);
      const noteLines = doc.splitTextToSize(note.content, 170);
      doc.text(noteLines, 25, yPos);
      yPos += noteLines.length * 6 + 5;
    });
    yPos += 10;
  }
  yPos += 5;

  // Add sections function with consistent page break logic
  const addSection = (title: string, content: any, startY: number): number => {
    let y = startY;
    
    // Check if we need a new page for the section header
    if (y + 50 > 270) {
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
    
    doc.setFontSize(11);
    doc.setTextColor(75, 85, 99);
    
    if (!content) {
      doc.text('No information available', 20, y);
      return y + 10;
    }
    
    const formattedContent = formatSectionContent(content);
    if (formattedContent) {
      const textLines = doc.splitTextToSize(formattedContent, 170);
      
      // Add lines with page break checking
      textLines.forEach((line: string, index: number) => {
        if (y + 10 > 270) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, 20, y);
        y += 6;
      });
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

// Improved Puppeteer PDF generation with print-optimized rendering
async function generatePuppeteerPDF(reportId: string): Promise<Buffer | null> {
  let browser = null;
  
  try {
    console.log('Starting Puppeteer PDF generation');
    
    // Launch browser with optimized settings
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu'
      ]
    });
    
    const page = await browser.newPage();
    
    // Set timeouts
    await page.setDefaultNavigationTimeout(60000);
    await page.setDefaultTimeout(60000);
    
    // Set viewport to match print layout - wider for grid
    await page.setViewport({
      width: 1400,
      height: 1200,
      deviceScaleFactor: 1.5 // Good balance of quality and file size
    });
    
    // Navigate to the report page
    const baseUrl = getBaseUrl();
    const reportUrl = `${baseUrl}/report/${reportId}`;
    console.log(`Navigating to: ${reportUrl}`);
    
    await page.goto(reportUrl, { 
      waitUntil: 'networkidle0',
      timeout: 45000
    });
    
    // Wait for main content
    console.log('Waiting for content to load');
    await page.waitForSelector('main', { timeout: 15000 });
    
    // Wait for any images to load
    await page.evaluate(() => {
      return Promise.all(
        Array.from(document.images)
          .filter(img => !img.complete)
          .map(img => new Promise(resolve => {
            img.onload = img.onerror = resolve;
          }))
      );
    });
    
    // Additional wait for any dynamic content
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Prepare page for printing - compact grid layout
    await page.evaluate(() => {
      // Add compact print styles
      const style = document.createElement('style');
      style.textContent = `
        /* Compact layout for PDF */
        body {
          overflow: visible !important;
          height: auto !important;
          zoom: 0.75; /* Scale down everything by 25% */
        }
        
        /* Keep grid layout intact */
        .grid-cols-12 {
          display: grid !important;
          grid-template-columns: repeat(12, minmax(0, 1fr)) !important;
          gap: 12px !important;
        }
        
        /* Reduce card padding and spacing */
        .apple-card {
          padding: 12px !important;
          margin-bottom: 10px !important;
          border-radius: 12px !important;
        }
        
        /* Compact text sizing */
        h1 { font-size: 20px !important; line-height: 1.2 !important; }
        h2 { font-size: 16px !important; line-height: 1.3 !important; }
        h3 { font-size: 14px !important; line-height: 1.3 !important; }
        h4 { font-size: 12px !important; line-height: 1.3 !important; }
        p, div, span { font-size: 11px !important; line-height: 1.4 !important; }
        
        /* Reduce spacing */
        .space-y-4 > * + * { margin-top: 8px !important; }
        .space-y-3 > * + * { margin-top: 6px !important; }
        .space-y-2 > * + * { margin-top: 4px !important; }
        .gap-4 { gap: 8px !important; }
        .gap-3 { gap: 6px !important; }
        
        /* Compact section padding */
        .section-tint {
          padding: 8px !important;
          margin-bottom: 8px !important;
        }
        
        /* Main container */
        main {
          margin-top: 0 !important;
          padding: 20px !important;
          max-width: 100% !important;
          overflow: visible !important;
          height: auto !important;
        }
        
        .h-screen {
          height: auto !important;
          overflow: visible !important;
        }
        
        /* Compact badges and small elements */
        .text-xs { font-size: 9px !important; }
        .text-sm { font-size: 10px !important; }
        
        /* Profile images smaller */
        img[alt*="profile" i] {
          max-width: 60px !important;
          max-height: 60px !important;
        }
      `;
      document.head.appendChild(style);
      
      // Hide interactive elements
      const selectorsToHide = [
        'header',
        'button:not([data-print-keep])',
        '[data-print-hide]',
        '.print\\:hidden'
      ];
      
      selectorsToHide.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
          if (el instanceof HTMLElement) {
            el.style.display = 'none';
          }
        });
      });
      
      // Expand all collapsibles
      const collapsibles = document.querySelectorAll('[data-state="closed"]');
      collapsibles.forEach(el => {
        if (el instanceof HTMLElement) {
          el.setAttribute('data-state', 'open');
        }
      });
      
      // Show all tab content
      document.querySelectorAll('[role="tabpanel"]').forEach(panel => {
        if (panel instanceof HTMLElement) {
          panel.style.display = 'block';
          panel.style.marginBottom = '12px';
        }
      });
    });
    
    // Get the full height of the page content
    const contentHeight = await page.evaluate(() => {
      return document.documentElement.scrollHeight;
    });
    
    console.log(`Content height: ${contentHeight}px`);
    
    // Use wider custom page size to accommodate grid layout
    // 297mm = A4 landscape width (or A4 height)
    const pdfBuffer = await page.pdf({
      width: '297mm', // A4 landscape width - wider for grid
      height: `${Math.max(contentHeight + 100, 1000)}px`, // Dynamic height based on content
      printBackground: true,
      margin: {
        top: '30px',
        right: '30px',
        bottom: '30px',
        left: '30px'
      },
      preferCSSPageSize: false,
      displayHeaderFooter: false // No page numbers for single-page PDF
    });
    
    await browser.close();
    console.log('Puppeteer PDF generated successfully');
    
    return Buffer.from(pdfBuffer);
  } catch (error) {
    console.error('Puppeteer PDF generation failed:', error);
    
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`PDF generation started for report: ${id}`);
    
    // Connect to database
    const client = await clientPromise;
    const db = client.db('lead-reports');
    
    // Validate report ID
    if (!id || !ObjectId.isValid(id)) {
      console.error(`Invalid report ID: ${id}`);
      return NextResponse.json({ error: 'Invalid report ID' }, { status: 400 });
    }

    // Get report from database
    console.log(`Fetching report from database: ${id}`);
    const report = await db.collection('reports').findOne({
      _id: new ObjectId(id)
    });

    if (!report) {
      console.error(`Report not found: ${id}`);
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Try Puppeteer first, fall back to jsPDF if it fails
    console.log('Attempting Puppeteer PDF generation');
    const puppeteerPdf = await generatePuppeteerPDF(id);
    
    if (puppeteerPdf) {
      console.log('Puppeteer PDF generation successful');
      return new NextResponse(puppeteerPdf, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${report.leadData.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-report.pdf"`,
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
        'Content-Disposition': `attachment; filename="${report.leadData.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-report.pdf"`,
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