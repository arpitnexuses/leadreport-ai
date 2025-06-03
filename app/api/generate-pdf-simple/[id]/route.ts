import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import jsPDF from 'jspdf';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Connect to database using the clientPromise
    const client = await clientPromise;
    const db = client.db('lead-reports');
    
    // Validate report ID
    if (!params.id || !ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid report ID' }, { status: 400 });
    }

    // Get report from database
    const report = await db.collection('reports').findOne({
      _id: new ObjectId(params.id)
    });

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Generate a simple PDF
    
    // Create a new PDF document
    const doc = new jsPDF();
    const leadData = report.leadData;
    
    // Add title
    doc.setFontSize(22);
    doc.setTextColor(0, 51, 153);
    doc.text(`${leadData.name} - Lead Report`, 20, 20);
    
    // Add subtitle
    doc.setFontSize(14);
    doc.setTextColor(80, 80, 80);
    doc.text(`${leadData.position} at ${leadData.companyName}`, 20, 30);
    
    // Add generation date
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 20, 40);
    
    // Contact information
    doc.setFontSize(16);
    doc.setTextColor(0, 51, 153);
    doc.text(`Contact Information`, 20, 55);
    
    doc.setFontSize(12);
    doc.setTextColor(80, 80, 80);
    let yPos = 65;
    
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
    
    yPos += 10;
    
    // Add sections from AI content
    const aiContent = report.aiContent || {};
    
    // Helper function to clean up JSON string formatting
    const cleanJsonString = (jsonStr: string): string => {
      // Remove quotes around property names and values
      return jsonStr
        .replace(/"([^"]+)":/g, '$1:')  // Remove quotes around property names
        .replace(/[:,]\s*"([^"]+)"/g, (match, p1) => match.replace(`"${p1}"`, p1))  // Remove quotes around property values
        .replace(/^{|}$/g, '')  // Remove outer braces
        .replace(/^\[|\]$/g, ''); // Remove outer brackets
    };
    
    // Fix for font handling in jsPDF - these functions replace the problematic setFont calls
    const setBoldFont = (doc: any) => {
      doc.setFont('helvetica', 'bold');
    };
    
    const setNormalFont = (doc: any) => {
      doc.setFont('helvetica', 'normal');
    };
    
    // Helper function to determine if an object has numeric keys
    const hasNumericKeys = (obj: any): boolean => {
      if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return false;
      return Object.keys(obj).every(key => !isNaN(Number(key)));
    };
    
    // Helper function to convert an object with numeric keys to an array
    const objectToArray = (obj: any): any[] => {
      if (!hasNumericKeys(obj)) return [];
      return Object.values(obj);
    };
    
    // Helper function to add a section
    const addSection = (title: string, content: any, startY: number): number => {
      let y = startY;
      
      // Add section title
      doc.setFontSize(16);
      doc.setTextColor(0, 51, 153);
      doc.text(title, 20, y);
      y += 10;
      
      // Check if we need a new page
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      
      // Add section content
      doc.setFontSize(12);
      doc.setTextColor(80, 80, 80);
      
      if (!content) {
        doc.text('No information available', 20, y);
        return y + 10;
      }
      
      if (typeof content === 'string') {
        // Split text into lines that fit on the page
        const textLines = doc.splitTextToSize(content, 170);
        doc.text(textLines, 20, y);
        y += textLines.length * 7;
        return y;
      }
      
      // Handle current technologies - special case for Tech Stack
      if (content.currentTechnologies) {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        
        setBoldFont(doc);
        doc.text('Current Technologies:', 20, y);
        y += 7;
        setNormalFont(doc);
        
        // Check if currentTechnologies is an object with numeric keys
        let techArray: any[] = [];
        if (Array.isArray(content.currentTechnologies)) {
          techArray = content.currentTechnologies;
        } else if (hasNumericKeys(content.currentTechnologies)) {
          techArray = objectToArray(content.currentTechnologies);
        } else if (typeof content.currentTechnologies === 'object') {
          // Handle object format (may have key-value pairs)
          Object.entries(content.currentTechnologies).forEach(([key, value]) => {
            if (y > 270) {
              doc.addPage();
              y = 20;
            }
            
            const techText = typeof value === 'string' ? value : JSON.stringify(value);
            const techLines = doc.splitTextToSize(`• ${techText}`, 160);
            doc.text(techLines, 25, y);
            y += techLines.length * 7 + 3;
          });
          
          // Skip the array processing below since we've already handled it
          techArray = [];
        } else if (typeof content.currentTechnologies === 'string') {
          techArray = [content.currentTechnologies];
        }
        
        // Process the technology array
        techArray.forEach((tech: any) => {
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
          
          let techText = typeof tech === 'string' ? tech : JSON.stringify(tech);
          if (techText.startsWith('{') || techText.startsWith('[')) {
            techText = cleanJsonString(techText);
          }
          
          const techLines = doc.splitTextToSize(`• ${techText}`, 160);
          doc.text(techLines, 25, y);
          y += techLines.length * 7 + 3;
        });
        
        y += 2;
      }
      
      // Handle pain points - special case for Tech Stack
      if (content.painPoints) {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        
        setBoldFont(doc);
        doc.text('Pain Points:', 20, y);
        y += 7;
        setNormalFont(doc);
        
        // Check if painPoints is an object with numeric keys
        let pointsArray: any[] = [];
        if (Array.isArray(content.painPoints)) {
          pointsArray = content.painPoints;
        } else if (hasNumericKeys(content.painPoints)) {
          pointsArray = objectToArray(content.painPoints);
        } else if (typeof content.painPoints === 'object') {
          // Handle object format (may have key-value pairs)
          Object.entries(content.painPoints).forEach(([key, value]) => {
            if (y > 270) {
              doc.addPage();
              y = 20;
            }
            
            const pointText = typeof value === 'string' ? value : JSON.stringify(value);
            const pointLines = doc.splitTextToSize(`• ${pointText}`, 160);
            doc.text(pointLines, 25, y);
            y += pointLines.length * 7 + 3;
          });
          
          // Skip the array processing below since we've already handled it
          pointsArray = [];
        } else if (typeof content.painPoints === 'string') {
          pointsArray = [content.painPoints];
        }
        
        // Process the pain points array
        pointsArray.forEach((point: any) => {
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
          
          let pointText = typeof point === 'string' ? point : JSON.stringify(point);
          if (pointText.startsWith('{') || pointText.startsWith('[')) {
            pointText = cleanJsonString(pointText);
          }
          
          const pointLines = doc.splitTextToSize(`• ${pointText}`, 160);
          doc.text(pointLines, 25, y);
          y += pointLines.length * 7 + 3;
        });
        
        y += 2;
      }
      
      // Handle summary
      if (content.summary) {
        setBoldFont(doc);
        const summaryLines = doc.splitTextToSize(content.summary, 170);
        doc.text(summaryLines, 20, y);
        y += summaryLines.length * 7 + 5;
      }
      
      // Reset font
      setNormalFont(doc);
      
      // Handle key points
      if (content.keyPoints) {
        doc.text('Key Points:', 20, y);
        y += 7;
        
        // Handle different formats of keyPoints
        const points = Array.isArray(content.keyPoints) ? 
          content.keyPoints : 
          typeof content.keyPoints === 'object' ? Object.values(content.keyPoints) : [content.keyPoints];
        
        points.forEach((point: any) => {
          // Check if we need a new page
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
          
          let pointText = typeof point === 'string' ? point : JSON.stringify(point);
          if (pointText.startsWith('{') || pointText.startsWith('[')) {
            pointText = cleanJsonString(pointText);
          }
          
          const pointLines = doc.splitTextToSize(`• ${pointText}`, 160);
          doc.text(pointLines, 25, y);
          y += pointLines.length * 7 + 3;
        });
      }
      
      // Handle description or content
      if (content.description && typeof content.description === 'string') {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        
        const descLines = doc.splitTextToSize(content.description, 170);
        doc.text(descLines, 20, y);
        y += descLines.length * 7 + 5;
      } else if (content.content && typeof content.content === 'string') {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        
        const contentLines = doc.splitTextToSize(content.content, 170);
        doc.text(contentLines, 20, y);
        y += contentLines.length * 7 + 5;
      }
      
      // Handle mainCompetitors
      if (content.mainCompetitors) {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        
        setBoldFont(doc);
        doc.text('Main Competitors:', 20, y);
        y += 7;
        setNormalFont(doc);
        
        // Handle different formats of mainCompetitors
        let competitorsArray: any[] = [];
        if (Array.isArray(content.mainCompetitors)) {
          competitorsArray = content.mainCompetitors;
        } else if (hasNumericKeys(content.mainCompetitors)) {
          competitorsArray = objectToArray(content.mainCompetitors);
        } else if (typeof content.mainCompetitors === 'object') {
          // Handle object format (may have key-value pairs)
          Object.entries(content.mainCompetitors).forEach(([key, value]) => {
            if (y > 270) {
              doc.addPage();
              y = 20;
            }
            
            let compText;
            if (typeof value === 'string') {
              compText = value;
            } else if (typeof value === 'object' && value !== null) {
              // Use type assertion to access properties safely
              const objValue = value as Record<string, any>;
              compText = objValue.name || objValue.companyName || JSON.stringify(value);
              if (compText.startsWith('{') || compText.startsWith('[')) {
                compText = cleanJsonString(compText);
              }
            } else {
              compText = JSON.stringify(value);
              if (compText.startsWith('{') || compText.startsWith('[')) {
                compText = cleanJsonString(compText);
              }
            }
            
            const compLines = doc.splitTextToSize(`• ${compText}`, 160);
            doc.text(compLines, 25, y);
            y += compLines.length * 7 + 3;
          });
          
          // Skip the array processing below since we've already handled it
          competitorsArray = [];
        } else if (typeof content.mainCompetitors === 'string') {
          competitorsArray = [content.mainCompetitors];
        }
        
        // Process the competitors array
        competitorsArray.forEach((comp: any) => {
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
          
          let compText;
          if (typeof comp === 'string') {
            compText = comp;
          } else if (typeof comp === 'object' && comp !== null) {
            // Type assertion for safe property access
            const compObj = comp as Record<string, any>;
            compText = compObj.name || compObj.companyName || JSON.stringify(comp);
            if (compText.startsWith('{') || compText.startsWith('[')) {
              compText = cleanJsonString(compText);
            }
          } else {
            compText = JSON.stringify(comp);
            if (compText.startsWith('{') || compText.startsWith('[')) {
              compText = cleanJsonString(compText);
            }
          }
          
          const compLines = doc.splitTextToSize(`• ${compText}`, 160);
          doc.text(compLines, 25, y);
          y += compLines.length * 7 + 3;
        });
        
        y += 2;
      }
      
      // Handle recommendations or recommendedActions
      const recommendationsField = content.recommendations || content.recommendedActions;
      if (recommendationsField) {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        
        setBoldFont(doc);
        doc.text('Recommendations:', 20, y);
        y += 7;
        setNormalFont(doc);
        
        const recommendations = Array.isArray(recommendationsField) ? 
          recommendationsField : 
          typeof recommendationsField === 'object' ? Object.values(recommendationsField) : [recommendationsField];
        
        recommendations.forEach((rec: any) => {
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
          
          if (typeof rec === 'string') {
            const recLines = doc.splitTextToSize(`• ${rec}`, 160);
            doc.text(recLines, 25, y);
            y += recLines.length * 7 + 3;
          } else if (rec && typeof rec === 'object') {
            // Handle complex recommendation object
            let recText = '';
            const recObj = rec as Record<string, any>;
            recText = recObj.title || recObj.description || '';
            if (!recText) {
              recText = cleanJsonString(JSON.stringify(rec));
            }
            
            setBoldFont(doc);
            const recTitleLines = doc.splitTextToSize(`• ${recText}`, 160);
            doc.text(recTitleLines, 25, y);
            y += recTitleLines.length * 7 + 1;
            setNormalFont(doc);
            
            // Handle rationale
            if (recObj.rationale) {
              const rationaleLines = doc.splitTextToSize(`  Rationale: ${recObj.rationale}`, 155);
              doc.text(rationaleLines, 30, y);
              y += rationaleLines.length * 7 + 1;
            }
            
            // Handle priority
            if (recObj.priority) {
              const priorityLines = doc.splitTextToSize(`  Priority: ${recObj.priority}`, 155);
              doc.text(priorityLines, 30, y);
              y += priorityLines.length * 7 + 3;
            }
            
            y += 2; // Add some extra space between recommendations
          }
        });
      }
      
      // Handle challenges
      if (content.challenges) {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        
        setBoldFont(doc);
        doc.text('Challenges:', 20, y);
        y += 7;
        setNormalFont(doc);
        
        const challenges = Array.isArray(content.challenges) ? 
          content.challenges : 
          typeof content.challenges === 'object' ? Object.values(content.challenges) : [content.challenges];
        
        challenges.forEach((challenge: any) => {
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
          
          let challengeText = typeof challenge === 'string' ? challenge : JSON.stringify(challenge);
          if (challengeText.startsWith('{') || challengeText.startsWith('[')) {
            challengeText = cleanJsonString(challengeText);
          }
          
          const challengeLines = doc.splitTextToSize(`• ${challengeText}`, 160);
          doc.text(challengeLines, 25, y);
          y += challengeLines.length * 7 + 3;
        });
      }
      
      // Handle opportunities
      if (content.opportunities) {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        
        setBoldFont(doc);
        doc.text('Opportunities:', 20, y);
        y += 7;
        setNormalFont(doc);
        
        // Check different formats of opportunities
        let opportunitiesArray: any[] = [];
        if (Array.isArray(content.opportunities)) {
          opportunitiesArray = content.opportunities;
        } else if (hasNumericKeys(content.opportunities)) {
          opportunitiesArray = objectToArray(content.opportunities);
        } else if (typeof content.opportunities === 'object') {
          // Handle object format (may have key-value pairs)
          Object.entries(content.opportunities).forEach(([key, value]) => {
            if (y > 270) {
              doc.addPage();
              y = 20;
            }
            
            const opportunityText = typeof value === 'string' ? value : JSON.stringify(value);
            const opportunityLines = doc.splitTextToSize(`• ${opportunityText}`, 160);
            doc.text(opportunityLines, 25, y);
            y += opportunityLines.length * 7 + 3;
          });
          
          // Skip the array processing below since we've already handled it
          opportunitiesArray = [];
        } else if (typeof content.opportunities === 'string') {
          opportunitiesArray = [content.opportunities];
        }
        
        // Process the opportunities array
        opportunitiesArray.forEach((opportunity: any) => {
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
          
          let opportunityText = typeof opportunity === 'string' ? opportunity : JSON.stringify(opportunity);
          if (opportunityText.startsWith('{') || opportunityText.startsWith('[')) {
            opportunityText = cleanJsonString(opportunityText);
          }
          
          const opportunityLines = doc.splitTextToSize(`• ${opportunityText}`, 160);
          doc.text(opportunityLines, 25, y);
          y += opportunityLines.length * 7 + 3;
        });
        
        y += 2;
      }
      
      // Handle dosDonts
      if (content.dosDonts) {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        
        setBoldFont(doc);
        doc.text('Dos and Don\'ts:', 20, y);
        y += 7;
        setNormalFont(doc);
        
        if (typeof content.dosDonts === 'object' && content.dosDonts !== null) {
          const dosDontsObj = content.dosDonts as Record<string, any>;
          
          // Handle 'do' items
          if (dosDontsObj.do) {
            setBoldFont(doc);
            doc.text('Do:', 25, y);
            y += 7;
            setNormalFont(doc);
            
            const doItems = Array.isArray(dosDontsObj.do) ? 
              dosDontsObj.do : 
              hasNumericKeys(dosDontsObj.do) ? objectToArray(dosDontsObj.do) : [dosDontsObj.do];
            
            doItems.forEach((item: any) => {
              if (y > 270) {
                doc.addPage();
                y = 20;
              }
              
              let itemText = typeof item === 'string' ? item : JSON.stringify(item);
              if (itemText.startsWith('{') || itemText.startsWith('[')) {
                itemText = cleanJsonString(itemText);
              }
              
              const itemLines = doc.splitTextToSize(`• ${itemText}`, 155);
              doc.text(itemLines, 30, y);
              y += itemLines.length * 7 + 3;
            });
          }
          
          // Handle 'dont' items
          if (dosDontsObj.dont) {
            if (y > 270) {
              doc.addPage();
              y = 20;
            }
            
            setBoldFont(doc);
            doc.text('Don\'t:', 25, y);
            y += 7;
            setNormalFont(doc);
            
            const dontItems = Array.isArray(dosDontsObj.dont) ? 
              dosDontsObj.dont : 
              hasNumericKeys(dosDontsObj.dont) ? objectToArray(dosDontsObj.dont) : [dosDontsObj.dont];
            
            dontItems.forEach((item: any) => {
              if (y > 270) {
                doc.addPage();
                y = 20;
              }
              
              let itemText = typeof item === 'string' ? item : JSON.stringify(item);
              if (itemText.startsWith('{') || itemText.startsWith('[')) {
                itemText = cleanJsonString(itemText);
              }
              
              const itemLines = doc.splitTextToSize(`• ${itemText}`, 155);
              doc.text(itemLines, 30, y);
              y += itemLines.length * 7 + 3;
            });
          }
        } else if (typeof content.dosDonts === 'string' || Array.isArray(content.dosDonts)) {
          // Handle simple string or array
          const items = Array.isArray(content.dosDonts) ? 
            content.dosDonts : [content.dosDonts];
          
          items.forEach((item: any) => {
            if (y > 270) {
              doc.addPage();
              y = 20;
            }
            
            const itemText = typeof item === 'string' ? item : JSON.stringify(item);
            const itemLines = doc.splitTextToSize(`• ${itemText}`, 160);
            doc.text(itemLines, 25, y);
            y += itemLines.length * 7 + 3;
          });
        }
      }
      
      // Handle any other fields by looping through remaining properties
      Object.entries(content).forEach(([key, value]) => {
        // Skip already processed fields and metadata
        if (['summary', 'keyPoints', 'description', 'content', 'mainCompetitors', 
             'recommendations', 'recommendedActions', 'challenges', 'opportunities', 
             'dosDonts', 'insufficient_data'].includes(key) || 
            typeof value === 'boolean' || value === null || value === undefined) {
          return;
        }
        
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        
        // Format key name
        const formattedKey = key
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, str => str.toUpperCase());
        
        setBoldFont(doc);
        doc.text(`${formattedKey}:`, 20, y);
        y += 7;
        setNormalFont(doc);
        
        if (typeof value === 'string') {
          const valueLines = doc.splitTextToSize(value, 160);
          doc.text(valueLines, 25, y);
          y += valueLines.length * 7 + 5;
        } else if (Array.isArray(value)) {
          value.forEach((item: any) => {
            if (y > 270) {
              doc.addPage();
              y = 20;
            }
            
            let itemText = typeof item === 'string' ? item : JSON.stringify(item);
            if (itemText.startsWith('{') || itemText.startsWith('[')) {
              itemText = cleanJsonString(itemText);
            }
            
            const itemLines = doc.splitTextToSize(`• ${itemText}`, 155);
            doc.text(itemLines, 25, y);
            y += itemLines.length * 7 + 3;
          });
          y += 2;
        } else if (typeof value === 'object' && value !== null) {
          const objLines = doc.splitTextToSize(cleanJsonString(JSON.stringify(value, null, 2)), 155);
          doc.text(objLines, 25, y);
          y += objLines.length * 7 + 5;
        } else {
          const valueText = String(value);
          const valueLines = doc.splitTextToSize(valueText, 160);
          doc.text(valueLines, 25, y);
          y += valueLines.length * 7 + 5;
        }
      });
      
      return y;
    };
    
    // Add overview section
    if (aiContent.overview) {
      yPos = addSection('Overview', aiContent.overview, yPos);
      yPos += 15;
    }
    
    // Check if we need a new page
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    // Add company section
    if (aiContent.company) {
      yPos = addSection('Company Analysis', aiContent.company, yPos);
      yPos += 15;
    }
    
    // Check if we need a new page
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    // Add competitors section
    if (aiContent.competitors) {
      yPos = addSection('Competitive Analysis', aiContent.competitors, yPos);
      yPos += 15;
    }
    
    // Check if we need a new page
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    // Add tech stack section
    if (aiContent.techStack) {
      yPos = addSection('Technology Stack', aiContent.techStack, yPos);
      yPos += 15;
    }
    
    // Check if we need a new page
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    // Add meeting section
    if (aiContent.meeting) {
      yPos = addSection('Meeting Information', aiContent.meeting, yPos);
      yPos += 15;
    }
    
    // Check if we need a new page
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    // Add news section
    if (aiContent.news) {
      yPos = addSection('News & Updates', aiContent.news, yPos);
      yPos += 15;
    }
    
    // Check if we need a new page
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    // Add interactions section
    if (aiContent.interactions) {
      yPos = addSection('Interactions', aiContent.interactions, yPos);
      yPos += 15;
    }
    
    // Check if we need a new page
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    // Add next steps section
    if (aiContent.nextSteps) {
      yPos = addSection('Next Steps', aiContent.nextSteps, yPos);
      yPos += 15;
    }
    
    // Add footer on each page
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
    
    // Generate PDF buffer
    const pdfBuffer = doc.output('arraybuffer');
    
    // Return the PDF as a response
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