import { NextRequest, NextResponse } from "next/server";
import { generateBatchAIContent, generateSingleAIContent } from "@/lib/ai-content-generator";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const { section, leadData, apolloData, batchSections } = body;

    // Check if this is a batch request
    if (batchSections && Array.isArray(batchSections)) {
      const result = await generateBatchAIContent(batchSections, leadData, apolloData);
      return NextResponse.json(result);
    }

    if (!section || !leadData) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Generate content for single section
    const processedResponse = await generateSingleAIContent(section, leadData, apolloData);

    return NextResponse.json(processedResponse);
  } catch (error) {
    // Include stack trace for better debugging
    const errorDetails = error instanceof Error 
      ? { message: error.message, stack: error.stack } 
      : { message: String(error) };
    
    return NextResponse.json(
      { 
        error: "Failed to generate content",
        details: errorDetails.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// All AI generation logic has been moved to lib/ai-content-generator.ts
// This keeps the API route thin and allows direct function calls from server actions