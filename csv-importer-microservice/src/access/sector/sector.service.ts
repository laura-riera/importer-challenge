import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/access/prisma/prisma.service';
import { Sector } from '../../../generated/prisma';

@Injectable()
export class SectorService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreateSector(name: string, parentName?: string): Promise<Sector> {
    const isOther = name.trim().toLowerCase() === 'other';

    let parent: Sector | null = null;

    if (parentName) {
      parent = await this.prisma.sector.findFirst({
        where: {
          name: parentName,
        },
      });

      if (!parent) {
        parent = await this.getOrCreateSector(parentName);
      }
    }

    const existing: Sector | null = await this.prisma.sector.findFirst({
      where: isOther ? { name, parentSectorId: parent?.id ?? null } : { name },
    });

    if (existing) {
      if (!existing.parentSectorId && parent?.id) {
        return this.prisma.sector.update({
          where: { id: existing.id },
          data: { parentSectorId: parent.id },
        });
      }
      return existing;
    }

    const created = await this.prisma.sector.create({
      data: {
        name,
        parentSectorId: parent?.id,
      },
    });

    return created;
  }
}
