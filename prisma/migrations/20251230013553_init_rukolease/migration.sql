-- CreateTable
CREATE TABLE "RukoLease" (
    "id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "branchName" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "googleMapsUrl" TEXT NOT NULL,
    "paymentStatus" TEXT NOT NULL,
    "totalRent" DOUBLE PRECISION NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "personInCharge" TEXT NOT NULL,
    "contactPerson" TEXT NOT NULL,
    "mouUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RukoLease_pkey" PRIMARY KEY ("id")
);
