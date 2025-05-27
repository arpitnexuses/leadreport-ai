import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing MongoDB connection...');
    
    // Connect to MongoDB
    const client = await clientPromise;
    console.log('MongoDB client connected successfully');
    
    // Get the database and list collections
    const db = client.db('lead-reports');
    const collections = await db.listCollections().toArray();
    
    // Get count of reports
    const reportsCount = await db.collection('reports').countDocuments();
    
    return NextResponse.json({
      success: true,
      collections: collections.map(c => c.name),
      reportsCount,
      message: 'MongoDB connection successful!'
    });
  } catch (error) {
    console.error('MongoDB connection test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'MongoDB connection failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : null
    }, { status: 500 });
  }
} 