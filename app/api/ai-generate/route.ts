import { NextRequest, NextResponse } from "next/server";
import { processAIResponse } from "@/lib/report-content-enhancer";

export async function POST(req: NextRequest) {
  try {
    const { section, leadData, apolloData } = await req.json();

    if (!section || !leadData) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Call OpenAI to generate content
    const aiResponse = await generateWithAI(section, leadData, apolloData);
    
    // Process and enhance the response
    const processedResponse = processAIResponse(section, aiResponse);

    return NextResponse.json(processedResponse);
  } catch (error) {
    console.error("Error in AI generation:", error);
    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 }
    );
  }
}

// Function to generate content using OpenAI API
async function generateWithAI(
  section: string,
  leadData: any,
  apolloData?: any
) {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  if (!OPENAI_API_KEY) {
    console.error("OpenAI API key is missing");
    throw new Error("API configuration error");
  }

  const prompt = createPromptForSection(section, leadData, apolloData);

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
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
      console.error("OpenAI API error:", errorData);
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
      
      // Otherwise, parse the string as JSON
      return JSON.parse(content);
    } catch (parseError) {
      console.error("Error parsing OpenAI response:", parseError);
      
      // If parsing fails, try to extract any JSON from the response using regex
      try {
        const jsonMatch = data.choices[0].message.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        // If all attempts fail, return an error object
        return { 
          insufficient_data: true, 
          error: "Failed to generate properly formatted content" 
        };
      }
    }
  } catch (error) {
    console.error("Error calling OpenAI:", error);
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
    default:
      return `${baseInfo}
        ${dataQualityPrompt}
        Generate content for the ${section} section of a lead report.
        Format the response as JSON with relevant fields for this section.
        If you don't have enough information, include 'insufficient_data: true' in your JSON response.
      `;
  }
}
