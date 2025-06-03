import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CountryService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreateCountry(code: string) {
    const existing = await this.prisma.country.findUnique({
      where: { code },
    });

    if (existing) return existing;

    return this.prisma.country.create({
      data: { code },
    });
  }
}
