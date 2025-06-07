import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MetadataService {
  constructor(private readonly prisma: PrismaService) {}

  async getStatus() {
    // Paralel querying
    const [totalRecords, range, countries, sectors] = await Promise.all([
      this.prisma.emissionRecord.count(),
      this.prisma.emissionRecord.aggregate({
        _min: { year: true, value: true },
        _max: { year: true, value: true },
      }),
      this.prisma.country.findMany({
        select: { code: true },
        orderBy: { code: 'asc' },
      }),
      this.prisma.sector.findMany({
        select: { name: true },
        distinct: ['name'],
        orderBy: { name: 'asc' },
      }),
    ]);

    return {
      totalRecords,
      minYear: range._min.year,
      maxYear: range._max.year,
      minValue: range._min.value,
      maxValue: range._max.value,
      availableCountries: countries.map((c) => c.code),
      availableSectors: sectors.map((s) => s.name),
    };
  }
}
