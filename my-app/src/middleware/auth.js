import { verifyAccessToken, verifyRefreshToken, refreshAccessToken } from "../config/jwt";
import { cookies } from "next/headers";

export async function authMiddleware(request) {
    try {
        const cookieStore = cookies();
        const accessToken = cookieStore.get('accessToken');
        const refreshToken = cookieStore.get('refreshToken');

        if (!accessToken) {
            return Response.json({ error: 'No access token provided' }, { status: 401 });
        }

        try {
            const decoded = verifyAccessToken(accessToken.value);
            
            // If token is expired and we have a refresh token, try to refresh
            if (decoded?.expired && refreshToken) {
                const newAccessToken = await refreshAccessToken(refreshToken.value);
                if (newAccessToken) {
                    // Set the new access token in cookies
                    cookieStore.set('accessToken', newAccessToken, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'strict',
                        path: '/'
                    });
                    
                    // Verify the new token
                    const newDecoded = verifyAccessToken(newAccessToken);
                    if (newDecoded && !newDecoded.expired) {
                        request.user = newDecoded;
                        return null;
                    }
                }
            }
            
            // If token is valid (not expired)
            if (decoded && !decoded.expired) {
                request.user = decoded;
                return null;
            }
            
            return Response.json({ error: 'Invalid or expired token' }, { status: 401 });
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return Response.json({ error: 'Token expired' }, { status: 401 });
            } else if (err.name === 'JsonWebTokenError') {
                return Response.json({ error: 'Invalid token signature' }, { status: 401 });
            }
            throw err; // Re-throw unexpected errors
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        return Response.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}