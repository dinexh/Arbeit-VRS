import { connect } from '@/config/db';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/config/jwt';
import { GridFSBucket, ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';

// Get all resumes for the user
export async function GET() {
    try {
        const cookieStore = awaitcookies();
        const accessToken = cookieStore.get('accessToken');
        
        if (!accessToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = verifyAccessToken(accessToken.value);
        if (!decoded.email) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const db = await connect();
        const resumes = await db.collection('resumes.files')
            .find({ 'metadata.userEmail': decoded.email })
            .toArray();

        return NextResponse.json(resumes);
    } catch (error) {
        console.error('Error fetching resumes:', error);
        return NextResponse.json(
            { error: 'Failed to fetch resumes' },
            { status: 500 }
        );
    }
}

// Upload a new resume
export async function POST(request) {
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

        const formData = await request.formData();
        const file = formData.get('resume');
        
        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const db = await connect();
        const bucket = new GridFSBucket(db, { bucketName: 'resumes' });

        // Create a unique filename
        const timestamp = new Date().getTime();
        const filename = `${decoded.email}_${timestamp}_${file.name}`;

        // Upload file to GridFS
        const uploadStream = bucket.openUploadStream(filename, {
            metadata: {
                userEmail: decoded.email,
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
            fileId: uploadStream.id.toString()
        });
    } catch (error) {
        console.error('Error uploading resume:', error);
        return NextResponse.json(
            { error: 'Failed to upload resume' },
            { status: 500 }
        );
    }
} 