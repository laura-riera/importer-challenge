import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueryEmissionsDto } from './dto/query-emissions.dto';
import { Prisma } from '../../generated/prisma';
import {
  normalizeCountryCode,
  normalizeSectorName,
} from '../utils/text-normalizer';

@Injectable()
export class EmissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async getEmissions(query: QueryEmissionsDto) {
    const {
      country,
      sector,
      parentSector,
      year,
      minValue,
      maxValue,
      sort,
      page,
      pageSize,
    } = query;

    const normalizedCountry = country
      ? normalizeCountryCode(country)
      : undefined;
    const normalizedSector = sector ? normalizeSectorName(sector) : undefined;
    const normalizedParentSector = parentSector
      ? normalizeSectorName(parentSector)
      : undefined;

    // 1. Build dinamic filter
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
      ...(normalizedCountry && {
        country: { code: normalizedCountry },
      }),
      ...(normalizedSector || parentSector !== undefined
        ? {
            sector: {
              ...(normalizedSector && { name: normalizedSector }),
              ...(parentSector === 'null'
                ? { parent: { is: null } }
                : parentSector !== undefined && normalizedParentSector
                  ? { parent: { is: { name: normalizedParentSector } } }
                  : {}),
            },
          }
        : {}),
    };

    // 2. Sort
    let orderBy: Prisma.EmissionRecordOrderByWithRelationInput = {
      year: 'asc',
    };
    if (sort) {
      const [field, direction = 'asc'] = sort.split(':');
      orderBy = { [field]: direction.toLowerCase() };
    }

    // 3. Pagination
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    // 4. Query
    const [results, total] = await Promise.all([
      this.prisma.emissionRecord.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          country: true,
          sector: true,
        },
      }),
      this.prisma.emissionRecord.count({ where }),
    ]);

    return {
      data: results,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }
}
