import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { connect, disconnect } from '@/config/db';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/config/jwt';

// Create a transporter for sending emails
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// Helper function to verify business auth
async function verifyBusinessAuth() {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken');

    if (!accessToken) {
        throw new Error('Unauthorized');
    }

    const decoded = verifyAccessToken(accessToken.value);
    
    if (!decoded || decoded.role !== 'business') {
        throw new Error('Unauthorized');
    }

    return decoded;
}

// Email templates for different status updates
const emailTemplates = {
    Approved: {
        subject: 'Application Approved - Next Steps',
        text: (applicantName, jobTitle, companyName) => `
Dear ${applicantName},

Great news! Your application for the ${jobTitle} position at ${companyName} has been approved. We were impressed with your qualifications and experience.

We will be in touch shortly with more details about the next steps in our hiring process.

Best regards,
${companyName} Hiring Team
        `,
    },
    Rejected: {
        subject: 'Application Status Update',
        text: (applicantName, jobTitle, companyName) => `
Dear ${applicantName},

Thank you for your interest in the ${jobTitle} position at ${companyName} and for taking the time to go through our application process.

After careful consideration, we regret to inform you that we have decided to move forward with other candidates whose qualifications more closely match our current needs.

We appreciate your interest in joining our team and wish you the best in your job search.

Best regards,
${companyName} Hiring Team
        `,
    },
    'Interview Scheduled': {
        subject: 'Interview Invitation',
        text: (applicantName, jobTitle, companyName) => `
Dear ${applicantName},

We are pleased to invite you for an interview for the ${jobTitle} position at ${companyName}.

Our hiring team will contact you shortly to schedule the interview at a time that works best for you.

Please prepare to discuss your experience and qualifications in detail.

Best regards,
${companyName} Hiring Team
        `,
    },
};

export async function POST(request) {
    try {
        // Verify business authentication
        const decoded = await verifyBusinessAuth();
        
        const { applicationId, status, applicantName, applicantEmail, jobTitle } = await request.json();
        
        if (!applicationId || !status || !applicantName || !applicantEmail || !jobTitle) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const template = emailTemplates[status];
        if (!template) {
            return NextResponse.json(
                { error: 'Invalid status' },
                { status: 400 }
            );
        }

        // Send email
        await transporter.sendMail({
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to: applicantEmail,
            subject: template.subject,
            text: template.text(applicantName, jobTitle, decoded.companyName),
        });

        // Update application status in database
        const db = await connect();
        await db.collection('applications').updateOne(
            { _id: applicationId },
            { 
                $set: { 
                    status,
                    statusUpdatedAt: new Date(),
                    statusUpdatedBy: decoded.email
                }
            }
        );

        return NextResponse.json({ 
            message: 'Status updated and email sent successfully' 
        });
    } catch (error) {
        console.error('Error sending status email:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to send status email' },
            { status: error.message === 'Unauthorized' ? 401 : 500 }
        );
    } finally {
        await disconnect();
    }
} 