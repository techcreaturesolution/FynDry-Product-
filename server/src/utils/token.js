import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';

export const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    ENV.JWT_ACCESS_SECRET,
    {
      expiresIn: ENV.JWT_ACCESS_EXPIRES_IN || '15m',
    }
  );
};

export const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
    },
    ENV.JWT_REFRESH_SECRET,
    {
      expiresIn: ENV.JWT_REFRESH_EXPIRES_IN || '7d',
    }
  );
};

export const hashToken = (token) => {
  if (!token) return '';
  return crypto.createHash('sha256').update(token).digest('hex');
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, ENV.JWT_ACCESS_SECRET);
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, ENV.JWT_REFRESH_SECRET);
};

export const getRefreshTokenCookieOptions = () => {
  const isProduction = ENV.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    path: '/',
  };
};

export default {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  verifyAccessToken,
  verifyRefreshToken,
  getRefreshTokenCookieOptions,
};
