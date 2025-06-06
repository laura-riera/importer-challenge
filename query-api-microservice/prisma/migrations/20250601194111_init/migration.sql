-- CreateTable
CREATE TABLE "Country" (
    "Id" SERIAL NOT NULL,
    "Name" TEXT NOT NULL,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Sector" (
    "Id" SERIAL NOT NULL,
    "Name" TEXT NOT NULL,
    "ParentSectorId" INTEGER,

    CONSTRAINT "Sector_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "EmissionRecord" (
    "Id" SERIAL NOT NULL,
    "Year" INTEGER NOT NULL,
    "Value" DOUBLE PRECISION,
    "CountryId" INTEGER NOT NULL,
    "SectorID" INTEGER NOT NULL,

    CONSTRAINT "EmissionRecord_pkey" PRIMARY KEY ("Id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Country_Name_key" ON "Country"("Name");

-- CreateIndex
CREATE UNIQUE INDEX "Sector_Name_ParentSectorId_key" ON "Sector"("Name", "ParentSectorId");

-- CreateIndex
CREATE INDEX "EmissionRecord_Year_idx" ON "EmissionRecord"("Year");

-- CreateIndex
CREATE INDEX "EmissionRecord_CountryId_idx" ON "EmissionRecord"("CountryId");

-- CreateIndex
CREATE INDEX "EmissionRecord_SectorID_idx" ON "EmissionRecord"("SectorID");

-- AddForeignKey
ALTER TABLE "Sector" ADD CONSTRAINT "Sector_ParentSectorId_fkey" FOREIGN KEY ("ParentSectorId") REFERENCES "Sector"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmissionRecord" ADD CONSTRAINT "EmissionRecord_CountryId_fkey" FOREIGN KEY ("CountryId") REFERENCES "Country"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmissionRecord" ADD CONSTRAINT "EmissionRecord_SectorID_fkey" FOREIGN KEY ("SectorID") REFERENCES "Sector"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;
