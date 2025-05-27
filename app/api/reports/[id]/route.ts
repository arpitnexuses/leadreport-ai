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
  
  // Convert Date objects to ISO strings
  for (const key in serialized) {
    if (serialized[key] instanceof Date) {
      serialized[key] = serialized[key].toISOString();
    } else if (typeof serialized[key] === 'object' && serialized[key] !== null) {
      serialized[key] = serializeDocument(serialized[key]);
    }
  }
  
  return serialized;
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log(`Fetching report data for ID: ${params.id}`);
  try {
    const reportId = params.id;
    
    if (!reportId) {
      console.error("Report ID is missing in request params");
      return NextResponse.json({ error: "Report ID is required" }, { status: 400 });
    }
    
    // Validate ObjectId format
    if (!ObjectId.isValid(reportId)) {
      console.error(`Invalid report ID format: ${reportId}`);
      return NextResponse.json({ error: "Invalid report ID format" }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db("lead-reports");
    const collection = db.collection('reports');
    
    // Find the report by ID
    const report = await collection.findOne({ _id: new ObjectId(reportId) });
    
    if (!report) {
      console.error(`Report not found with ID: ${reportId}`);
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }
    
    // Use the serializeDocument function to serialize the report
    const serializedReport = serializeDocument(report);
    
    // Return report data with appropriate status
    if (report.status === 'completed') {
      console.log(`Successfully fetched completed report: ${reportId}`);
      return NextResponse.json({
        status: 'completed',
        data: serializedReport
      });
    } else if (report.status === 'failed') {
      console.log(`Fetched failed report: ${reportId}, Error: ${report.error || 'No error message'}`);
      return NextResponse.json({
        status: 'failed',
        error: report.error || "Unknown error occurred during report generation"
      });
    } else {
      // Report is still processing
      console.log(`Fetched in-progress report: ${reportId}, Status: ${report.status}`);
      return NextResponse.json({
        status: report.status || 'processing'
      });
    }
  } catch (error) {
    console.error("Error fetching report:", error);
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
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    console.log("Received update data:", body);
    
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
      console.log("Updating lead data with:", body.leadData);
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
      console.log("Updating AI content:", body.aiContent);
    }
    
    console.log("Final update data:", updateData);

    const result = await reports.updateOne(
      { _id: new ObjectId(params.id) },
      updateData
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    const updatedReport = await reports.findOne({ _id: new ObjectId(params.id) });
    // Serialize the updated report before sending it
    if (!updatedReport) {
      return NextResponse.json({ error: 'Report not found after update' }, { status: 404 });
    }
    const serializedReport = serializeDocument(updatedReport);
    return NextResponse.json(serializedReport);
  } catch (error) {
    console.error('Error updating report:', error);
    return NextResponse.json(
      { error: 'Failed to update report' },
      { status: 500 }
    );
  }
} 