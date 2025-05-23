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
              "You are a sales intelligence assistant that provides concise, actionable insights for sales professionals. Your responses must be in valid JSON format. IMPORTANT: For specific company details, only provide information that is DIRECTLY SUPPORTED by the data provided. However, you should provide general industry insights based on the company's industry, size, and other contextual clues. Distinguish clearly between specific company information and general industry knowledge in your responses. If there isn't enough information to generate meaningful content about the specific company, focus on providing valuable industry insights instead."
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
    INSTRUCTION: Balance factual accuracy with providing valuable insights.
    
    For specific company details:
    - Do not fabricate company statistics, financial data, or specific metrics
    - Do not make up names of competitors, products, or technologies
    - Do not fabricate historical events or future predictions about the specific company
    
    For general industry insights:
    - Provide valuable context based on standard industry knowledge
    - Include typical challenges, opportunities, and trends for the industry
    - Offer general insights that would be valuable for sales conversations
    
    Only use 'insufficient_data: true' when you cannot provide ANY meaningful insights, even general ones.
    
    Your response MUST be valid JSON. For example:
    {
      "summary": "Based on the available information, this lead works at a medium-sized company in the healthcare industry. Healthcare companies typically focus on patient care, regulatory compliance, and technology integration.",
      "keyPoints": [
        "Company operates in healthcare sector", 
        "Medium-sized organization", 
        "Industry typically faces challenges with regulatory compliance",
        "Healthcare organizations often prioritize patient data security"
      ],
      "insufficient_data": false
    }
  `;

  switch (section) {
    case "overview":
      return `${baseInfo}
        ${dataQualityPrompt}
        Based ONLY on the above information, provide a brief overview of this lead.
        Include a summary that directly reflects the provided data and 3-5 key points that would be relevant for a sales conversation.
        DO NOT add any specific details that aren't included in the provided information.
        Format the response as JSON with 'summary' and 'keyPoints' fields.
        If you don't have enough information, include 'insufficient_data: true' in your JSON response.
      `;
    case "company":
      return `${baseInfo}
        ${dataQualityPrompt}
        Based on the above information about the company and industry standards, provide meaningful insights about the company.
        
        Even if specific company details are limited, provide general industry insights based on:
        1. The company's industry (${leadData.companyDetails?.industry || "Unknown"})
        2. Company size (${leadData.companyDetails?.employees || "Unknown"})
        3. The lead's position (${leadData.position || "Unknown"})
        
        Include:
        - A description that combines available company data with general industry knowledge
        - An analysis of typical market positioning for companies in this industry and size range
        - Common challenges faced by companies in this industry
        
        Format the response as JSON with 'description', 'marketPosition', and 'challenges' fields.
        Each field should provide valuable insights even if based on general industry knowledge.
        
        Example format for limited data:
        {
          "description": "Based on available information, [Company] operates in the [Industry] sector. Companies in this industry typically focus on [general industry description].",
          "marketPosition": "Companies of this size in the [Industry] sector often compete in [market segment] and differentiate through [typical differentiators].",
          "challenges": ["Challenge 1 typical for this industry", "Challenge 2 typical for this industry", "Challenge 3 typical for this industry"],
          "insufficient_data": false
        }
        
        Only use 'insufficient_data: true' if there is absolutely no information about the industry or company size.
      `;
    case "competitors":
      return `${baseInfo}
        ${dataQualityPrompt}
        Based on the company's industry (${leadData.companyDetails?.industry || "Unknown"}) and size (${leadData.companyDetails?.employees || "Unknown"}), provide insights about competitive landscape.
        
        Even with limited specific company information, provide:
        1. Types of competitors typically found in this industry
        2. General competitive dynamics in this industry
        3. Potential competitive advantages that could be relevant
        
        Format the response as JSON with:
        - 'mainCompetitors' as an array of strings describing competitor types or categories
        - 'competitiveAdvantage' as a string describing potential competitive advantages
        - 'marketDynamics' as a string describing the competitive landscape
        
        Example format:
        {
          "mainCompetitors": ["Enterprise software providers", "Specialized consulting firms", "Industry-specific solution providers"],
          "competitiveAdvantage": "Companies can differentiate through industry expertise, technology innovation, and customer service quality.",
          "marketDynamics": "The market is characterized by rapid consolidation, increasing focus on AI-driven solutions, and growing demand for integrated platforms.",
          "insufficient_data": false
        }
        
        Only use 'insufficient_data: true' if there is absolutely no information about the industry.
      `;
    case "techStack":
      return `${baseInfo}
        ${dataQualityPrompt}
        Based on the company's industry (${leadData.companyDetails?.industry || "Unknown"}) and size (${leadData.companyDetails?.employees || "Unknown"}), provide insights about their likely technology stack and needs.
        
        Even with limited specific company information, provide:
        1. Common technologies used in this industry and by companies of this size
        2. Typical technology pain points for companies in this industry
        3. Opportunities for technology improvement or innovation
        
        Format the response as JSON with:
        - 'currentTechnologies' as an array of strings with likely technology categories
        - 'painPoints' as an array of strings describing common technology challenges
        - 'opportunities' as an array of strings describing potential areas for improvement
        - 'recommendations' as an array of strings with specific technology recommendations
        
        Example format:
        {
          "currentTechnologies": ["CRM Systems", "ERP Software", "Cloud Infrastructure", "Data Analytics Tools"],
          "painPoints": [
            "Legacy system integration issues",
            "Data silos preventing unified customer view",
            "Security concerns with remote work infrastructure"
          ],
          "opportunities": [
            "AI-powered customer insights could improve retention",
            "Cloud migration would enhance operational flexibility",
            "Integrated data platform would improve decision making"
          ],
          "recommendations": [
            "Evaluate current data integration strategy",
            "Assess security posture for cloud applications",
            "Consider AI-augmented analytics solutions"
          ],
          "insufficient_data": false
        }
        
        Only use 'insufficient_data: true' if there is absolutely no information about the industry.
      `;
    case "news":
      return `${baseInfo}
        ${dataQualityPrompt}
        Based ONLY on the above information, identify relevant industry trends that might affect this company.
        DO NOT reference specific news articles, dates, or events unless they are mentioned in the provided data.
        Instead, focus on general industry trends that would be relevant based on the company's industry.
        DO NOT make up specific news items, statistics, or events.
        Format the response as JSON with 'relevantIndustryTrends' as an array of general industry trends.
        If you don't have enough information, include 'insufficient_data: true' in your JSON response.
      `;
    case "nextSteps":
      return `${baseInfo}
        ${dataQualityPrompt}
        Based on the company's industry (${leadData.companyDetails?.industry || "Unknown"}), size (${leadData.companyDetails?.employees || "Unknown"}), and the lead's position (${leadData.position || "Unknown"}), recommend actionable next steps for engaging with this lead.
        
        Even with limited specific company information, provide:
        1. Specific, actionable recommendations for follow-up
        2. Tailored talking points based on industry knowledge
        3. Resources or materials that would be valuable to share
        
        Format the response as JSON with 'recommendedActions' as an array of objects, each containing:
        - 'description': A specific, actionable recommendation
        - 'rationale': Brief explanation of why this action is recommended
        - 'priority': "High", "Medium", or "Low"
        
        Example format:
        {
          "recommendedActions": [
            {
              "description": "Schedule a discovery call focused on their technology infrastructure challenges",
              "rationale": "Companies in this industry often struggle with legacy system integration",
              "priority": "High"
            },
            {
              "description": "Share industry-specific case study highlighting ROI improvements",
              "rationale": "Demonstrates value proposition with relevant examples",
              "priority": "Medium"
            },
            {
              "description": "Connect with other stakeholders in the IT department",
              "rationale": "Decisions in this industry typically involve multiple technical stakeholders",
              "priority": "Medium"
            }
          ],
          "insufficient_data": false
        }
        
        Only use 'insufficient_data: true' if there is absolutely no information about the industry or lead position.
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
