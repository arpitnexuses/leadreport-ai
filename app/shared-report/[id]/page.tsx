"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdaptiveImage } from "@/components/ui/adaptive-image";
import {
  Building2,
  Mail,
  Phone,
  Linkedin,
  Globe,
  MapPin,
  Calendar,
  ArrowRight,
  Shield,
  Cpu,
  Newspaper,
  Info,
  Users,
  FileText,
  ExternalLink,
  Clock,
  BarChart2,
  Download,
} from "lucide-react";

// Helper function to check if an object has numeric keys (like {"0": "value1", "1": "value2"})
const hasNumericKeys = (obj: any): boolean => {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return false;
  return Object.keys(obj).every(key => !isNaN(Number(key)));
};

// Helper function to convert an object with numeric keys to an array
const objectToArray = (obj: any): any[] => {
  if (!hasNumericKeys(obj)) return [];
  return Object.values(obj);
};

export default function SharedReportPage({ params }: { params: { id: string } }) {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [debugContent, setDebugContent] = useState<string>("");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isPdfLoading, setIsPdfLoading] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        console.log(`Fetching report with ID: ${params.id}`);
        const response = await fetch(`/api/public-reports/${params.id}`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("Error fetching report:", errorData);
          throw new Error(errorData.error || "Report not found");
        }
        
        const data = await response.json();
        console.log("Successfully fetched report data with sections:", Object.keys(data));
        if (data.aiContent) {
          console.log("AI content sections:", Object.keys(data.aiContent));
          // Print the structure of the first AI content section for debugging
          const firstSection = Object.keys(data.aiContent)[0];
          if (firstSection) {
            console.log(`Example structure of ${firstSection}:`, JSON.stringify(data.aiContent[firstSection], null, 2));
            setDebugContent(JSON.stringify(data.aiContent, null, 2));
          }
        } else {
          // If no AI content is available, generate it automatically
          console.log("No AI content found, generating automatically...");
          setIsGeneratingAI(true);
          generateAIContent(data);
        }
        
        setReport(data);
      } catch (err) {
        setError("Failed to load report");
        console.error("Error in fetchReport:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [params.id]);

  // Function to automatically generate AI content for a report
  const generateAIContent = async (reportData: any) => {
    if (!reportData || !reportData.leadData) return;
    
    setIsGeneratingAI(true);
    console.log("Automatically generating AI content for shared report");
    
    // Define sections to generate
    const sections = ['overview', 'company', 'meeting', 'interactions', 'competitors', 'techStack', 'news', 'nextSteps'];
    const newContent: Record<string, any> = {};
    
    try {
      // Generate content for each section
      for (const section of sections) {
        // Call the AI generate endpoint for each section
        const response = await fetch('/api/ai-generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            section,
            leadData: reportData.leadData,
            apolloData: reportData.apolloData
          })
        });
        
        if (response.ok) {
          const result = await response.json();
          newContent[section] = result;
        } else {
          console.error(`Failed to generate content for ${section} section`);
        }
      }
      
      // Update the report data with the new AI content
      const updatedReport = { ...reportData, aiContent: newContent };
      
      // Save the generated content to the database
      const saveResponse = await fetch(`/api/reports/${reportData._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          aiContent: newContent
        }),
      });

      if (!saveResponse.ok) {
        console.error("Failed to save AI content");
      } else {
        console.log("Successfully generated and saved AI content for shared report");
        // Update the report in state
        setReport(updatedReport);
      }
    } catch (error) {
      console.error('Error in automatic AI generation:', error);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Special rendering for the techStack section
  const TechStack = ({ data }: { data: any }) => {
    if (!data) return null;
    
    return (
      <div className="space-y-2">
        {data.summary && <div className="mb-1">{data.summary}</div>}
        
        {/* Current Technologies */}
        {data.currentTechnologies && (
          <div className="mb-2">
            <h3 className="text-base font-medium text-gray-900 mb-1">Current Technologies</h3>
            <div className="flex flex-wrap gap-1">
              {Array.isArray(data.currentTechnologies) ? (
                data.currentTechnologies.map((tech: string, index: number) => (
                  <span key={index} className="bg-blue-50 text-blue-700 px-2 py-1 rounded-lg border border-blue-100 text-sm font-medium">{tech}</span>
                ))
              ) : hasNumericKeys(data.currentTechnologies) ? (
                objectToArray(data.currentTechnologies).map((tech: string, index: number) => (
                  <span key={index} className="bg-blue-50 text-blue-700 px-2 py-1 rounded-lg border border-blue-100 text-sm font-medium">{tech}</span>
                ))
              ) : typeof data.currentTechnologies === 'string' ? (
                <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-lg border border-blue-100 text-sm font-medium">{data.currentTechnologies}</span>
              ) : null}
            </div>
          </div>
        )}
        
        {/* Pain Points */}
        {data.painPoints && (
          <div className="mb-2">
            <h3 className="text-base font-medium text-gray-900 mb-1">Pain Points</h3>
            <div className="space-y-0">
              {Array.isArray(data.painPoints) ? (
                data.painPoints.map((point: string, index: number) => (
                  <div key={index} className="flex items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 mr-2 flex-shrink-0"></div>
                    <p className="text-gray-700">{point}</p>
                  </div>
                ))
              ) : hasNumericKeys(data.painPoints) ? (
                objectToArray(data.painPoints).map((point: string, index: number) => (
                  <div key={index} className="flex items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 mr-2 flex-shrink-0"></div>
                    <p className="text-gray-700">{point}</p>
                  </div>
                ))
              ) : typeof data.painPoints === 'string' ? (
                <div className="flex items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 mr-2 flex-shrink-0"></div>
                  <p className="text-gray-700">{data.painPoints}</p>
                </div>
              ) : null}
            </div>
          </div>
        )}
        
        {/* Opportunities */}
        {data.opportunities && (
          <div className="mb-2">
            <h3 className="text-base font-medium text-gray-900 mb-1">Opportunities</h3>
            <div className="space-y-0">
              {Array.isArray(data.opportunities) ? (
                data.opportunities.map((opportunity: string, index: number) => (
                  <div key={index} className="flex items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 mr-2 flex-shrink-0"></div>
                    <p className="text-gray-700">{opportunity}</p>
                  </div>
                ))
              ) : hasNumericKeys(data.opportunities) ? (
                objectToArray(data.opportunities).map((opportunity: string, index: number) => (
                  <div key={index} className="flex items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 mr-2 flex-shrink-0"></div>
                    <p className="text-gray-700">{opportunity}</p>
                  </div>
                ))
              ) : typeof data.opportunities === 'string' ? (
                <div className="flex items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 mr-2 flex-shrink-0"></div>
                  <p className="text-gray-700">{data.opportunities}</p>
                </div>
              ) : null}
            </div>
          </div>
        )}
        
        {/* Recommendations */}
        {data.recommendations && (
          <div>
            <h3 className="text-base font-medium text-gray-900 mb-1">Recommendations</h3>
            <div className="space-y-1">
              {Array.isArray(data.recommendations) ? (
                data.recommendations.map((rec: any, index: number) => (
                  <div key={index} className="bg-blue-50 p-1.5 rounded-md border border-blue-100">
                    <p className="text-gray-700">{typeof rec === 'string' ? rec : rec.description || rec.title || JSON.stringify(rec)}</p>
                  </div>
                ))
              ) : hasNumericKeys(data.recommendations) ? (
                objectToArray(data.recommendations).map((rec: any, index: number) => (
                  <div key={index} className="bg-blue-50 p-1.5 rounded-md border border-blue-100">
                    <p className="text-gray-700">{typeof rec === 'string' ? rec : rec.description || rec.title || JSON.stringify(rec)}</p>
                  </div>
                ))
              ) : typeof data.recommendations === 'string' ? (
                <div className="bg-blue-50 p-1.5 rounded-md border border-blue-100">
                  <p className="text-gray-700">{data.recommendations}</p>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Helper function to extract content from AI sections
  const getAIContent = (section: string) => {
    if (!report?.aiContent || !report.aiContent[section]) {
      console.log(`No content found for section: ${section}`);
      return null;
    }
    
    const sectionData = report.aiContent[section];
    console.log(`Raw ${section} data:`, sectionData);
    
    // Special handling for techStack section - use the new component rendering
    if (section === 'techStack') {
      return null; // Return null here as we'll handle the rendering with the TechStack component
    }
    
    // For overview and company sections, always use formatSectionData to show complete data
    if (section === 'overview' || section === 'company') {
      const formattedContent = formatSectionData(sectionData);
      return formattedContent || JSON.stringify(sectionData);
    }
    
    // Special handling for nextSteps section with recommendations
    if (section === 'nextSteps') {
      let content = '';
      
      if (sectionData.summary) {
        content += `<div class="mb-6">${sectionData.summary}</div>`;
      }
      
      // Handle keyPoints if available
      if (sectionData.keyPoints) {
        content += `<div class="mb-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Key Points</h3>
          <ul class="list-disc pl-5 space-y-2">`;
        
        if (Array.isArray(sectionData.keyPoints)) {
          // Standard array handling
          content += sectionData.keyPoints.map((point: string) => `<li>${point}</li>`).join('');
        } else if (hasNumericKeys(sectionData.keyPoints)) {
          // Object with numeric keys - treat like an array
          content += objectToArray(sectionData.keyPoints).map((point: string) => `<li>${point}</li>`).join('');
        } else if (typeof sectionData.keyPoints === 'string') {
          // Simple string
          content += `<li>${sectionData.keyPoints}</li>`;
        }
        
        content += `</ul>
        </div>`;
      }
      
      // Handle recommendedActions if available
      if (sectionData.recommendedActions) {
        content += `<h3 class="text-lg font-medium text-gray-900 mb-4">Recommended Actions</h3>`;
        content += `<div class="space-y-4">`;
        
        if (Array.isArray(sectionData.recommendedActions)) {
          sectionData.recommendedActions.forEach((rec: any) => {
            if (typeof rec === 'string') {
              content += `
                <div class="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <p class="text-gray-700">${rec}</p>
                </div>
              `;
            } else if (typeof rec === 'object' && rec !== null) {
              content += `
                <div class="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h4 class="font-medium text-blue-800 mb-2">${rec.description || rec.title || 'Action Item'}</h4>
                  ${rec.rationale ? `<p class="text-gray-600 mt-1"><strong>Rationale:</strong> ${rec.rationale}</p>` : ''}
                  ${rec.priority ? `<p class="text-gray-600 mt-1"><strong>Priority:</strong> <span class="font-medium ${
                    rec.priority === 'High' ? 'text-red-600' : 
                    rec.priority === 'Medium' ? 'text-orange-600' : 
                    'text-blue-600'}">${rec.priority}</span></p>` : ''}
                </div>
              `;
            }
          });
        } else if (hasNumericKeys(sectionData.recommendedActions)) {
          // Object with numeric keys - treat like an array
          objectToArray(sectionData.recommendedActions).forEach((rec: any) => {
            if (typeof rec === 'string') {
              content += `
                <div class="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <p class="text-gray-700">${rec}</p>
                </div>
              `;
            } else if (typeof rec === 'object' && rec !== null) {
              content += `
                <div class="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h4 class="font-medium text-blue-800 mb-2">${rec.description || rec.title || 'Action Item'}</h4>
                  ${rec.rationale ? `<p class="text-gray-600 mt-1"><strong>Rationale:</strong> ${rec.rationale}</p>` : ''}
                  ${rec.priority ? `<p class="text-gray-600 mt-1"><strong>Priority:</strong> <span class="font-medium ${
                    rec.priority === 'High' ? 'text-red-600' : 
                    rec.priority === 'Medium' ? 'text-orange-600' : 
                    'text-blue-600'}">${rec.priority}</span></p>` : ''}
                </div>
              `;
            }
          });
        }
        
        content += `</div>`;
      }
      
      return content;
    }
    
    // Handle different structures
    if (typeof sectionData === 'string') {
      return sectionData;
    }
    
    if (sectionData.summary) {
      return sectionData.summary;
    }
    
    if (sectionData.content) {
      return sectionData.content;
    }
    
    if (sectionData.description) {
      return sectionData.description;
    }
    
    // For nested structures with common fields
    const sectionsToCheck = [
      { field: 'keyPoints', title: 'Key Points' },
      { field: 'mainCompetitors', title: 'Main Competitors' },
      { field: 'competitiveAdvantage', title: 'Competitive Advantage' },
      { field: 'challenges', title: 'Challenges' },
      { field: 'relevantIndustryTrends', title: 'Relevant Industry Trends' },
      { field: 'personalizationTips', title: 'Personalization Tips' },
      { field: 'keyQuestions', title: 'Key Questions' }
    ];
    
    for (const { field, title } of sectionsToCheck) {
      if (sectionData[field]) {
        let content = `<div class="mb-4"><h3 class="text-lg font-medium text-gray-900 mb-3">${title}</h3>`;
        
        if (Array.isArray(sectionData[field])) {
          content += `<ul class="list-disc pl-5 space-y-2">
            ${sectionData[field].map((item: string) => `<li>${item}</li>`).join('')}
          </ul>`;
        } else if (hasNumericKeys(sectionData[field])) {
          content += `<ul class="list-disc pl-5 space-y-2">
            ${objectToArray(sectionData[field]).map((item: string) => `<li>${item}</li>`).join('')}
          </ul>`;
        } else if (typeof sectionData[field] === 'string') {
          content += `<p>${sectionData[field]}</p>`;
        }
        
        content += `</div>`;
        return content;
      }
    }
    
    // If we can't find a known field, try to format the entire object
    const formattedContent = formatSectionData(sectionData);
    return formattedContent || JSON.stringify(sectionData);
  };

  // Format section data into nicely styled HTML
  const formatSectionData = (data: any): string => {
    if (!data || typeof data !== 'object') return '';
    
    // Special handling for dosDonts when it's an object
    if (data.dosDonts && typeof data.dosDonts === 'object') {
      let content = '';
      
      if (data.summary) {
        content += `<div class="mb-1">${data.summary}</div>`;
      }
      
      content += `<h3 class="text-base font-medium text-gray-900 mb-1">Dos and Don&apos;ts</h3>`;
      content += `<div class="grid grid-cols-1 md:grid-cols-2 gap-1">`;
      
      if (data.dosDonts.do) {
        content += `
          <div class="bg-green-50 p-1.5 rounded-md border border-green-100">
            <h4 class="font-medium text-green-700 mb-0.5 text-sm">Do</h4>
            <div class="text-gray-700">
              ${typeof data.dosDonts.do === 'string' ? 
                data.dosDonts.do : 
                Array.isArray(data.dosDonts.do) ? 
                  `<ul class="list-disc pl-3 space-y-0">
                    ${data.dosDonts.do.map((item: string) => `<li class="pl-0.5">${item}</li>`).join('')}
                  </ul>` : 
                  hasNumericKeys(data.dosDonts.do) ?
                  `<ul class="list-disc pl-3 space-y-0">
                    ${objectToArray(data.dosDonts.do).map((item: string) => `<li class="pl-0.5">${item}</li>`).join('')}
                  </ul>` :
                  JSON.stringify(data.dosDonts.do)
              }
            </div>
          </div>
        `;
      }
      
      if (data.dosDonts.dont) {
        content += `
          <div class="bg-red-50 p-1.5 rounded-md border border-red-100">
            <h4 class="font-medium text-red-700 mb-0.5 text-sm">Don&apos;t</h4>
            <div class="text-gray-700">
              ${typeof data.dosDonts.dont === 'string' ? 
                data.dosDonts.dont : 
                Array.isArray(data.dosDonts.dont) ? 
                  `<ul class="list-disc pl-3 space-y-0">
                    ${data.dosDonts.dont.map((item: string) => `<li class="pl-0.5">${item}</li>`).join('')}
                  </ul>` : 
                  hasNumericKeys(data.dosDonts.dont) ?
                  `<ul class="list-disc pl-3 space-y-0">
                    ${objectToArray(data.dosDonts.dont).map((item: string) => `<li class="pl-0.5">${item}</li>`).join('')}
                  </ul>` :
                  JSON.stringify(data.dosDonts.dont)
              }
            </div>
          </div>
        `;
      }
      
      content += `</div>`;
      return content;
    }
    
    // Special handling for dosDonts when it's a string array in JSON format
    if (data.dosDonts && typeof data.dosDonts === 'string' && 
        data.dosDonts.trim().startsWith('[') && data.dosDonts.trim().endsWith(']')) {
      try {
        // Try to parse it as JSON
        const parsedItems = JSON.parse(data.dosDonts);
        if (Array.isArray(parsedItems)) {
          const doItems = parsedItems.filter(item => 
            item.toLowerCase().startsWith("do ") || 
            item.toLowerCase().startsWith("always ") || 
            item.toLowerCase().startsWith("use ")
          );
          
          const dontItems = parsedItems.filter(item => 
            item.toLowerCase().startsWith("don't ") || 
            item.toLowerCase().startsWith("avoid ") || 
            item.toLowerCase().startsWith("never ")
          );
          
          let content = '';
          if (data.summary) {
            content += `<div class="mb-1">${data.summary}</div>`;
          }
          
          content += `<h3 class="text-base font-medium text-gray-900 mb-1">Dos and Don&apos;ts</h3>`;
          content += `<div class="grid grid-cols-1 md:grid-cols-2 gap-1">`;
          
          // Add the Do section
          if (doItems.length > 0) {
            content += `
              <div class="bg-green-50 p-1.5 rounded-md border border-green-100">
                <h4 class="font-medium text-green-700 mb-0.5 text-sm">Do</h4>
                <div class="text-gray-700">
                  <ul class="list-disc pl-3 space-y-0">
                    ${doItems.map(item => `<li class="pl-0.5">${item}</li>`).join('')}
                  </ul>
                </div>
              </div>
            `;
          }
          
          // Add the Don't section
          if (dontItems.length > 0) {
            content += `
              <div class="bg-red-50 p-1.5 rounded-md border border-red-100">
                <h4 class="font-medium text-red-700 mb-0.5 text-sm">Don&apos;t</h4>
                <div class="text-gray-700">
                  <ul class="list-disc pl-3 space-y-0">
                    ${dontItems.map(item => `<li class="pl-0.5">${item}</li>`).join('')}
                  </ul>
                </div>
              </div>
            `;
          }
          
          content += `</div>`;
          return content;
        }
      } catch (e) {
        console.error("Failed to parse dosDonts as array:", e);
        // If parsing fails, we'll fall through to the regular formatting
      }
    }
    
    // Special handling for recommendations array
    if (data.recommendations && Array.isArray(data.recommendations)) {
      let content = '';
      
      if (data.summary) {
        content += `<div class="mb-1">${data.summary}</div>`;
      }
      
      content += `<h3 class="text-base font-medium text-gray-900 mb-1">Recommended Actions</h3>`;
      content += `<div class="space-y-1">`;
      
      data.recommendations.forEach((rec: any) => {
        if (typeof rec === 'string') {
          content += `
            <div class="bg-blue-50 p-1.5 rounded-md border border-blue-100">
              <p class="text-gray-700">${rec}</p>
            </div>
          `;
        } else if (typeof rec === 'object') {
          content += `
            <div class="bg-blue-50 p-1.5 rounded-md border border-blue-100">
              <h4 class="font-medium text-blue-800 mb-0.5">${rec.title || 'Action Item'}</h4>
              <p class="text-gray-700">${rec.description || rec.content || ''}</p>
            </div>
          `;
        }
      });
      
      content += `</div>`;
      return content;
    }
    
    // If data has summary, display it at the top
    let content = '';
    if (data.summary) {
      content += `<div class="mb-1 text-gray-700">
        <p class="font-medium">${data.summary}</p>
      </div>`;
    }
    
    // Filter out metadata fields
    const filteredEntries = Object.entries(data).filter(([key]) => 
      !['insufficient_data', 'summary'].includes(key) && 
      typeof data[key] !== 'boolean' &&
      data[key] !== null &&
      data[key] !== undefined
    );
    
    if (filteredEntries.length === 0) return content;
    
    content += filteredEntries.map(([key, value]) => {
      // Format camelCase to Title Case with Spaces
      const formattedKey = key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (str) => str.toUpperCase());
      
      // Handle different value types
      let formattedValue = '';
      
      if (key === 'keyPoints' || key === 'challenges') {
        formattedValue = formatArrayOrObject(value, { 
          listItemClass: 'flex items-center',
          bulletClass: 'w-1.5 h-1.5 rounded-full bg-blue-400 mr-1.5 flex-shrink-0',
          contentClass: 'text-gray-700'
        });
      } else if (key === 'recommendations' && Array.isArray(value)) {
        formattedValue = `<div class="space-y-1">
          ${value.map((item: any) => {
            if (typeof item === 'string') {
              return `<div class="bg-blue-50 p-1.5 rounded-md border border-blue-100">
                <p class="text-gray-700">${item}</p>
              </div>`;
            } else if (typeof item === 'object') {
              return `<div class="bg-blue-50 p-1.5 rounded-md border border-blue-100">
                <h4 class="font-medium text-blue-800 mb-0.5">${item.title || 'Action Item'}</h4>
                <p class="text-gray-700">${item.description || item.content || ''}</p>
              </div>`;
            }
            return '';
          }).join('')}
        </div>`;
      } else if (typeof value === 'string') {
        formattedValue = `<p class="text-gray-700">${value}</p>`;
      } else if (Array.isArray(value)) {
        formattedValue = formatArrayOrObject(value);
      } else if (typeof value === 'object') {
        // For nested objects, recursively format them
        formattedValue = `<div class="pl-2 border-l border-blue-200 space-y-1">
          ${formatSectionData(value)}
        </div>`;
      } else {
        formattedValue = `<p class="text-gray-700">${String(value)}</p>`;
      }
      
      return `
        <div class="mb-2">
          <h3 class="text-base font-medium text-blue-700 mb-0.5">${formattedKey}</h3>
          <div class="text-gray-700">${formattedValue}</div>
        </div>
      `;
    }).join('');
    
    return content;
  };

  // Helper function to format arrays or objects that should be displayed as lists
  const formatArrayOrObject = (data: any, options = {
    listItemClass: 'flex items-center',
    bulletClass: 'w-1.5 h-1.5 rounded-full bg-gray-400 mr-1.5 flex-shrink-0',
    contentClass: 'text-gray-700'
  }): string => {
    if (Array.isArray(data)) {
      return `<div class="space-y-0">
        ${data.map((item) => {
          if (typeof item === 'string') {
            return `<div class="${options.listItemClass}">
              <div class="${options.bulletClass}"></div>
              <p class="${options.contentClass}">${item}</p>
            </div>`;
          } else if (typeof item === 'object' && item !== null) {
            return `<div class="${options.listItemClass}">
              <div class="${options.bulletClass}"></div>
              <div class="w-full">
                ${typeof item.title === 'string' ? `<p class="font-medium text-gray-800">${item.title}</p>` : ''}
                ${typeof item.description === 'string' ? `<p class="${options.contentClass}">${item.description}</p>` : ''}
                ${typeof item.content === 'string' ? `<p class="${options.contentClass}">${item.content}</p>` : ''}
                ${!item.title && !item.description && !item.content ? `<p class="${options.contentClass}">${JSON.stringify(item)}</p>` : ''}
              </div>
            </div>`;
          }
          return `<div class="${options.listItemClass}">
            <div class="${options.bulletClass}"></div>
            <p class="${options.contentClass}">${JSON.stringify(item)}</p>
          </div>`;
        }).join('')}
      </div>`;
    } else if (hasNumericKeys(data)) {
      const arrayData = objectToArray(data);
      return formatArrayOrObject(arrayData, options);
    } else if (typeof data === 'object' && data !== null) {
      return formatSectionData(data);
    }
    return `<p class="${options.contentClass}">${String(data)}</p>`;
  };

  // Function to format section content for display
  const formatSectionContent = (content: string | null): string => {
    if (!content) return '';
    
    // Check if content looks like HTML
    if (content.includes('<') && content.includes('>')) {
      return content;
    }
    
    // Simple text content
    return `<p class="text-gray-700">${content}</p>`;
  };

  // Check if section has meaningful data
  const hasSectionData = (section: string) => {
    if (!report?.aiContent || !report.aiContent[section]) {
      console.log(`Section check: ${section} - not found`);
      return false;
    }
    
    const sectionData = report.aiContent[section];
    
    if (typeof sectionData === 'string' && sectionData.trim()) {
      console.log(`Section check: ${section} - has string data`);
      return true;
    }
    
    if (typeof sectionData !== 'object') {
      console.log(`Section check: ${section} - not an object`);
      return false;
    }
    
    if (sectionData.insufficient_data === true) {
      console.log(`Section check: ${section} - has insufficient_data flag`);
      return false;
    }
    
    if (sectionData.summary) {
      console.log(`Section check: ${section} - has summary`);
      return true;
    }
    
    if (sectionData.content) {
      console.log(`Section check: ${section} - has content`);
      return true;
    }
    
    if (sectionData.description) {
      console.log(`Section check: ${section} - has description`);
      return true;
    }
    
    if (sectionData.keyPoints && sectionData.keyPoints.length > 0) {
      console.log(`Section check: ${section} - has keyPoints`);
      return true;
    }
    
    // Check for any non-boolean, non-metadata property
    const hasData = Object.entries(sectionData).some(([key, value]) => 
      !['insufficient_data'].includes(key) && 
      typeof value !== 'boolean' &&
      value !== null &&
      value !== undefined
    );
    
    console.log(`Section check: ${section} - has other data: ${hasData}`);
    return hasData;
  };

  // Add PDF download function
  const handleDownloadPdf = async () => {
    if (!report || !report._id) return;
    
    try {
      setIsPdfLoading(true);
      console.log(`Requesting PDF for report: ${report._id}`);
      
      // Use the simple jsPDF endpoint instead of Puppeteer
      const response = await fetch(`/api/generate-pdf-simple/${report._id}`, {
        method: 'GET',
      });
      
      console.log(`PDF response status: ${response.status}`);
      
      if (!response.ok) {
        // Try to get detailed error information
        let errorMessage = 'Failed to generate PDF';
        try {
          const errorData = await response.json();
          console.error('PDF generation error details:', errorData);
          errorMessage = errorData.details || errorData.error || errorMessage;
        } catch (parseError) {
          console.error('Could not parse error response:', parseError);
        }
        
        throw new Error(errorMessage);
      }
      
      // Check if we got a PDF or JSON (error) response
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        console.error('PDF generation returned JSON error:', errorData);
        throw new Error(errorData.error || 'Failed to generate PDF');
      }
      
      // We have a valid PDF response
      console.log('PDF generated successfully, downloading...');
      const blob = await response.blob();
      
      if (blob.size < 1000) { // If PDF is suspiciously small
        console.warn('Warning: PDF file size is very small:', blob.size, 'bytes');
      }
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.leadData.name}-report.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
      
      console.log('PDF download initiated');
    } catch (error) {
      console.error('Error in PDF generation/download:', error);
      
      // Show a more detailed error message to the user
      alert(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again later or contact support.`);
    } finally {
      setIsPdfLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute top-0 w-full h-full rounded-full border-4 border-blue-200 opacity-25"></div>
            <div className="absolute top-0 w-full h-full rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-gray-700 font-medium">Preparing your report...</p>
          <p className="text-gray-500 text-sm mt-2">This may take a few moments</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Report Not Found</h1>
            <p className="text-gray-600 mb-6">{error || "We couldn't locate the report you're looking for."}</p>
            <button 
              onClick={() => window.history.back()} 
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
            >
              <ArrowRight className="h-4 w-4 rotate-180" />
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const leadData = report.leadData;
  const apolloPerson = report.apolloData?.person || {};

  // Explicitly log what we're going to render
  console.log("AI Content sections available:", report.aiContent ? Object.keys(report.aiContent) : "none");
  const sectionsToRender: Record<string, boolean> = {};
  Object.keys(report.aiContent || {}).forEach(section => {
    sectionsToRender[section] = hasSectionData(section);
  });
  console.log("Sections that will render:", sectionsToRender);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      {/* Header */}
      <header className="relative bg-gradient-to-r from-blue-700 via-blue-600 to-blue-800 text-white py-12 px-4 shadow-lg overflow-hidden">
        <div className="absolute inset-0 bg-pattern opacity-10"></div>
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute left-0 bottom-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="container mx-auto max-w-5xl relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="h-20 w-20 rounded-full overflow-hidden bg-white/20 flex-shrink-0 border-4 border-white/30 shadow-lg">
                <AdaptiveImage
                  src={leadData.photo || apolloPerson?.photo_url || ""}
                  alt={leadData.name}
                  width={120}
                  height={120}
                  className="object-cover w-full h-full"
                  placeholderType="user"
                  showPlaceholder={
                    !leadData.photo && !apolloPerson?.photo_url
                  }
                />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl md:text-3xl font-bold">{leadData.name}</h1>
                  <Badge className="bg-blue-500/30 hover:bg-blue-500/40 text-white border border-white/20 text-xs py-1">
                    Lead Report
                  </Badge>
                </div>
                <p className="text-blue-100 flex items-center gap-2">
                  <span>{leadData.position}</span>
                  <span className="text-blue-300">•</span>
                  <span>{leadData.companyName}</span>
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Contact options */}
              <div className="hidden md:flex items-center mr-2">
                <div className="flex overflow-hidden rounded-full border border-white/20">
                  {leadData.contactDetails.email && (
                    <a
                      href={`mailto:${leadData.contactDetails.email}`}
                      className="bg-white/10 hover:bg-white/20 p-2 text-white transition-colors"
                      title={leadData.contactDetails.email}
                    >
                      <Mail className="h-5 w-5" />
                    </a>
                  )}
                  
                  {leadData.contactDetails.phone && (
                    <a
                      href={`tel:${leadData.contactDetails.phone}`}
                      className="bg-white/10 hover:bg-white/20 p-2 text-white transition-colors"
                      title={leadData.contactDetails.phone}
                    >
                      <Phone className="h-5 w-5" />
                    </a>
                  )}
                  
                  {leadData.contactDetails.linkedin && (
                    <a
                      href={leadData.contactDetails.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white/10 hover:bg-white/20 p-2 text-white transition-colors"
                      title="LinkedIn Profile"
                    >
                      <Linkedin className="h-5 w-5" />
                    </a>
                  )}
                </div>
              </div>
              
              {/* PDF Download button */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadPdf}
                  disabled={isPdfLoading}
                  className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg border border-white/20 text-white transition-colors"
                  title="Download as PDF"
                >
                  {isPdfLoading ? (
                    <>
                      <span className="animate-spin mr-1">
                        <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </span>
                      <span className="text-sm">Generating...</span>
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      <span className="text-sm">Download PDF</span>
                    </>
                  )}
                </button>
              </div>
              
              <div className="bg-blue-800/40 text-xs text-blue-100 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>{new Date(report.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-5xl py-6 px-4">
        {/* AI Generation Banner */}
        {isGeneratingAI && (
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-2 flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 rounded-full">
              <svg className="h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-blue-800 text-sm">AI Content is Being Generated</h3>
              <p className="text-xs text-blue-600">
                We&apos;re creating AI-powered insights for this report. This may take a minute...
              </p>
            </div>
            <div className="ml-auto">
              <svg className="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          </div>
        )}
        
        {/* Lead Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="md:col-span-2 border-0 shadow-md bg-white overflow-hidden">
            <CardHeader className="pb-1 border-b border-gray-100">
              <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                <Building2 className="h-5 w-5 text-blue-600" />
                Company Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3">
              <div className="flex flex-col space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  {leadData.companyDetails.industry && (
                    <Badge className="bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors font-medium">
                      {leadData.companyDetails.industry}
                    </Badge>
                  )}
                  {leadData.companyDetails.employees && (
                    <Badge className="bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors font-medium">
                      {leadData.companyDetails.employees} employees
                    </Badge>
                  )}
                  {leadData.companyDetails.headquarters && (
                    <Badge className="bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors font-medium">
                      <MapPin className="h-3 w-3 mr-1" />
                      {leadData.companyDetails.headquarters}
                    </Badge>
                  )}
                </div>
                
                {leadData.companyDetails.website && (
                  <a
                    href={leadData.companyDetails.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors w-fit text-sm"
                  >
                    <Globe className="h-4 w-4" />
                    <span>{leadData.companyDetails.website.replace(/^https?:\/\/(www\.)?/, '')}</span>
                    <ExternalLink className="h-3 w-3 opacity-70" />
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-md bg-white overflow-hidden">
            <CardHeader className="pb-1 border-b border-gray-100">
              <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                <Mail className="h-5 w-5 text-blue-600" />
                Contact Details
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3">
              <div className="space-y-2">
                {leadData.contactDetails.email && (
                  <a
                    href={`mailto:${leadData.contactDetails.email}`}
                    className="flex items-center gap-1.5 text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <Mail className="h-3 w-3 text-blue-600" />
                    </div>
                    <span className="text-sm">{leadData.contactDetails.email}</span>
                  </a>
                )}

                {leadData.contactDetails.phone && (
                  <a
                    href={`tel:${leadData.contactDetails.phone}`}
                    className="flex items-center gap-1.5 text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <Phone className="h-3 w-3 text-blue-600" />
                    </div>
                    <span className="text-sm">{leadData.contactDetails.phone}</span>
                  </a>
                )}

                {leadData.contactDetails.linkedin && (
                  <a
                    href={leadData.contactDetails.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <Linkedin className="h-3 w-3 text-blue-600" />
                    </div>
                    <span className="text-sm">LinkedIn Profile</span>
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Debug section - hidden by default */}
        {debugContent && (
          <details className="mb-8 bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
            <summary className="p-4 cursor-pointer text-blue-600 font-medium bg-gray-50 hover:bg-gray-100 transition-colors">
              Debug: AI Content Structure
            </summary>
            <pre className="p-4 bg-gray-800 text-white overflow-auto rounded-b-md text-xs max-h-96">
              {debugContent}
            </pre>
          </details>
        )}

        {/* Report Navigation */}
        <nav className="hidden md:flex sticky top-4 z-10 bg-white/90 backdrop-blur-sm mb-6 rounded-full shadow-md border border-gray-100 p-1.5 overflow-x-auto">
          <div className="flex space-x-1">
            {hasSectionData('overview') && (
              <a href="#overview" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors text-sm font-medium">
                <Info className="h-4 w-4" />
                <span>Overview</span>
              </a>
            )}
            {hasSectionData('company') && (
              <a href="#company" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors text-sm font-medium">
                <Building2 className="h-4 w-4" />
                <span>Company</span>
              </a>
            )}
            {hasSectionData('competitors') && (
              <a href="#competitors" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors text-sm font-medium">
                <Shield className="h-4 w-4" />
                <span>Competitors</span>
              </a>
            )}
            {hasSectionData('techStack') && (
              <a href="#techstack" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors text-sm font-medium">
                <Cpu className="h-4 w-4" />
                <span>Tech Stack</span>
              </a>
            )}
            {hasSectionData('meeting') && (
              <a href="#meeting" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors text-sm font-medium">
                <Clock className="h-4 w-4" />
                <span>Meeting</span>
              </a>
            )}
            {hasSectionData('news') && (
              <a href="#news" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors text-sm font-medium">
                <Newspaper className="h-4 w-4" />
                <span>News</span>
              </a>
            )}
            {hasSectionData('interactions') && (
              <a href="#interactions" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors text-sm font-medium">
                <Users className="h-4 w-4" />
                <span>Interactions</span>
              </a>
            )}
            {hasSectionData('nextSteps') && (
              <a href="#nextsteps" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors text-sm font-medium">
                <ArrowRight className="h-4 w-4" />
                <span>Next Steps</span>
              </a>
            )}
          </div>
        </nav>

        {/* Report Sections */}
        <div className="space-y-4">
          {/* Overview Section */}
          {hasSectionData('overview') && (
            <section id="overview" className="bg-white rounded-xl shadow-md border-0 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <div className="bg-white/20 p-1.5 rounded-lg">
                    <Info className="h-4 w-4 text-white" />
                  </div>
                  Overview
                </h2>
                <Badge className="bg-white/20 hover:bg-white/30 text-white border-0">
                  Executive Summary
                </Badge>
              </div>
              <div className="p-4">
                <div className="prose max-w-none prose-headings:text-blue-700 prose-headings:font-semibold prose-p:text-gray-600 prose-strong:text-gray-800 prose-strong:font-medium prose-li:text-gray-600 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline">
                  {(() => {
                    const content = getAIContent('overview');
                    return content ? (
                      <div dangerouslySetInnerHTML={{ __html: formatSectionContent(content) }} />
                    ) : (
                      <div className="flex items-center justify-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-500 italic">No overview content available</p>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </section>
          )}

          {/* Company Section */}
          {hasSectionData('company') && (
            <section id="company" className="bg-white rounded-xl shadow-md border-0 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <div className="bg-white/20 p-1.5 rounded-lg">
                    <Building2 className="h-4 w-4 text-white" />
                  </div>
                  Company Analysis
                </h2>
                <Badge className="bg-white/20 hover:bg-white/30 text-white border-0">
                  Business Profile
                </Badge>
              </div>
              <div className="p-4">
                <div className="prose max-w-none prose-headings:text-blue-700 prose-headings:font-semibold prose-p:text-gray-600 prose-strong:text-gray-800 prose-strong:font-medium prose-li:text-gray-600 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline">
                  {(() => {
                    const content = getAIContent('company');
                    return content ? (
                      <div dangerouslySetInnerHTML={{ __html: formatSectionContent(content) }} />
                    ) : (
                      <div className="flex items-center justify-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-500 italic">No company analysis available</p>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </section>
          )}

          {/* Meeting Section */}
          {hasSectionData('meeting') && (
            <section id="meeting" className="bg-white rounded-xl shadow-md border-0 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <div className="bg-white/20 p-1.5 rounded-lg">
                    <Calendar className="h-4 w-4 text-white" />
                  </div>
                  Meeting Information
                </h2>
                <Badge className="bg-white/20 hover:bg-white/30 text-white border-0">
                  Engagement Details
                </Badge>
              </div>
              <div className="p-4">
                <div className="prose max-w-none prose-headings:text-blue-700 prose-headings:font-semibold prose-p:text-gray-600 prose-strong:text-gray-800 prose-strong:font-medium prose-li:text-gray-600 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline">
                  {(() => {
                    const content = getAIContent('meeting');
                    return content ? (
                      <div dangerouslySetInnerHTML={{ __html: formatSectionContent(content) }} />
                    ) : (
                      <div className="flex items-center justify-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-500 italic">No meeting information available</p>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </section>
          )}

          {/* Competitors Section */}
          {hasSectionData('competitors') && (
            <section id="competitors" className="bg-white rounded-xl shadow-md border-0 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <div className="bg-white/20 p-1.5 rounded-lg">
                    <Shield className="h-4 w-4 text-white" />
                  </div>
                  Competitive Analysis
                </h2>
                <Badge className="bg-white/20 hover:bg-white/30 text-white border-0">
                  Market Position
                </Badge>
              </div>
              <div className="p-4">
                <div className="prose max-w-none prose-headings:text-blue-700 prose-headings:font-semibold prose-p:text-gray-600 prose-strong:text-gray-800 prose-strong:font-medium prose-li:text-gray-600 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline">
                  {(() => {
                    const content = getAIContent('competitors');
                    return content ? (
                      <div dangerouslySetInnerHTML={{ __html: formatSectionContent(content) }} />
                    ) : (
                      <div className="flex items-center justify-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-500 italic">No competitor information available</p>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </section>
          )}

          {/* Tech Stack Section */}
          {hasSectionData('techStack') && (
            <section id="techstack" className="bg-white rounded-xl shadow-md border-0 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <div className="bg-white/20 p-1.5 rounded-lg">
                    <Cpu className="h-4 w-4 text-white" />
                  </div>
                  Technology Stack
                </h2>
                <Badge className="bg-white/20 hover:bg-white/30 text-white border-0">
                  Technical Profile
                </Badge>
              </div>
              <div className="p-4">
                <div className="prose max-w-none prose-headings:text-blue-700 prose-headings:font-semibold prose-p:text-gray-600 prose-strong:text-gray-800 prose-strong:font-medium prose-li:text-gray-600 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline">
                  {(() => {
                    // Use our specialized TechStack component for rendering
                    if (report?.aiContent?.techStack) {
                      return <TechStack data={report.aiContent.techStack} />;
                    }
                    return (
                      <div className="flex items-center justify-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-500 italic">No technology stack information available</p>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </section>
          )}

          {/* News Section */}
          {hasSectionData('news') && (
            <section id="news" className="bg-white rounded-xl shadow-md border-0 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <div className="bg-white/20 p-1.5 rounded-lg">
                    <Newspaper className="h-4 w-4 text-white" />
                  </div>
                  News & Updates
                </h2>
                <Badge className="bg-white/20 hover:bg-white/30 text-white border-0">
                  Recent Developments
                </Badge>
              </div>
              <div className="p-4">
                <div className="prose max-w-none prose-headings:text-blue-700 prose-headings:font-semibold prose-p:text-gray-600 prose-strong:text-gray-800 prose-strong:font-medium prose-li:text-gray-600 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline">
                  {(() => {
                    const content = getAIContent('news');
                    return content ? (
                      <div dangerouslySetInnerHTML={{ __html: formatSectionContent(content) }} />
                    ) : (
                      <div className="flex items-center justify-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-500 italic">No news information available</p>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </section>
          )}

          {/* Interactions Section */}
          {hasSectionData('interactions') && (
            <section id="interactions" className="bg-white rounded-xl shadow-md border-0 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <div className="bg-white/20 p-1.5 rounded-lg">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                  Interactions
                </h2>
                <Badge className="bg-white/20 hover:bg-white/30 text-white border-0">
                  Relationship History
                </Badge>
              </div>
              <div className="p-4">
                <div className="prose max-w-none prose-headings:text-blue-700 prose-headings:font-semibold prose-p:text-gray-600 prose-strong:text-gray-800 prose-strong:font-medium prose-li:text-gray-600 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline">
                  {(() => {
                    const content = getAIContent('interactions');
                    return content ? (
                      <div dangerouslySetInnerHTML={{ __html: formatSectionContent(content) }} />
                    ) : (
                      <div className="flex items-center justify-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-500 italic">No interaction information available</p>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </section>
          )}

          {/* Next Steps */}
          {hasSectionData('nextSteps') && (
            <section id="nextsteps" className="bg-white rounded-xl shadow-md border-0 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <div className="bg-white/20 p-1.5 rounded-lg">
                    <ArrowRight className="h-4 w-4 text-white" />
                  </div>
                  Next Steps
                </h2>
                <Badge className="bg-white/20 hover:bg-white/30 text-white border-0">
                  Action Items
                </Badge>
              </div>
              <div className="p-4">
                <div className="prose max-w-none prose-headings:text-blue-700 prose-headings:font-semibold prose-p:text-gray-600 prose-strong:text-gray-800 prose-strong:font-medium prose-li:text-gray-600 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline">
                  {(() => {
                    const content = getAIContent('nextSteps');
                    return content ? (
                      <div dangerouslySetInnerHTML={{ __html: formatSectionContent(content) }} />
                    ) : (
                      <div className="flex items-center justify-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-500 italic">No next steps information available</p>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16">
        <div className="bg-gradient-to-b from-transparent to-blue-50 pt-16 pb-6">
          <div className="container mx-auto max-w-5xl px-4">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-blue-500 rounded-lg shadow-md flex items-center justify-center">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div>
                  <span className="font-bold text-gray-800 text-lg">Lead Report AI</span>
                  <p className="text-gray-500 text-sm">Intelligence-driven sales acceleration</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <a href="#" className="bg-white rounded-full p-2 shadow-sm border border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-200 transition-colors">
                  <BarChart2 className="h-5 w-5" />
                </a>
                <a href="#" className="bg-white rounded-full p-2 shadow-sm border border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-200 transition-colors">
                  <Globe className="h-5 w-5" />
                </a>
                <a href="#" className="bg-white rounded-full p-2 shadow-sm border border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-200 transition-colors">
                  <Mail className="h-5 w-5" />
                </a>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-500 text-sm order-2 md:order-1 text-center md:text-left">
                This report is for informational purposes only. All data is based on the information available at the time of generation.
              </p>
              <p className="text-gray-600 text-sm font-medium order-1 md:order-2 text-center md:text-right">
                © {new Date().getFullYear()} Lead Report AI. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 