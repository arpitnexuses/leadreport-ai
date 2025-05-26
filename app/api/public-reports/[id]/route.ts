import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  let client;
  
  try {
    console.log(`Fetching public report with ID: ${params.id}`);
    client = await clientPromise;
    const db = client.db('lead-reports');
    const reports = db.collection('reports');

    // Try to parse the ObjectId, if it fails, return a 400 error
    let objectId;
    try {
      objectId = new ObjectId(params.id);
    } catch (error) {
      console.error('Invalid ObjectId format:', params.id);
      return NextResponse.json({ error: 'Invalid report ID format' }, { status: 400 });
    }

    const report = await reports.findOne({ _id: objectId });
    if (!report) {
      console.error('Report not found with ID:', params.id);
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    console.log('Found report:', report._id.toString());
    
    // Return a modified version of the full report data
    // We'll keep all sections but omit any sensitive information
    return NextResponse.json({
      _id: report._id,
      leadData: report.leadData,
      apolloData: report.apolloData,
      meetingDate: report.meetingDate,
      meetingTime: report.meetingTime,
      meetingPlatform: report.meetingPlatform,
      problemPitch: report.problemPitch,
      meetingAgenda: report.meetingAgenda,
      participants: report.participants,
      nextSteps: report.nextSteps,
      recommendedActions: report.recommendedActions,
      followUpTimeline: report.followUpTimeline,
      talkingPoints: report.talkingPoints,
      aiContent: report.aiContent,
      createdAt: report.createdAt,
    });
  } catch (error) {
    console.error('Error fetching public report:', error);
    return NextResponse.json(
      { error: 'Failed to fetch report' },
      { status: 500 }
    );
  }
} 