import { Request } from 'express';

export function extractJwtFromRequest(req: Request): string | null {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  if (req.cookies?.teamops_token) {
    return req.cookies.teamops_token;
  }

  return null;
}
