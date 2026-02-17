import { NextRequest, NextResponse } from "next/server";
import { generateBatchAIContent, generateSingleAIContent } from "@/lib/ai-content-generator";

function truncateForLog(value: any, maxLength = 140): string {
  if (!value) return "";
  const normalized = String(value).replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength)}...`;
}

function buildContextAnchors(leadData: any, apolloData?: any, reportContext?: any) {
  const notes = reportContext?.notes || leadData?.notes || [];
  const timeline = reportContext?.engagementTimeline || leadData?.engagementTimeline || [];
  const apolloPerson = apolloData?.person || apolloData || {};
  const apolloOrg = apolloPerson?.organization || {};

  const objective = reportContext?.meetingObjective || reportContext?.meetingAgenda || "";
  const pitch = reportContext?.problemPitch || "";
  const leadBackground = leadData?.leadBackground || "";
  const companyOverview = leadData?.companyOverview || apolloOrg?.short_description || apolloOrg?.description || "";

  return {
    lead: {
      name: leadData?.name || apolloPerson?.name || "Unknown",
      role: leadData?.position || leadData?.leadDesignation || apolloPerson?.title || "Unknown",
      company: leadData?.companyName || apolloOrg?.name || "Unknown",
      industry: leadData?.companyDetails?.industry || leadData?.leadIndustry || apolloOrg?.industry || "Unknown"
    },
    hasSignals: {
      meetingObjective: Boolean(String(objective).trim()),
      problemPitch: Boolean(String(pitch).trim()),
      leadBackground: Boolean(String(leadBackground).trim()),
      companyOverview: Boolean(String(companyOverview).trim()),
      notes: Array.isArray(notes) && notes.length > 0,
      timeline: Array.isArray(timeline) && timeline.length > 0
    },
    signalCounts: {
      notes: Array.isArray(notes) ? notes.length : 0,
      timeline: Array.isArray(timeline) ? timeline.length : 0
    },
    excerpts: {
      objective: truncateForLog(objective),
      pitch: truncateForLog(pitch),
      leadBackground: truncateForLog(leadBackground),
      companyOverview: truncateForLog(companyOverview),
      latestNote: truncateForLog(Array.isArray(notes) && notes.length > 0 ? notes[notes.length - 1]?.content || notes[notes.length - 1] : ""),
      latestTimeline: truncateForLog(
        Array.isArray(timeline) && timeline.length > 0
          ? timeline[timeline.length - 1]?.content || timeline[timeline.length - 1]
          : ""
      )
    }
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const { section, leadData, apolloData, batchSections, reportContext } = body;
    const anchors = buildContextAnchors(leadData, apolloData, reportContext);

    // Check if this is a batch request
    if (batchSections && Array.isArray(batchSections)) {
      console.log("[AI_CONTEXT_ANCHORS][BATCH]", {
        sections: batchSections,
        anchors
      });
      const result = await generateBatchAIContent(batchSections, leadData, apolloData, reportContext);
      return NextResponse.json(result);
    }

    if (!section || !leadData) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Generate content for single section
    console.log("[AI_CONTEXT_ANCHORS][SINGLE]", {
      section,
      anchors
    });
    const processedResponse = await generateSingleAIContent(section, leadData, apolloData, reportContext);

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