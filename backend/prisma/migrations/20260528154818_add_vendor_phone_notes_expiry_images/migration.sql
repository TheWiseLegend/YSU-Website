-- AlterTable
ALTER TABLE "Vendor" ADD COLUMN     "discountExpiresAt" TIMESTAMP(3),
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "phone" VARCHAR(20);

-- CreateTable
CREATE TABLE "VendorImage" (
    "id" TEXT NOT NULL,
    "url" VARCHAR(500) NOT NULL,
    "vendorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VendorImage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "VendorImage" ADD CONSTRAINT "VendorImage_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
