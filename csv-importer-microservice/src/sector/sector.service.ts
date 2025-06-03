import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSectorDto } from './dto/create-sector.dto';
import { UpdateSectorDto } from './dto/update-sector.dto';

@Injectable()
export class SectorService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.sector.findMany({
      include: { parent: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const sector = await this.prisma.sector.findUnique({
      where: { id },
      include: { parent: true, children: true },
    });

    if (!sector) {
      throw new NotFoundException(`Sector ${id} not found`);
    }

    return sector;
  }

  async create(dto: CreateSectorDto) {
    const parent = dto.parentName
      ? await this.findByNameAndParent(dto.parentName, null)
      : null;

    if (dto.parentName && !parent) {
      throw new NotFoundException(
        `Parent sector "${dto.parentName}" not found`,
      );
    }

    const existing = await this.findByNameAndParent(
      dto.name,
      parent?.id ?? null,
    );

    if (existing) {
      throw new ConflictException(
        `Sector "${dto.name}" already exists under this parent`,
      );
    }

    return this.prisma.sector.create({
      data: {
        name: dto.name,
        parentSectorId: parent?.id ?? null,
      },
    });
  }

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

  async update(id: string, dto: UpdateSectorDto) {
    return this.prisma.sector.update({
      where: { id },
      data: {
        name: dto.name,
      },
    });
  }

  async remove(id: string) {
    const children = await this.prisma.sector.findMany({
      where: { parentSectorId: id },
    });

    if (children.length > 0) {
      throw new BadRequestException(
        `Cannot delete sector ${id} because it has children`,
      );
    }

    return this.prisma.sector.delete({
      where: { id },
    });
  }

  async findByNameAndParent(name: string, parentSectorId: string | null) {
    return this.prisma.sector.findFirst({
      where: {
        name,
        parentSectorId,
      },
    });
  }
}
