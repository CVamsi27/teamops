-- CreateEnum
CREATE TYPE "public"."ProjectRole" AS ENUM ('LEAD', 'CONTRIBUTOR', 'REVIEWER', 'VIEWER');

-- CreateTable
CREATE TABLE "public"."ProjectMembership" (
    "id" TEXT NOT NULL,
    "role" "public"."ProjectRole" NOT NULL DEFAULT 'CONTRIBUTOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "ProjectMembership_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProjectMembership_userId_idx" ON "public"."ProjectMembership"("userId");

-- CreateIndex
CREATE INDEX "ProjectMembership_projectId_idx" ON "public"."ProjectMembership"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectMembership_userId_projectId_key" ON "public"."ProjectMembership"("userId", "projectId");

-- AddForeignKey
ALTER TABLE "public"."ProjectMembership" ADD CONSTRAINT "ProjectMembership_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProjectMembership" ADD CONSTRAINT "ProjectMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
