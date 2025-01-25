import { connect } from '@/config/db';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/config/jwt';
import { GridFSBucket, ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';

// Get a specific resume
export async function GET(request, { params }) {
    try {
        const cookieStore = cookies();
        const accessToken = cookieStore.get('accessToken');
        
        if (!accessToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = verifyAccessToken(accessToken.value);
        if (!decoded.email) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const db = await connect();
        const bucket = new GridFSBucket(db, { bucketName: 'resumes' });

        // Find the file metadata
        const file = await db.collection('resumes.files').findOne({
            _id: new ObjectId(params.resumeId),
            'metadata.userEmail': decoded.email
        });

        if (!file) {
            return NextResponse.json(
                { error: 'Resume not found' },
                { status: 404 }
            );
        }

        // Create a readable stream
        const downloadStream = bucket.openDownloadStream(new ObjectId(params.resumeId));

        // Convert stream to buffer
        const chunks = [];
        for await (const chunk of downloadStream) {
            chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);

        // Return the file with appropriate headers
        return new Response(buffer, {
            headers: {
                'Content-Type': file.metadata.contentType,
                'Content-Disposition': `inline; filename="${file.metadata.originalName}"`,
            },
        });
    } catch (error) {
        console.error('Error fetching resume:', error);
        return NextResponse.json(
            { error: 'Failed to fetch resume' },
            { status: 500 }
        );
    }
}

// Delete a resume
export async function DELETE(request, { params }) {
    try {
        const cookieStore = cookies();
        const accessToken = cookieStore.get('accessToken');
        
        if (!accessToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = verifyAccessToken(accessToken.value);
        if (!decoded.email) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const db = await connect();
        const bucket = new GridFSBucket(db, { bucketName: 'resumes' });

        // Verify the resume belongs to the user
        const file = await db.collection('resumes.files').findOne({
            _id: new ObjectId(params.resumeId),
            'metadata.userEmail': decoded.email
        });

        if (!file) {
            return NextResponse.json(
                { error: 'Resume not found' },
                { status: 404 }
            );
        }

        // Delete the file
        await bucket.delete(new ObjectId(params.resumeId));

        return NextResponse.json({
            message: 'Resume deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting resume:', error);
        return NextResponse.json(
            { error: 'Failed to delete resume' },
            { status: 500 }
        );
    }
} 