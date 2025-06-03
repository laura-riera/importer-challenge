import { Module } from '@nestjs/common';
import { CountryService } from './country/country.service';
import { SectorService } from './sector/sector.service';
import { EmissionService } from './emission/emission.service';
import { PrismaService } from './prisma/prisma.service';

@Module({
  providers: [PrismaService, CountryService, SectorService, EmissionService],
  exports: [CountryService, SectorService, EmissionService],
})
export class AccessModule {}
