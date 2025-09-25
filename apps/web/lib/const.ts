export const API = process.env.NEXT_PUBLIC_API_URL;

export const PRIORITY_OPTIONS = [
  { value: "P1", label: "P1 - Critical" },
  { value: "P2", label: "P2 - High" },
  { value: "P3", label: "P3 - Medium" },
  { value: "P4", label: "P4 - Low" },
  { value: "P5", label: "P5 - Lowest" },
] as const;

export const STATUS_OPTIONS = [
  { value: "TODO", label: "To Do" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "DONE", label: "Done" },
] as const;

export const PUBLIC_ROUTES = [
  '/',
  '/auth',
  '/auth/login',
  '/auth/register',
  '/pricing',
  '/contact',
  '/404',
  '/error',
] as const;

export type PublicRoute = typeof PUBLIC_ROUTES[number];
