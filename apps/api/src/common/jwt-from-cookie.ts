import { Request } from 'express';

export function extractJwtFromRequest(req: Request): string | null {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    console.log('JWT extracted from Authorization header:', token ? 'YES' : 'NO');
    return token;
  }

  if (req.cookies?.teamops_token) {
    console.log('JWT extracted from cookie:', 'YES');
    return req.cookies.teamops_token;
  }

  console.log('JWT extraction failed - no token found in Authorization header or cookies');
  return null;
}
