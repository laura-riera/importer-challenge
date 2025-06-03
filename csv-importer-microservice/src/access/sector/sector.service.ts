import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/access/prisma/prisma.service';

@Injectable()
export class SectorService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreateSector(name: string, parentName?: string) {
    let parentId: string | null = null;

    if (parentName) {
      let parent = await this.findByNameAndParent(parentName, null);

      if (!parent) {
        parent = await this.prisma.sector.create({
          data: {
            name: parentName,
            parentSectorId: null,
          },
        });
      }

      parentId = parent.id;
    }

    const existing = await this.findByNameAndParent(name, parentId);

    if (existing) return existing;

    return this.prisma.sector.create({
      data: {
        name,
        parentSectorId: parentId,
      },
    });
  }

  private async findByNameAndParent(
    name: string,
    parentSectorId: string | null,
  ) {
    return this.prisma.sector.findFirst({
      where: {
        name,
        parentSectorId,
      },
    });
  }
}
