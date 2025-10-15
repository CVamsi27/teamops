import { Request } from 'express';

export function extractJwtFromRequest(req: Request): string | null {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    return token;
  }

  if (req.cookies?.teamops_token) {
    return req.cookies.teamops_token;
  }

  return null;
}
