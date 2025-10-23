-- CreateProjectMembership migration
-- This migration adds ProjectMembership model to manage project-level permissions

CREATE TABLE "ProjectMembership" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "role" TEXT NOT NULL DEFAULT 'CONTRIBUTOR',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    CONSTRAINT "ProjectMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE,
    CONSTRAINT "ProjectMembership_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE
);

-- Create unique constraint for user-project combination
CREATE UNIQUE INDEX "ProjectMembership_userId_projectId_key" ON "ProjectMembership"("userId", "projectId");

-- Create indexes for faster queries
CREATE INDEX "ProjectMembership_userId_idx" ON "ProjectMembership"("userId");
CREATE INDEX "ProjectMembership_projectId_idx" ON "ProjectMembership"("projectId");
