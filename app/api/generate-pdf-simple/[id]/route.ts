import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import jsPDF from 'jspdf';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const client = await clientPromise;
    const db = client.db('lead-reports');
    
    if (!params.id || !ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid report ID' }, { status: 400 });
    }

    const report = await db.collection('reports').findOne({
      _id: new ObjectId(params.id)
    });

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    const doc = new jsPDF();
    const leadData = report.leadData;
    const apolloPerson = report.apolloData?.person || {};
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

    const getAIContent = (section: string) => {
      if (!aiContent[section]) return null;
      const content = aiContent[section];
      if (typeof content === 'string') return content;
      if (content.summary) return content.summary;
      if (content.description) return content.description;
      if (content.content) return content.content;
      return JSON.stringify(content);
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
      
      if (content.currentTechnologies) {
        formattedContent += 'Current Technologies:\n';
        let techArray: any[] = [];
        if (Array.isArray(content.currentTechnologies)) {
          techArray = content.currentTechnologies;
        } else if (hasNumericKeys(content.currentTechnologies)) {
          techArray = objectToArray(content.currentTechnologies);
        } else if (typeof content.currentTechnologies === 'string') {
          techArray = [content.currentTechnologies];
        }
        techArray.forEach((tech: any) => {
          const techText = typeof tech === 'string' ? tech : JSON.stringify(tech);
          formattedContent += `• ${techText}\n`;
        });
        formattedContent += '\n';
      }
      
      if (content.painPoints) {
        formattedContent += 'Pain Points:\n';
        let pointsArray: any[] = [];
        if (Array.isArray(content.painPoints)) {
          pointsArray = content.painPoints;
        } else if (hasNumericKeys(content.painPoints)) {
          pointsArray = objectToArray(content.painPoints);
        } else if (typeof content.painPoints === 'string') {
          pointsArray = [content.painPoints];
        }
        pointsArray.forEach((point: any) => {
          const pointText = typeof point === 'string' ? point : JSON.stringify(point);
          formattedContent += `• ${pointText}\n`;
        });
        formattedContent += '\n';
      }
      
      if (content.opportunities) {
        formattedContent += 'Opportunities:\n';
        let opportunitiesArray: any[] = [];
        if (Array.isArray(content.opportunities)) {
          opportunitiesArray = content.opportunities;
        } else if (hasNumericKeys(content.opportunities)) {
          opportunitiesArray = objectToArray(content.opportunities);
        } else if (typeof content.opportunities === 'string') {
          opportunitiesArray = [content.opportunities];
        }
        opportunitiesArray.forEach((opportunity: any) => {
          const opportunityText = typeof opportunity === 'string' ? opportunity : JSON.stringify(opportunity);
          formattedContent += `• ${opportunityText}\n`;
        });
        formattedContent += '\n';
      }
      
      if (content.mainCompetitors) {
        formattedContent += 'Main Competitors:\n';
        let competitorsArray: any[] = [];
        if (Array.isArray(content.mainCompetitors)) {
          competitorsArray = content.mainCompetitors;
        } else if (hasNumericKeys(content.mainCompetitors)) {
          competitorsArray = objectToArray(content.mainCompetitors);
        } else if (typeof content.mainCompetitors === 'string') {
          competitorsArray = [content.mainCompetitors];
        }
        competitorsArray.forEach((comp: any) => {
          let compText;
          if (typeof comp === 'string') {
            compText = comp;
          } else if (typeof comp === 'object' && comp !== null) {
            compText = comp.name || comp.companyName || JSON.stringify(comp);
          } else {
            compText = JSON.stringify(comp);
          }
          formattedContent += `• ${compText}\n`;
        });
        formattedContent += '\n';
      }
      
      const recommendationsField = content.recommendations || content.recommendedActions;
      if (recommendationsField) {
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
      
      if (content.challenges) {
        formattedContent += 'Challenges:\n';
        const challenges = Array.isArray(content.challenges) ? 
          content.challenges : 
          typeof content.challenges === 'object' ? Object.values(content.challenges) : [content.challenges];
        challenges.forEach((challenge: any) => {
          const challengeText = typeof challenge === 'string' ? challenge : JSON.stringify(challenge);
          formattedContent += `• ${challengeText}\n`;
        });
        formattedContent += '\n';
      }
      
      return formattedContent.trim();
    };

    // Create sections map (same as shared report)
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
    
    if (leadData.companyDetails.industry) {
      doc.text(`Industry: ${leadData.companyDetails.industry}`, 20, yPos);
      yPos += 8;
    }
    
    if (leadData.companyDetails.employees) {
      doc.text(`Employees: ${leadData.companyDetails.employees}`, 20, yPos);
      yPos += 8;
    }
    
    if (leadData.companyDetails.headquarters) {
      doc.text(`Headquarters: ${leadData.companyDetails.headquarters}`, 20, yPos);
      yPos += 8;
    }
    
    if (leadData.companyDetails.website) {
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
    
    if (leadData.contactDetails.email) {
      doc.text(`Email: ${leadData.contactDetails.email}`, 20, yPos);
      yPos += 8;
    }
    
    if (leadData.contactDetails.phone) {
      doc.text(`Phone: ${leadData.contactDetails.phone}`, 20, yPos);
      yPos += 8;
    }
    
    if (leadData.contactDetails.linkedin) {
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
    
    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${report.leadData.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-report.pdf"`,
      },
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 