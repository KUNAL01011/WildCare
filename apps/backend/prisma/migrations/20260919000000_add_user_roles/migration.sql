CREATE TYPE "UserRole" AS ENUM ('CITIZEN', 'RESPONDER', 'ADMIN');
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

ALTER TABLE "User"
ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'CITIZEN',
ADD COLUMN "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN "phone" TEXT;

CREATE INDEX "User_role_status_idx" ON "User"("role", "status");
