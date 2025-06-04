import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/access/prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class EmissionService {
  private skippedLogPath = path.join(process.cwd(), 'skipped-emissions.log');

  constructor(private readonly prisma: PrismaService) {
    fs.writeFileSync(this.skippedLogPath, '');
  }

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

    if (existing) {
      const log = `Skipped existing record: country=${countryId}, sector=${sectorId}, year=${year}\n`;
      fs.appendFileSync(this.skippedLogPath, log);
      return existing;
    }
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

  async findAll(): Promise<any[]> {
    return this.prisma.emissionRecord.findMany({
      include: {
        country: true,
        sector: true,
      },
      orderBy: {
        year: 'desc',
      },
      take: 200,
    });
  }
}
