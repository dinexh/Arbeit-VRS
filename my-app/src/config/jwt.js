import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const ACCESS_TOKEN=process.env.ACCESS_TOKEN;
const REFRESH_TOKEN=process.env.REFRESH_TOKEN;

if(!ACCESS_TOKEN || !REFRESH_TOKEN){
    throw new Error('JWT_SECRET is not defined');
}

export const generateAccessToken=(payload)=>{
    return jwt.sign(payload,ACCESS_TOKEN,{expiresIn:'1h'});
}

export const generateRefreshToken=(payload)=>{
    return jwt.sign(payload,REFRESH_TOKEN,{expiresIn:'7d'});
}

export const generateAuthTokens=(payload)=>{
    const accessToken=generateAccessToken(payload);
    const refreshToken=generateRefreshToken(payload);
    return {accessToken,refreshToken};
}

export const verifyAccessToken=(token)=>{
    try {
        return jwt.verify(token,ACCESS_TOKEN);
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return { expired: true };
        }
        return null;
    }
}

export const verifyRefreshToken=(token)=>{
    try {
        return jwt.verify(token,REFRESH_TOKEN);
    } catch (error) {
        return null;
    }
}

export const refreshAccessToken = async (refreshToken) => {
    try {
        const decoded = verifyRefreshToken(refreshToken);
        if (!decoded) {
            return null;
        }
        
        // Generate new access token with the same payload
        const { iat, exp, ...payload } = decoded;
        const newAccessToken = generateAccessToken(payload);
        
        return newAccessToken;
    } catch (error) {
        console.error('Error refreshing access token:', error);
        return null;
    }
}