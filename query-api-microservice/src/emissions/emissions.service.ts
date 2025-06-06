import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueryEmissionsDto } from './dto/query-emissions.dto';
import { Prisma } from '../../generated/prisma';

@Injectable()
export class EmissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async getEmissions(query: QueryEmissionsDto) {
    const { country, sector, year, minValue, maxValue } = query;

    const where: Prisma.EmissionRecordWhereInput = {
      ...(year && { year }),
      ...(minValue !== undefined || maxValue !== undefined
        ? {
            value: {
              ...(minValue !== undefined ? { gte: minValue } : {}),
              ...(maxValue !== undefined ? { lte: maxValue } : {}),
            },
          }
        : {}),
      ...(country && {
        country: {
          code: country,
        },
      }),
      ...(sector && {
        sector: {
          name: sector,
        },
      }),
    };
  }
}
