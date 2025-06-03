import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/access/prisma/prisma.service';

@Injectable()
export class EmissionService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreateEmissionRecord(
    countryId: string,
    sectorId: string,
    year: number,
    value: number | null,
  ) {
    const existing = await this.prisma.emissionRecord.findFirst({
      where: {
        countryId,
        sectorID: sectorId,
        year,
      },
    });

    if (existing) return existing;

    return this.prisma.emissionRecord.create({
      data: {
        countryId,
        sectorID: sectorId,
        year,
        value,
      },
    });
  }

  async getAggregations() {
    return this.prisma.emissionRecord.aggregate({
      _count: true,
      _min: { value: true, year: true },
      _max: { value: true, year: true },
    });
  }
}
