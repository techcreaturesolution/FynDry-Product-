import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { registerSchema, loginSchema } from '../src/validators/authValidator.js';

describe('Authentication & Cryptographic Security Tests', () => {
  const jwtSecret = 'test_jwt_access_secret_2026';

  describe('Zod Input Validation', () => {
    test('accepts valid customer registration payload', () => {
      const validPayload = {
        name: 'Priya Patel',
        email: 'priya.patel@example.com',
        password: 'Password@123',
        phone: '9876543210',
      };

      const result = registerSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    test('rejects registration with invalid email format', () => {
      const invalidPayload = {
        name: 'Priya Patel',
        email: 'not-an-email',
        password: 'Password@123',
        phone: '9876543210',
      };

      const result = registerSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.path).toContain('email');
    });

    test('rejects registration with short password (< 6 characters)', () => {
      const invalidPayload = {
        name: 'Priya Patel',
        email: 'priya@example.com',
        password: '123',
        phone: '9876543210',
      };

      const result = registerSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.path).toContain('password');
    });

    test('rejects registration with invalid Indian phone number (not 10 digits)', () => {
      const invalidPayload = {
        name: 'Priya Patel',
        email: 'priya@example.com',
        password: 'Password@123',
        phone: '12345', // Only 5 digits
      };

      const result = registerSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.path).toContain('phone');
    });
  });

  describe('Password Hashing & Bcrypt Verification', () => {
    test('hashes password using salt and verifies correctly', async () => {
      const plainPassword = 'SuperSecretPassword@2026';
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(plainPassword, salt);

      expect(hashedPassword).not.toBe(plainPassword);
      expect(hashedPassword.startsWith('$2a$') || hashedPassword.startsWith('$2b$')).toBe(true);

      const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
      expect(isMatch).toBe(true);

      const isWrongMatch = await bcrypt.compare('WrongPassword', hashedPassword);
      expect(isWrongMatch).toBe(false);
    });
  });

  describe('JWT Access & Refresh Token Claims', () => {
    test('issues and verifies signed JWT with user claims', () => {
      const mockUser = {
        _id: 'user_66a7b8c9d0e1',
        role: 'customer',
      };

      const token = jwt.sign(
        { id: mockUser._id, role: mockUser.role },
        jwtSecret,
        { expiresIn: '15m' }
      );

      const decoded = jwt.verify(token, jwtSecret);
      expect(decoded.id).toBe(mockUser._id);
      expect(decoded.role).toBe(mockUser.role);
    });

    test('hashes refresh token with SHA-256 for secure database storage', () => {
      const rawRefreshToken = 'sample_refresh_token_string_xyz';
      const hashed = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');

      expect(hashed.length).toBe(64);
      // Same raw token produces deterministic hash
      expect(crypto.createHash('sha256').update(rawRefreshToken).digest('hex')).toBe(hashed);
      // Different token produces different hash
      expect(crypto.createHash('sha256').update('different_token').digest('hex')).not.toBe(hashed);
    });
  });
});
