-- AlterTable
ALTER TABLE "public"."Project" ADD COLUMN     "deadline" TIMESTAMP(3),
ADD COLUMN     "googleCalendarId" TEXT;

-- AlterTable
ALTER TABLE "public"."Task" ADD COLUMN     "googleCalendarId" TEXT;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "googleCalendarToken" TEXT,
ADD COLUMN     "googleRefreshToken" TEXT,
ADD COLUMN     "googleTokenExpiry" TIMESTAMP(3);
