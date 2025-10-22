export const API = process.env.NEXT_PUBLIC_API_URL;

export const PRIORITY_OPTIONS = [
  { value: "HIGH", label: "High Priority" },
  { value: "MEDIUM", label: "Medium Priority" },
  { value: "LOW", label: "Low Priority" },
] as const;

export const STATUS_OPTIONS = [
  { value: "TODO", label: "To Do" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "DONE", label: "Done" },
] as const;

export const PUBLIC_ROUTES = [
  "/",
  "/auth",
  "/auth/login",
  "/auth/register",
  "/auth/google/callback",
  "/pricing",
  "/contact",
  "/404",
  "/error",
] as const;

export type PublicRoute = (typeof PUBLIC_ROUTES)[number];
