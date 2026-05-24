-- AlterEnum
ALTER TYPE "MembershipStatus" ADD VALUE 'cancelled';

-- AlterTable
ALTER TABLE "MembershipApplication" ADD COLUMN     "cancellationReason" TEXT,
ADD COLUMN     "cancelledAt" TIMESTAMP(3);
