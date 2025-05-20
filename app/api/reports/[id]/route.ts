import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

const client = new MongoClient(MONGODB_URI);

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await client.connect();
    const db = client.db('lead-reports');
    const reports = db.collection('reports');

    const report = await reports.findOne({ _id: new ObjectId(params.id) });
    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    return NextResponse.json(report);
  } catch (error) {
    console.error('Error fetching report:', error);
    return NextResponse.json(
      { error: 'Failed to fetch report' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    await client.connect();
    const db = client.db('lead-reports');
    const reports = db.collection('reports');

    const updateData = {
      $set: {
        'leadData.notes': body.notes,
        'leadData.tags': body.tags,
        'leadData.status': body.status,
        'leadData.nextFollowUp': body.nextFollowUp,
        'leadData.customFields': body.customFields,
        updatedAt: new Date(),
      },
    };

    const result = await reports.updateOne(
      { _id: new ObjectId(params.id) },
      updateData
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    const updatedReport = await reports.findOne({ _id: new ObjectId(params.id) });
    return NextResponse.json(updatedReport);
  } catch (error) {
    console.error('Error updating report:', error);
    return NextResponse.json(
      { error: 'Failed to update report' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
} 