import { NextResponse } from 'next/server';
import { connect } from '@/config/db';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/config/jwt';

export async function GET() {
    try {
        // Get access token from cookies
        const cookieStore = cookies();
        const accessToken = cookieStore.get('accessToken');

        if (!accessToken) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Verify token and get company email
        const decoded = verifyAccessToken(accessToken.value);
        if (!decoded || decoded.role !== 'business') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Connect to database
        const db = await connect();
        
        // Find company by email
        const company = await db.collection('companies').findOne(
            { companyEmail: decoded.email },
            { projection: { 
                companyEmail: 1,
                companyName: 1,
                name: 1,
                bid: 1,
                _id: 0 
            }}
        );

        if (!company) {
            return NextResponse.json(
                { error: 'Company not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(company);
    } catch (error) {
        console.error('Error fetching company profile:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 