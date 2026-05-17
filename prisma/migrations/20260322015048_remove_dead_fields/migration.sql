-- Drop unused columns from Profile
ALTER TABLE "Profile" DROP COLUMN "resumeUrl",
DROP COLUMN "preferences";

-- Drop unused columns from Vacancy
ALTER TABLE "Vacancy" DROP COLUMN "niceToHave";

-- Fix salaryRange type to match Prisma schema (TEXT -> INTEGER)
ALTER TABLE "Vacancy" ALTER COLUMN "salaryRange" TYPE INTEGER USING "salaryRange"::integer;
