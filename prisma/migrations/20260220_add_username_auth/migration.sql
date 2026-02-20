-- Add username column (nullable for safe migration of existing data)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "username" TEXT;

-- Migrate existing data: set username from email prefix or generate unique fallback
UPDATE "User"
SET "username" = COALESCE(
  NULLIF(SPLIT_PART(email, '@', 1), ''),
  'user_' || LEFT(id, 8)
)
WHERE "username" IS NULL;

-- Make email optional
ALTER TABLE "User" ALTER COLUMN "email" DROP NOT NULL;

-- Drop name column (replaced by username)
ALTER TABLE "User" DROP COLUMN IF EXISTS "name";

-- Add unique constraint on username
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE tablename = 'User' AND indexname = 'User_username_key'
  ) THEN
    CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
  END IF;
END $$;
