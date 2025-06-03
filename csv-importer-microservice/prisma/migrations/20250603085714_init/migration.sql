/*
  Warnings:

  - You are about to drop the column `name` on the `Country` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[code]` on the table `Country` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `Country` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Country_name_key";

-- AlterTable
ALTER TABLE "Country" DROP COLUMN "name",
ADD COLUMN     "code" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Country_code_key" ON "Country"("code");
