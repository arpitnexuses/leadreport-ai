/**
 * Report Content Enhancer
 * 
 * This module provides functionality to enhance report content with AI-generated insights.
 */

/**
 * Enhances report content with AI-generated insights based on the lead data
 * @param section The section to enhance (e.g., 'overview', 'company', etc.)
 * @param leadData The lead data to use for enhancement
 * @param apolloData Optional apollo data with additional context
 * @returns Enhanced content for the specified section
 */
export async function enhanceReportContent(
  section: string, 
  leadData: any, 
  apolloData?: any
): Promise<any> {
  try {
    // Call our AI generation API endpoint
    const response = await fetch('/api/ai-generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        section,
        leadData,
        apolloData
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to generate content');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error enhancing report content:', error);
    return {
      insufficient_data: true,
      message: 'Unable to generate AI content at this time.'
    };
  }
}

/**
 * Helper functions to enhance and normalize report content
 */

/**
 * Truncates text to a specified length
 */
export const truncateText = (text: string, maxLength: number = 200): string => {
  if (!text || typeof text !== 'string') return '';
  return text.length > maxLength ? text.substring(0, maxLength - 3) + '...' : text;
};

/**
 * Determines if a string appears to contain a list
 */
export const isStringList = (str: string): boolean => {
  if (!str) return false;
  // Check if the string has multiple lines with patterns like bullet points, numbers, etc.
  return /\n\s*[-•*]\s/.test(str) || /\n\s*\d+[.)]\s/.test(str) || str.split(/\n+/).length > 2;
};

/**
 * Converts a string that appears to be a list into an array of items
 */
export const stringToList = (str: string): string[] => {
  if (!str) return [];
  // Split by newlines and filter out empty lines
  let lines = str.split(/\n+/).filter(line => line.trim().length > 0);
  
  // Remove bullet points or numbering if present
  lines = lines.map(line => line.replace(/^\s*[-•*]\s+/, '').replace(/^\s*\d+[.)]\s+/, '').trim());
  
  return lines;
};

/**
 * Safely converts a string or array to an array of items
 */
export const ensureArray = (value: any): string[] => {
  if (!value) return [];
  
  if (Array.isArray(value)) {
    return value.filter(item => item && typeof item === 'string');
  }
  
  if (typeof value === 'string') {
    if (isStringList(value)) {
      return stringToList(value);
    }
    // Split by newlines or semicolons and filter out empty items
    return value.split(/\n+|;\s*/).filter(item => item.trim().length > 0).map(item => item.trim());
  }
  
  return [];
};

/**
 * Enhances AI content by normalizing data structures
 */
export const enhanceAIContent = (section: string, content: any): any => {
  if (!content) return null;
  
  // If insufficient data, just return as is
  if (content.insufficient_data) return content;
  
  const enhanced = { ...content };
  
  // Process section-specific enhancements
  switch (section) {
    case 'techStack':
      if (content.painPoints && !Array.isArray(content.painPoints)) {
        enhanced.painPoints = ensureArray(content.painPoints);
      }
      if (content.opportunities && !Array.isArray(content.opportunities)) {
        enhanced.opportunities = ensureArray(content.opportunities);
      }
      break;
      
    case 'interactions':
      // Ensure personalizationTips is always an array
      if (content.personalizationTips && !Array.isArray(content.personalizationTips)) {
        enhanced.personalizationTips = ensureArray(content.personalizationTips);
      }
      // Initialize with empty array if not present
      if (!content.personalizationTips) {
        enhanced.personalizationTips = [];
      }
      // Ensure other fields exist
      if (!content.communicationPreferences) {
        enhanced.communicationPreferences = "";
      }
      
      // Process dosDonts field
      if (!content.dosDonts) {
        enhanced.dosDonts = "";
      } else if (typeof content.dosDonts === 'string') {
        // Check if the dosDonts field is a string with square brackets (like an array)
        if (content.dosDonts.trim().startsWith('[') && content.dosDonts.trim().endsWith(']')) {
          try {
            // Try to parse it as JSON
            const parsedArray = JSON.parse(content.dosDonts);
            if (Array.isArray(parsedArray)) {
              // If successfully parsed as array, process items into do/dont
              const doItems: string[] = [];
              const dontItems: string[] = [];
              
              parsedArray.forEach((item: string) => {
                const itemStr = item.toString().trim();
                if (itemStr.toLowerCase().startsWith("do ") || 
                    itemStr.toLowerCase().startsWith("always ") || 
                    itemStr.toLowerCase().startsWith("use ")) {
                  doItems.push(itemStr);
                } else if (itemStr.toLowerCase().startsWith("don't ") || 
                           itemStr.toLowerCase().startsWith("avoid ") || 
                           itemStr.toLowerCase().startsWith("never ")) {
                  dontItems.push(itemStr);
                } else {
                  // If can't clearly determine, put in do section
                  doItems.push(itemStr);
                }
              });
              
              enhanced.dosDonts = {
                do: doItems,
                dont: dontItems
              };
              
              return enhanced;
            }
          } catch (e) {
            // If JSON parsing fails, continue with regular string processing
            console.log("Failed to parse dosDonts as array:", e);
          }
        }
        
        // Regular string processing for non-array strings
        // If it's a string, try to extract do's and don'ts
        const doString = content.dosDonts.match(/do:([^]*?)(?:don'?t|shouldn'?t|avoid):/i);
        const dontString = content.dosDonts.match(/(?:don'?t|shouldn'?t|avoid):([^]*?)(?:$)/i);
        
        // If we can extract structured do's and don'ts, convert to object format
        if (doString || dontString) {
          enhanced.dosDonts = {
            do: doString ? doString[1].trim() : "",
            dont: dontString ? dontString[1].trim() : ""
          };
        } else {
          // Try to extract do/don't items by splitting the string
          const lines = content.dosDonts.split(/[\n,]+/);
          const doItems: string[] = [];
          const dontItems: string[] = [];
          
          lines.forEach((line: string) => {
            const trimmedLine = line.trim();
            if (trimmedLine.toLowerCase().startsWith("do ") || 
                trimmedLine.toLowerCase().startsWith("always ") || 
                trimmedLine.toLowerCase().startsWith("use ")) {
              doItems.push(trimmedLine);
            } else if (trimmedLine.toLowerCase().startsWith("don't ") || 
                      trimmedLine.toLowerCase().startsWith("avoid ") || 
                      trimmedLine.toLowerCase().startsWith("never ")) {
              dontItems.push(trimmedLine);
            }
          });
          
          if (doItems.length > 0 || dontItems.length > 0) {
            enhanced.dosDonts = {
              do: doItems,
              dont: dontItems
            };
          }
          // Otherwise keep as string
        }
      } else if (typeof content.dosDonts === 'object' && content.dosDonts !== null) {
        // Ensure the object has the right structure
        if (!content.dosDonts.do && !content.dosDonts.dont) {
          // If neither property exists, try to convert from array format if that's what we have
          if (Array.isArray(content.dosDonts)) {
            // If it's an array, try to split into do/dont sections
            const doItems: string[] = [];
            const dontItems: string[] = [];
            
            content.dosDonts.forEach((item: string) => {
              if (item.toLowerCase().startsWith("do ") || 
                  item.toLowerCase().startsWith("always ") || 
                  item.toLowerCase().startsWith("use ")) {
                doItems.push(item);
              } else if (item.toLowerCase().startsWith("don't ") || 
                         item.toLowerCase().startsWith("avoid ") || 
                         item.toLowerCase().startsWith("never ")) {
                dontItems.push(item);
              } else {
                // If can't clearly determine, put in do section
                doItems.push(item);
              }
            });
            
            enhanced.dosDonts = {
              do: doItems.length > 0 ? doItems : "",
              dont: dontItems.length > 0 ? dontItems : ""
            };
          } else {
            // If it's an object but without do/dont properties, convert to string
            enhanced.dosDonts = JSON.stringify(content.dosDonts);
          }
        } else {
          // Make sure both properties exist
          enhanced.dosDonts = {
            do: content.dosDonts.do || "",
            dont: content.dosDonts.dont || ""
          };
        }
      }
      break;
      
    case 'nextSteps':
      // Convert string actions to structured format if needed
      if (content.recommendedActions && Array.isArray(content.recommendedActions)) {
        if (content.recommendedActions.length > 0 && typeof content.recommendedActions[0] === 'string') {
          enhanced.recommendedActions = content.recommendedActions.map((action: string) => ({
            description: action,
            priority: 'Medium'
          }));
        }
      }
      break;
      
    case 'competitors':
      // Ensure competitors is always an array
      if (content.competitors && !Array.isArray(content.competitors)) {
        enhanced.competitors = ensureArray(content.competitors);
      }
      if (content.mainCompetitors && !Array.isArray(content.mainCompetitors)) {
        enhanced.mainCompetitors = ensureArray(content.mainCompetitors);
      }
      break;
  }
  
  return enhanced;
};

/**
 * Processes raw AI response to ensure consistent data structure
 */
export const processAIResponse = (section: string, response: any): any => {
  // Handle missing or invalid responses
  if (!response) {
    console.error(`No response received for section: ${section}`);
    return { 
      insufficient_data: true, 
      message: "No response received" 
    };
  }
  
  // If the response is already marked as insufficient data, return it
  if (response.insufficient_data === true) {
    return response;
  }
  
  // If the response is an error object, return as insufficient data
  if (response.error) {
    console.error(`Error in response for section ${section}:`, response.error);
    return { 
      insufficient_data: true, 
      message: response.error || "Error in AI content generation",
      error: response.error
    };
  }
  
  try {
    // First enhance the content
    const enhancedContent = enhanceAIContent(section, response);
    
    // Remove isGeneralInsight flag if it exists
    delete enhancedContent.isGeneralInsight;
    
    // Enforce content limits for conciseness
    if (enhancedContent.summary && typeof enhancedContent.summary === 'string') {
      enhancedContent.summary = truncateText(enhancedContent.summary, 200);
    }
    
    // Truncate text fields
    if (enhancedContent.description && typeof enhancedContent.description === 'string') {
      enhancedContent.description = truncateText(enhancedContent.description, 200);
    }
    
    if (enhancedContent.marketPosition && typeof enhancedContent.marketPosition === 'string') {
      enhancedContent.marketPosition = truncateText(enhancedContent.marketPosition, 150);
    }
    
    if (enhancedContent.competitiveAdvantage && typeof enhancedContent.competitiveAdvantage === 'string') {
      enhancedContent.competitiveAdvantage = truncateText(enhancedContent.competitiveAdvantage, 150);
    }
    
    if (enhancedContent.marketDynamics && typeof enhancedContent.marketDynamics === 'string') {
      enhancedContent.marketDynamics = truncateText(enhancedContent.marketDynamics, 150);
    }
    
    if (enhancedContent.communicationPreferences && typeof enhancedContent.communicationPreferences === 'string') {
      enhancedContent.communicationPreferences = truncateText(enhancedContent.communicationPreferences, 150);
    }
    
    if (enhancedContent.dosDonts && typeof enhancedContent.dosDonts === 'string') {
      enhancedContent.dosDonts = truncateText(enhancedContent.dosDonts, 200);
    }
    
    if (enhancedContent.suggestedAgenda && typeof enhancedContent.suggestedAgenda === 'string') {
      enhancedContent.suggestedAgenda = truncateText(enhancedContent.suggestedAgenda, 200);
    }
    
    // Truncate array items too
    if (enhancedContent.keyPoints && Array.isArray(enhancedContent.keyPoints)) {
      enhancedContent.keyPoints = enhancedContent.keyPoints.slice(0, 3).map((point: any) => 
        typeof point === 'string' ? truncateText(point, 100) : point
      );
    }
    
    if (enhancedContent.challenges && Array.isArray(enhancedContent.challenges)) {
      enhancedContent.challenges = enhancedContent.challenges.slice(0, 3).map((item: any) => 
        typeof item === 'string' ? truncateText(item, 100) : item
      );
    }
    
    if (enhancedContent.mainCompetitors && Array.isArray(enhancedContent.mainCompetitors)) {
      enhancedContent.mainCompetitors = enhancedContent.mainCompetitors.slice(0, 3).map((item: any) => 
        typeof item === 'string' ? truncateText(item, 100) : item
      );
    }
    
    if (enhancedContent.currentTechnologies && Array.isArray(enhancedContent.currentTechnologies)) {
      enhancedContent.currentTechnologies = enhancedContent.currentTechnologies.slice(0, 3).map((item: any) => 
        typeof item === 'string' ? truncateText(item, 100) : item
      );
    }
    
    // Only keep suggestions/tips for next-steps and interactions sections
    if (section !== 'nextSteps' && section !== 'interactions') {
      // Remove any recommendations, suggestions, or tips
      delete enhancedContent.recommendations;
      delete enhancedContent.recommendedActions;
      delete enhancedContent.suggestedApproach;
      delete enhancedContent.personalizationTips;
      delete enhancedContent.preparationTips;
      delete enhancedContent.tips;
      delete enhancedContent.suggestions;
    } else {
      // For next-steps and interactions, keep the tips but still truncate them
      if (enhancedContent.painPoints && Array.isArray(enhancedContent.painPoints)) {
        enhancedContent.painPoints = enhancedContent.painPoints.slice(0, 2).map((item: any) => 
          typeof item === 'string' ? truncateText(item, 100) : item
        );
      }
      
      if (enhancedContent.opportunities && Array.isArray(enhancedContent.opportunities)) {
        enhancedContent.opportunities = enhancedContent.opportunities.slice(0, 2).map((item: any) => 
          typeof item === 'string' ? truncateText(item, 100) : item
        );
      }
      
      if (enhancedContent.recommendations && Array.isArray(enhancedContent.recommendations)) {
        enhancedContent.recommendations = enhancedContent.recommendations.slice(0, 2);
      }
      
      if (enhancedContent.recommendedActions && Array.isArray(enhancedContent.recommendedActions)) {
        enhancedContent.recommendedActions = enhancedContent.recommendedActions.slice(0, 2);
      }
      
      if (enhancedContent.keyQuestions && Array.isArray(enhancedContent.keyQuestions)) {
        enhancedContent.keyQuestions = enhancedContent.keyQuestions.slice(0, 3).map((item: any) => 
          typeof item === 'string' ? truncateText(item, 100) : item
        );
      }
      
      if (enhancedContent.personalizationTips && Array.isArray(enhancedContent.personalizationTips)) {
        enhancedContent.personalizationTips = enhancedContent.personalizationTips.slice(0, 2).map((item: any) => 
          typeof item === 'string' ? truncateText(item, 100) : item
        );
      }
    }
    
    if (enhancedContent.relevantIndustryTrends && Array.isArray(enhancedContent.relevantIndustryTrends)) {
      enhancedContent.relevantIndustryTrends = enhancedContent.relevantIndustryTrends.slice(0, 3).map((item: any) => 
        typeof item === 'string' ? truncateText(item, 100) : item
      );
    }
    
    // Verify we have actual content after all the processing
    const hasContent = Object.keys(enhancedContent).some(key => 
      key !== 'insufficient_data' && 
      key !== 'message' && 
      key !== 'error' && 
      enhancedContent[key] !== null && 
      enhancedContent[key] !== undefined && 
      enhancedContent[key] !== '' && 
      (typeof enhancedContent[key] !== 'object' || Object.keys(enhancedContent[key]).length > 0) &&
      (!Array.isArray(enhancedContent[key]) || enhancedContent[key].length > 0)
    );
    
    if (!hasContent) {
      console.warn(`Section ${section} has no actual content after processing`);
      return { 
        insufficient_data: true, 
        message: "Unable to generate sufficient content for this section"
      };
    }
    
    // Set the insufficient_data flag to false explicitly
    enhancedContent.insufficient_data = false;
    
    return enhancedContent;
  } catch (error) {
    console.error(`Error processing AI response for section ${section}:`, error);
    return { 
      insufficient_data: true, 
      message: "Error processing AI content",
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

/**
 * Creates a default fallback response for the company section
 */
export const createCompanyFallbackContent = (companyName: string, industry: string): any => {
  if (!industry || industry === 'Unknown') {
    return {
      insufficient_data: true,
      message: "Not enough information about the company's industry to provide meaningful insights."
    };
  }
  
  return {
    description: `${companyName} operates in the ${industry} industry. This analysis is based on general industry knowledge rather than specific company data.`,
    challenges: [
      `Companies in the ${industry} industry often face challenges with digital transformation and technology adoption.`,
      `Regulatory compliance and data security are common concerns in this sector.`,
      `Market competition and customer acquisition can be significant challenges.`
    ],
    marketPosition: `Companies in the ${industry} sector typically compete based on service quality, technological innovation, and operational efficiency.`,
    insufficient_data: false
  };
}; 