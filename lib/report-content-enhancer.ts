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
  if (!response) return { insufficient_data: true, message: "No response received" };
  
  try {
    // First enhance the content
    const enhancedContent = enhanceAIContent(section, response);
    
    // Add a disclaimer flag for general insights
    if (section === 'company' || section === 'competitors' || section === 'techStack') {
      enhancedContent.isGeneralInsight = true;
    }
    
    return enhancedContent;
  } catch (error) {
    console.error("Error processing AI response:", error);
    return { 
      insufficient_data: true, 
      message: "Error processing AI content"
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
    isGeneralInsight: true,
    insufficient_data: false
  };
}; 