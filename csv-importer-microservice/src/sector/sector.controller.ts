import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SectorService } from './sector.service';
import { CreateSectorDto } from './dto/create-sector.dto';
import { UpdateSectorDto } from './dto/update-sector.dto';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

@ApiTags('Sectors')
@Controller('sectors')
export class SectorController {
  constructor(private readonly sectorService: SectorService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new sector (parent must already exist)' })
  @ApiResponse({ status: 201, description: 'Sector created successfully' })
  @ApiResponse({ status: 404, description: 'Parent sector not found' })
  @ApiResponse({
    status: 409,
    description: 'Sector already exists under this parent',
  })
  create(@Body() createSectorDto: CreateSectorDto) {
    return this.sectorService.create(createSectorDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all sectors' })
  findAll() {
    return this.sectorService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a sector by ID' })
  @ApiParam({ name: 'id', type: 'string' })
  findOne(@Param('id') id: string) {
    return this.sectorService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a sector name by ID' })
  @ApiParam({ name: 'id', type: 'string' })
  update(@Param('id') id: string, @Body() updateSectorDto: UpdateSectorDto) {
    return this.sectorService.update(id, updateSectorDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a sector by ID (only if it has no children)',
  })
  @ApiParam({ name: 'id', type: 'string' })
  remove(@Param('id') id: string) {
    return this.sectorService.remove(id);
  }

  @Post('safe-create')
  @ApiOperation({
    summary:
      'Create a sector, and create the parent if it does not exist (importer-friendly)',
  })
  createOrResolve(@Body() createSectorDto: CreateSectorDto) {
    return this.sectorService.getOrCreateSector(
      createSectorDto.name,
      createSectorDto.parentName,
    );
  }
}
