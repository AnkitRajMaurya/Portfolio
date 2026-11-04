import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'portfolio-production-secret-key-2026';

export function signToken(payload: { username: string; role?: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): { username: string; role?: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { username: string; role?: string };
  } catch {
    return null;
  }
}

export function authenticateRequest(request: Request): { username: string; role?: string } | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.substring(7);
  return verifyToken(token);
}
