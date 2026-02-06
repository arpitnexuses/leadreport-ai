import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let client;
  
  try {
    const { id } = await params;
    client = await clientPromise;
    const db = client.db('lead-reports');
    const reports = db.collection('reports');

    // Try to parse the ObjectId, if it fails, return a 400 error
    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid report ID format' }, { status: 400 });
    }

    const report = await reports.findOne({ _id: objectId });
    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }
    
    // Return a modified version of the full report data
    // We'll keep all sections but omit any sensitive information
    return NextResponse.json({
      _id: report._id,
      leadData: report.leadData,
      apolloData: report.apolloData,
      meetingDate: report.meetingDate,
      meetingTime: report.meetingTime,
      meetingPlatform: report.meetingPlatform,
      meetingName: report.meetingName,
      problemPitch: report.problemPitch,
      meetingAgenda: report.meetingAgenda,
      participants: report.participants,
      nextSteps: report.nextSteps,
      recommendedActions: report.recommendedActions,
      followUpTimeline: report.followUpTimeline,
      talkingPoints: report.talkingPoints,
      aiContent: report.aiContent,
      sections: report.sections,
      createdAt: report.createdAt,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch report' },
      { status: 500 }
    );
  }
} 