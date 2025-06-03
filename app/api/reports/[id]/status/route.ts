import { NextRequest, NextResponse } from "next/server";
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reportId = params.id;
    
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
    
    // Return status information only
    return NextResponse.json({
      status: report.status || 'processing',
      error: report.error || null
    });
    
  } catch (error) {
    return NextResponse.json(
      { 
        error: "Failed to fetch report status",
        details: error instanceof Error ? error.message : String(error)
      }, 
      { status: 500 }
    );
  }
} 