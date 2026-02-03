"use server"

import { processAIResponse } from "@/lib/report-content-enhancer";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable is not set");
}

/**
 * Generate AI content for multiple sections in a single batch request
 */
export async function generateBatchAIContent(
  sections: string[],
  leadData: any,
  apolloData?: any
): Promise<Record<string, any>> {
  try {
    // Validate input data
    if (!sections || !Array.isArray(sections) || sections.length === 0) {
      throw new Error("Invalid sections array");
    }

    if (!leadData || typeof leadData !== 'object') {
      throw new Error("Invalid lead data");
    }
    
    // Create combined prompt for all sections
    const combinedPrompt = createCombinedPrompt(sections, leadData, apolloData);
    
    // Call OpenAI once with the combined prompt
    const batchResponse = await generateBatchWithAI(combinedPrompt, sections);
    
    // Process each section's response
    const processedResponses: Record<string, any> = {};
    
    // Process each section in the batch response
    for (const section of sections) {
      try {
        if (batchResponse[section]) {
          processedResponses[section] = processAIResponse(section, batchResponse[section]);
        } else {
          processedResponses[section] = { 
            insufficient_data: true, 
            message: "Unable to generate content for this section" 
          };
        }
      } catch (sectionError) {
        processedResponses[section] = { 
          insufficient_data: true, 
          error: `Error processing section: ${sectionError instanceof Error ? sectionError.message : String(sectionError)}` 
        };
      }
    }
    
    return processedResponses;
  } catch (error) {
    console.error('Error generating batch AI content:', error);
    throw error;
  }
}

/**
 * Generate AI content for a single section
 */
export async function generateSingleAIContent(
  section: string,
  leadData: any,
  apolloData?: any
): Promise<any> {
  if (!section || !leadData) {
    throw new Error("Missing required parameters");
  }

  // Call OpenAI to generate content
  const aiResponse = await generateWithAI(section, leadData, apolloData);
  
  // Process and enhance the response
  const processedResponse = processAIResponse(section, aiResponse);

  return processedResponse;
}

// Generate content for multiple sections in a single API call
async function generateBatchWithAI(combinedPrompt: string, sections: string[]) {
  if (!OPENAI_API_KEY) {
    throw new Error("API configuration error");
  }

  // Use GPT-4 for batch processing to ensure quality
  const model = "gpt-4";

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content:
              "You are a sales intelligence assistant providing highly focused, concise insights. You must return a valid JSON object with sections as requested in the prompt. Each section should be extremely brief and actionable. Return only the JSON object with no additional text."
          },
          {
            role: "user",
            content: combinedPrompt,
          },
        ],
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      // Try to get detailed error information
      let errorInfo = "Could not parse error response";
      try {
        const errorData = await response.json();
        errorInfo = JSON.stringify(errorData);
      } catch (e) {
        errorInfo = await response.text().catch(() => "Could not get error text");
      }
      
      const statusText = `${response.status} ${response.statusText}`;
      throw new Error(`Failed to generate content with AI: ${statusText} - ${errorInfo}`);
    }

    // Successfully got a response
    const data = await response.json();
    
    try {
      const content = data.choices[0].message.content;
      if (typeof content === 'object') {
        return content;
      }
      
      // If content starts with backticks or other markdown formatting, try to extract JSON
      const cleanedContent = content.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      
      try {
        return JSON.parse(cleanedContent);
      } catch (firstParseError) {
        return JSON.parse(content);
      }
    } catch (parseError) {
      // If parsing fails, try to extract any JSON from the response using regex
      const jsonMatch = data.choices[0].message.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch (e) {
          // Ignore inner regex parsing error
        }
      }
      
      // Fallback if all parsing attempts fail
      return sections.reduce((acc: Record<string, any>, section) => {
        acc[section] = { 
          insufficient_data: true, 
          error: "Failed to parse AI response" 
        };
        return acc;
      }, {});
    }
  } catch (error) {
    throw error; // Re-throw to be handled by the caller
  }
}

// Create a combined prompt for multiple sections
function createCombinedPrompt(sections: string[], leadData: any, apolloData?: any): string {
  const baseInfo = `
    Lead name: ${leadData.name || "Unknown"}
    Position: ${leadData.position || "Unknown"}
    Company: ${leadData.companyName || "Unknown"}
    Industry: ${leadData.companyDetails?.industry || "Unknown"}
    Company size: ${leadData.companyDetails?.employees || "Unknown"}
    Location: ${leadData.companyDetails?.headquarters || "Unknown"}
  `;

  const sectionPrompts = sections.map(section => {
    const sectionPrompt = getSectionPromptContent(section);
    return `SECTION: ${section}\n${sectionPrompt}`;
  }).join('\n\n');

  return `${baseInfo}
  
  INSTRUCTIONS:
  I need you to generate content for multiple sections of a lead report.
  For each section, provide the appropriate content according to the instructions.
  All content should be extremely brief, specific and actionable.
  
  Your response must be a valid JSON object with each section as a top-level key.
  Example structure:
  {
    "overview": { "summary": "Brief summary", "keyPoints": ["Point 1", "Point 2"] },
    "company": { "description": "Company description", "challenges": ["Challenge 1"] }
  }
  
  ${sectionPrompts}
  `;
}

// Helper function to get prompt content for a specific section
function getSectionPromptContent(section: string): string {
  switch (section) {
    case "overview":
      return `Provide a brief overview with a 1-2 sentence summary and MAXIMUM 3 key points relevant for sales.`;
    case "company":
      return `Provide a 1-2 sentence description, a market positioning statement, and 2-3 challenges likely faced.`;
    case "competitors":
      return `List MAX 3 competitor types, one sentence about competitive advantage, and one sentence about market dynamics.`;
    case "techStack":
      return `List 2-3 likely technology categories, 1-2 pain points, 1-2 opportunities, and 1-2 recommendations.`;
    case "news":
      return `List 2-3 key industry trends relevant to this company. Keep each trend to a single sentence.`;
    case "nextSteps":
      return `Provide MAX 2 specific next action recommendations, each with a description, rationale, and priority.`;
    case "meeting":
      return `Provide a suggested agenda, key questions, and preparation tips for an upcoming meeting.`;
    case "interactions":
      return `Provide communication preferences, personalization tips, and dos/don'ts for effective interactions.`;
    case "strategicBrief":
      return `Provide a strategic meeting brief with: 1) A primary objective (1-2 sentences), 2) A recommended approach pitch (2 sentences), 3) Exactly 3 key benefit points, and 4) One critical discipline warning.`;
    default:
      return `Generate content for the ${section} section of the lead report.`;
  }
}

// Function to generate content using OpenAI API
async function generateWithAI(
  section: string,
  leadData: any,
  apolloData?: any
) {
  if (!OPENAI_API_KEY) {
    throw new Error("API configuration error");
  }

  const prompt = createPromptForSection(section, leadData, apolloData);

  // Use faster model for simpler sections, GPT-4 for more complex analysis
  const complexSections = ['competitors', 'techStack', 'nextSteps'];
  const model = complexSections.includes(section) ? "gpt-4" : "gpt-3.5-turbo";

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content:
              "You are a sales intelligence assistant providing highly focused, concise insights. Keep all content exceptionally brief - summaries under 2 sentences, lists limited to 3 items max. Avoid vague generalizations and provide only specific, actionable information. Your responses must be formatted as valid JSON. Only include information directly supported by the provided data. For industry insights, focus on the most relevant points without broad generalizations. Prioritize specificity and brevity above all. IMPORTANT: Only provide recommendations, suggestions, or tips for the 'nextSteps' and 'interactions' sections. For all other sections, focus solely on factual information without suggestions or recommendations."
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error("Failed to generate content with AI");
    }

    const data = await response.json();

    // Parse the JSON response - the model should return a JSON string
    try {
      // First, check if the content is already a JSON object (newer API versions might parse it automatically)
      const content = data.choices[0].message.content;
      if (typeof content === 'object') {
        return content;
      }
      
      // If content starts with backticks or other markdown formatting, try to extract JSON
      const cleanedContent = content.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      
      try {
        return JSON.parse(cleanedContent);
      } catch (firstParseError) {
        return JSON.parse(content);
      }
    } catch (parseError) {
      // If parsing fails, try to extract any JSON from the response using regex
      const jsonMatch = data.choices[0].message.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback if all parsing attempts fail
      return { 
        insufficient_data: true, 
        error: "Failed to generate properly formatted content",
        parseError: parseError instanceof Error ? parseError.message : "Unknown parsing error"
      };
    }
  } catch (error) {
    // Return an error message instead of fabricated data
    throw new Error("Unable to generate AI content at this time");
  }
}

// Helper function to create appropriate prompts for each section
function createPromptForSection(
  section: string,
  leadData: any,
  apolloData?: any
): string {
  const baseInfo = `
    Lead name: ${leadData.name || "Unknown"}
    Position: ${leadData.position || "Unknown"}
    Company: ${leadData.companyName || "Unknown"}
    Industry: ${leadData.companyDetails?.industry || "Unknown"}
    Company size: ${leadData.companyDetails?.employees || "Unknown"}
    Location: ${leadData.companyDetails?.headquarters || "Unknown"}
  `;

  const dataQualityPrompt = `
    INSTRUCTION: Keep all content extremely brief, specific, and actionable.
    
    Content length limits:
    - Summaries: 1-2 sentences maximum
    - Lists: 2-3 items maximum
    - Descriptions: Short, concise phrases only
    
    Avoid:
    - Vague, generic statements
    - Extended explanations
    - Obvious information
    
    For specific company details:
    - Only include information directly from the data provided
    - Do not fabricate statistics, names, or events
    
    For general industry insights:
    - Focus only on the most relevant points
    - Keep industry observations extremely specific
    
    Your response MUST be valid JSON. Example:
    {
      "summary": "Medium-sized healthcare company focused on patient care and compliance.",
      "keyPoints": [
        "Operating in regulated healthcare sector", 
        "Likely needs solutions for data security"
      ],
      "insufficient_data": false
    }
  `;

  switch (section) {
    case "overview":
      return `${baseInfo}
        ${dataQualityPrompt}
        Based ONLY on the above information, provide a brief overview of this lead.
        Include a 1-2 sentence summary and MAXIMUM 3 key points most relevant for sales.
        Keep all content extremely concise and focused on actionable insights.
        Format the response as JSON with 'summary' and 'keyPoints' fields.
        If you don't have enough information, include 'insufficient_data: true' in your JSON response.
      `;
    case "company":
      return `${baseInfo}
        ${dataQualityPrompt}
        Provide a brief, focused analysis of this company based on available data.
        
        Include only:
        - A 1-2 sentence description combining company data with essential industry knowledge
        - A 1 sentence market positioning statement
        - MAXIMUM 2-3 specific challenges likely faced based on industry
        
        Format as JSON with 'description', 'marketPosition', and 'challenges' fields.
        All content must be extremely concise and specific with no vague generalizations.
        
        Only use 'insufficient_data: true' if there is absolutely no industry information.
      `;
    case "competitors":
      return `${baseInfo}
        ${dataQualityPrompt}
        Provide a concise competitive analysis for this company's industry.
        
        Include only:
        - MAXIMUM 3 competitor types or categories most relevant to this company
        - A single sentence about key competitive advantage opportunities 
        - A single sentence about market dynamics
        
        Format as JSON with 'mainCompetitors', 'competitiveAdvantage', and 'marketDynamics' fields.
        Keep all content extremely brief and specific with no generalizations.
        
        Only use 'insufficient_data: true' if there is absolutely no industry information.
      `;
    case "techStack":
      return `${baseInfo}
        ${dataQualityPrompt}
        Provide a concise technology analysis for this company based on industry.
        
        Include only:
        - 2-3 most relevant technology categories likely used
        - 1-2 specific pain points related to technology
        - 1-2 focused opportunities for improvement
        - 1-2 specific technology recommendations
        
        Format as JSON with 'currentTechnologies', 'painPoints', 'opportunities', and 'recommendations' fields.
        All content must be extremely brief and specific.
        
        Only use 'insufficient_data: true' if absolutely no industry information.
      `;
    case "news":
      return `${baseInfo}
        ${dataQualityPrompt}
        Identify MAXIMUM 2-3 key industry trends most relevant to this company.
        Keep each trend to a single, specific sentence.
        DO NOT reference specific news articles or events.
        Format as JSON with 'relevantIndustryTrends' field containing an array.
        Only use 'insufficient_data: true' if no industry information.
      `;
    case "nextSteps":
      return `${baseInfo}
        ${dataQualityPrompt}
        Provide MAXIMUM 2 highly specific next action recommendations for interacting with the lead.
        
        Focus strictly on business action recommendations:
        - DO NOT include any personal information about who's viewing the report
        - DO NOT reference names of people viewing the report
        - DO NOT reference company names of people viewing the report
        - DO NOT include details about the viewer's position or background
        
        For each action, include only:
        - A brief, specific action description (1 sentence)
        - A very short rationale (under 10 words)
        - Priority level
        
        Format as JSON with 'recommendedActions' as an array of objects containing
        'description', 'rationale', and 'priority' fields.
        
        Only use 'insufficient_data: true' if no position or industry information.
      `;
    case "meeting":
      return `${baseInfo}
        ${dataQualityPrompt}
        Based ONLY on the above information, provide general guidance for an upcoming meeting.
        Include suggested talking points based on the lead's industry and position.
        DO NOT reference specific projects, initiatives, or needs unless they are mentioned in the provided data.
        Focus on standard discovery questions appropriate for a lead in this industry.
        Format the response as JSON with 'suggestedAgenda', 'keyQuestions' (array), and 'preparationTips' fields.
        If you don't have enough information, include 'insufficient_data: true' in your JSON response.
      `;
    case "interactions":
      return `${baseInfo}
        ${dataQualityPrompt}
        Based ONLY on the above information, provide general recommendations for effective interactions.
        Focus on standard communication best practices for a lead in this industry and position.
        DO NOT make claims about the lead's specific preferences, personality, or communication style unless mentioned in the provided data.
        Format the response as JSON with 'communicationPreferences', 'personalizationTips' (array), and 'dosDonts' fields.
        If you don't have enough information, include 'insufficient_data: true' in your JSON response.
      `;
    case "strategicBrief":
      return `${baseInfo}
        ${dataQualityPrompt}
        Based on the lead's position, company, and industry, create a focused strategic meeting brief for this sales opportunity.
        
        Provide:
        1. PRIMARY OBJECTIVE: A clear 1-2 sentence goal for the meeting (what you want to achieve or secure)
        2. RECOMMENDED APPROACH: A compelling 2-sentence pitch explaining your solution's unique value
        3. KEY BENEFITS: Exactly 3 specific benefit points (short phrases, 3-6 words each)
        4. CRITICAL DISCIPLINE: One specific warning or thing to avoid during the meeting
        
        Format as JSON with these exact fields:
        {
          "primaryObjective": "string",
          "recommendedApproach": "string", 
          "keyBenefits": ["benefit1", "benefit2", "benefit3"],
          "criticalDiscipline": "string"
        }
        
        Make all content specific to the lead's industry and role. Keep language professional and actionable.
        If insufficient data, include 'insufficient_data: true'.
      `;
    default:
      return `${baseInfo}
        ${dataQualityPrompt}
        Generate content for the ${section} section of a lead report.
        Format the response as JSON with relevant fields for this section.
        If you don't have enough information, include 'insufficient_data: true' in your JSON response.
      `;
  }
}
