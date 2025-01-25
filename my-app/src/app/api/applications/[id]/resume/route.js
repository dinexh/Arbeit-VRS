import { NextResponse } from 'next/server';
import { connect } from '@/config/db';
import { GridFSBucket, ObjectId } from 'mongodb';

export async function GET(request, context) {
  try {
    const id = await context.params.id;
    const db = await connect();
    const application = await db.collection('applications').findOne(
      { _id: new ObjectId(id) }
    );

    if (!application || !application.resumeId) {
      return NextResponse.json(
        { error: 'Resume not found' },
        { status: 404 }
      );
    }

    const bucket = new GridFSBucket(db);
    const downloadStream = bucket.openDownloadStream(new ObjectId(application.resumeId));

    // Convert stream to buffer
    const chunks = [];
    for await (const chunk of downloadStream) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Return PDF with proper headers
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${application.userId}_resume.pdf"`
      }
    });
  } catch (error) {
    console.error('Error fetching resume:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resume' },
      { status: 500 }
    );
  }
} 