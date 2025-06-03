import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';

@Injectable()
export class CountryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCountryDto: CreateCountryDto) {
    console.log('DTO recibido:', createCountryDto);
    console.log('Payload a enviar:', { code: createCountryDto.code });
    return await this.prisma.country.create({
      data: {
        code: createCountryDto.code,
      },
    });
  }

  async findAll() {
    return await this.prisma.country.findMany();
  }

  async findOne(id: string) {
    const country = await this.prisma.country.findUnique({
      where: { id: id },
    });
    if (!country) {
      throw new NotFoundException(`Country with id ${id} not found`);
    }
    return country;
  }

  async update(id: string, updateCountryDto: UpdateCountryDto) {
    await this.findOne(id);
    return await this.prisma.country.update({
      where: { id: id },
      data: {
        code: updateCountryDto.code,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Verifica existencia
    return await this.prisma.country.delete({
      where: { id: id },
    });
  }
}
