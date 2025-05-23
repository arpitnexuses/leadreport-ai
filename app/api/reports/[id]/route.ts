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
    console.log("Received update data:", body);
    
    await client.connect();
    const db = client.db('lead-reports');
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