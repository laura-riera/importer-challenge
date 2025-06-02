/*
  Warnings:

  - The primary key for the `Country` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `Id` on the `Country` table. All the data in the column will be lost.
  - You are about to drop the column `Name` on the `Country` table. All the data in the column will be lost.
  - The primary key for the `EmissionRecord` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `CountryId` on the `EmissionRecord` table. All the data in the column will be lost.
  - You are about to drop the column `Id` on the `EmissionRecord` table. All the data in the column will be lost.
  - You are about to drop the column `SectorID` on the `EmissionRecord` table. All the data in the column will be lost.
  - You are about to drop the column `Value` on the `EmissionRecord` table. All the data in the column will be lost.
  - You are about to drop the column `Year` on the `EmissionRecord` table. All the data in the column will be lost.
  - The primary key for the `Sector` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `Id` on the `Sector` table. All the data in the column will be lost.
  - You are about to drop the column `Name` on the `Sector` table. All the data in the column will be lost.
  - You are about to drop the column `ParentSectorId` on the `Sector` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `Country` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,parentSectorId]` on the table `Sector` will be added. If there are existing duplicate values, this will fail.
  - The required column `id` was added to the `Country` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `name` to the `Country` table without a default value. This is not possible if the table is not empty.
  - Added the required column `countryId` to the `EmissionRecord` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `EmissionRecord` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `sectorID` to the `EmissionRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year` to the `EmissionRecord` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `Sector` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `name` to the `Sector` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "EmissionRecord" DROP CONSTRAINT "EmissionRecord_CountryId_fkey";

-- DropForeignKey
ALTER TABLE "EmissionRecord" DROP CONSTRAINT "EmissionRecord_SectorID_fkey";

-- DropForeignKey
ALTER TABLE "Sector" DROP CONSTRAINT "Sector_ParentSectorId_fkey";

-- DropIndex
DROP INDEX "Country_Name_key";

-- DropIndex
DROP INDEX "EmissionRecord_CountryId_idx";

-- DropIndex
DROP INDEX "EmissionRecord_SectorID_idx";

-- DropIndex
DROP INDEX "EmissionRecord_Year_idx";

-- DropIndex
DROP INDEX "Sector_Name_ParentSectorId_key";

-- AlterTable
ALTER TABLE "Country" DROP CONSTRAINT "Country_pkey",
DROP COLUMN "Id",
DROP COLUMN "Name",
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD CONSTRAINT "Country_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "EmissionRecord" DROP CONSTRAINT "EmissionRecord_pkey",
DROP COLUMN "CountryId",
DROP COLUMN "Id",
DROP COLUMN "SectorID",
DROP COLUMN "Value",
DROP COLUMN "Year",
ADD COLUMN     "countryId" TEXT NOT NULL,
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "sectorID" TEXT NOT NULL,
ADD COLUMN     "value" DOUBLE PRECISION,
ADD COLUMN     "year" INTEGER NOT NULL,
ADD CONSTRAINT "EmissionRecord_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Sector" DROP CONSTRAINT "Sector_pkey",
DROP COLUMN "Id",
DROP COLUMN "Name",
DROP COLUMN "ParentSectorId",
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "parentSectorId" TEXT,
ADD CONSTRAINT "Sector_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "Country_name_key" ON "Country"("name");

-- CreateIndex
CREATE INDEX "EmissionRecord_year_idx" ON "EmissionRecord"("year");

-- CreateIndex
CREATE INDEX "EmissionRecord_countryId_idx" ON "EmissionRecord"("countryId");

-- CreateIndex
CREATE INDEX "EmissionRecord_sectorID_idx" ON "EmissionRecord"("sectorID");

-- CreateIndex
CREATE UNIQUE INDEX "Sector_name_parentSectorId_key" ON "Sector"("name", "parentSectorId");

-- AddForeignKey
ALTER TABLE "Sector" ADD CONSTRAINT "Sector_parentSectorId_fkey" FOREIGN KEY ("parentSectorId") REFERENCES "Sector"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmissionRecord" ADD CONSTRAINT "EmissionRecord_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmissionRecord" ADD CONSTRAINT "EmissionRecord_sectorID_fkey" FOREIGN KEY ("sectorID") REFERENCES "Sector"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
