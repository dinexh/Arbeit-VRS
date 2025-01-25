import { connect } from '@/config/db';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/config/jwt';
import { GridFSBucket, ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';

// Get all resumes for the user
export async function GET(request) {
    try {
        const accessToken = await cookies().get('accessToken')?.value;
        if (!accessToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decodedToken = await verifyAccessToken(accessToken);
        if (!decodedToken) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const db = await connect();
        const bucket = new GridFSBucket(db);

        // Find all files for this user
        const files = await db.collection('fs.files')
            .find({ 'metadata.userEmail': decodedToken.email })
            .sort({ uploadDate: -1 })
            .toArray();

        return NextResponse.json(files.map(file => ({
            id: file._id.toString(),
            filename: file.filename,
            originalName: file.metadata.originalName,
            uploadDate: file.metadata.uploadDate,
            size: file.length
        })));
    } catch (error) {
        console.error('Error fetching resumes:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// Upload a new resume
export async function POST(request) {
    try {
        const accessToken = cookies().get('accessToken')?.value;
        if (!accessToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decodedToken = await verifyAccessToken(accessToken);
        if (!decodedToken) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('resume');
        
        if (!file) {
            return NextResponse.json({ error: 'No resume file provided' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const db = await connect();
        const bucket = new GridFSBucket(db);

        // Create a unique filename
        const timestamp = new Date().toISOString();
        const filename = `${decodedToken.email}_${timestamp}_${file.name}`;

        // Upload file to GridFS
        const uploadStream = bucket.openUploadStream(filename, {
            metadata: {
                userEmail: decodedToken.email,
                originalName: file.name,
                uploadDate: new Date(),
                contentType: file.type
            }
        });

        await new Promise((resolve, reject) => {
            uploadStream.end(buffer, (error) => {
                if (error) reject(error);
                else resolve();
            });
        });

        return NextResponse.json({ 
            message: 'Resume uploaded successfully',
            resumeId: uploadStream.id.toString()
        });
    } catch (error) {
        console.error('Error uploading resume:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const accessToken = cookies().get('accessToken')?.value;
        if (!accessToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decodedToken = await verifyAccessToken(accessToken);
        if (!decodedToken) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const resumeId = searchParams.get('id');
        
        if (!resumeId) {
            return NextResponse.json({ error: 'Resume ID is required' }, { status: 400 });
        }

        const db = await connect();
        const bucket = new GridFSBucket(db);

        // Verify the resume belongs to the user
        const file = await db.collection('fs.files').findOne({
            _id: new ObjectId(resumeId),
            'metadata.userEmail': decodedToken.email
        });

        if (!file) {
            return NextResponse.json({ error: 'Resume not found or unauthorized' }, { status: 404 });
        }

        // Delete the file
        await bucket.delete(new ObjectId(resumeId));

        return NextResponse.json({ message: 'Resume deleted successfully' });
    } catch (error) {
        console.error('Error deleting resume:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 