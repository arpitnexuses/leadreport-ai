import { NextRequest, NextResponse } from "next/server";
import clientPromise from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    console.log("Debug endpoint called");
    
    // Test MongoDB connection
    const client = await clientPromise;
    console.log("MongoDB client connected");
    
    const db = client.db("lead-reports");
    console.log("Database selected");
    
    const collection = db.collection('reports');
    console.log("Collection selected");
    
    // Count documents to test the connection
    const count = await collection.countDocuments();
    console.log(`Found ${count} reports in the database`);
    
    // Get database information
    const adminDb = client.db().admin();
    const dbInfo = await adminDb.listDatabases();
    
    return NextResponse.json({
      status: "success",
      mongodb: {
        connected: true,
        reportsCount: count,
        databases: dbInfo.databases.map((db: any) => db.name)
      },
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Debug endpoint error:", error);
    return NextResponse.json(
      { 
        status: "error",
        error: "Failed to connect to MongoDB",
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : null,
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    );
  }
} 