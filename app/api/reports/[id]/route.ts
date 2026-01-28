import { NextRequest, NextResponse } from "next/server";
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Type for serialized data
interface ReportData {
  _id?: string | ObjectId;
  [key: string]: any;
}

// Helper function to serialize MongoDB document
const serializeDocument = (data: ReportData): ReportData => {
  if (!data) return {};
  
  // Create a new object to avoid modifying the original
  const serialized: ReportData = { ...data };
  
  // Convert ObjectId to string
  if (serialized._id && typeof serialized._id !== 'string') {
    serialized._id = serialized._id.toString();
  }
  
  // Convert Date objects to ISO strings and recursively serialize nested objects/arrays
  for (const key in serialized) {
    if (serialized[key] instanceof Date) {
      serialized[key] = serialized[key].toISOString();
    } else if (Array.isArray(serialized[key])) {
      serialized[key] = serialized[key].map((item: any) => 
        typeof item === 'object' && item !== null ? serializeDocument(item) : item
      );
    } else if (typeof serialized[key] === 'object' && serialized[key] !== null) {
      serialized[key] = serializeDocument(serialized[key]);
    }
  }
  
  return serialized;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const reportId = id;
    
    if (!reportId) {
      return NextResponse.json({ error: "Report ID is required" }, { status: 400 });
    }
    
    // Validate ObjectId format
    if (!ObjectId.isValid(reportId)) {
      return NextResponse.json({ error: "Invalid report ID format" }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db("lead-reports");
    const collection = db.collection('reports');
    
    // Find the report by ID
    const report = await collection.findOne({ _id: new ObjectId(reportId) });
    
    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }
    
    // Use the serializeDocument function to serialize the report
    const serializedReport = serializeDocument(report);
    
    // Return report data with appropriate status
    if (report.status === 'completed') {
      return NextResponse.json({
        status: 'completed',
        data: serializedReport
      });
    } else if (report.status === 'failed') {
      return NextResponse.json({
        status: 'failed',
        error: report.error || "Unknown error occurred during report generation"
      });
    } else {
      // Report is still processing
      return NextResponse.json({
        status: report.status || 'processing'
      });
    }
  } catch (error) {
    return NextResponse.json(
      { 
        error: "Failed to fetch report",
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const client = await clientPromise;
    const db = client.db("lead-reports");
    const reports = db.collection('reports');

    // Create update data object
    const updateData: any = {
      $set: {
        updatedAt: new Date(),
      },
    };
    
    // Handle full leadData replacement if provided
    if (body.leadData) {
      updateData.$set.leadData = body.leadData;
    } else {
      // Handle individual field updates
      if (body.notes) updateData.$set['leadData.notes'] = body.notes;
      if (body.tags) updateData.$set['leadData.tags'] = body.tags;
      if (body.status) updateData.$set['leadData.status'] = body.status;
      if (body.nextFollowUp) updateData.$set['leadData.nextFollowUp'] = body.nextFollowUp;
      if (body.customFields) updateData.$set['leadData.customFields'] = body.customFields;
    }
    
    // Handle skills and languages if provided
    if (body.skills) updateData.$set.skills = body.skills;
    if (body.languages) updateData.$set.languages = body.languages;
    
    // Handle AI content if provided
    if (body.aiContent) {
      updateData.$set.aiContent = body.aiContent;
    }
    
    // Handle sections toggle state if provided
    if (body.sections) {
      updateData.$set.sections = body.sections;
    }

    // Handle meeting data if provided
    if (body.meetingDate !== undefined) updateData.$set.meetingDate = body.meetingDate;
    if (body.meetingTime !== undefined) updateData.$set.meetingTime = body.meetingTime;
    if (body.meetingPlatform !== undefined) updateData.$set.meetingPlatform = body.meetingPlatform;
    if (body.meetingAgenda !== undefined) updateData.$set.meetingAgenda = body.meetingAgenda;
    if (body.participants !== undefined) updateData.$set.participants = body.participants;

    // Use findOneAndUpdate to do both update and retrieval in a single operation
    const updatedReport = await reports.findOneAndUpdate(
      { _id: new ObjectId(id) },
      updateData,
      { returnDocument: 'after' }
    );

    if (!updatedReport) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }
    
    const serializedReport = serializeDocument(updatedReport);
    
    // Return the report data directly for PATCH operations
    return NextResponse.json(serializedReport);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update report' },
      { status: 500 }
    );
  }
} 