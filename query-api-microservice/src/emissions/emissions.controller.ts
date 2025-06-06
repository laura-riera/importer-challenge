import { Controller, Get, Query } from '@nestjs/common';
import { EmissionsService } from './emissions.service';
import { QueryEmissionsDto } from './dto/query-emissions.dto';
import { ApiTags, ApiResponse } from '@nestjs/swagger';

@ApiTags('Emissions')
@Controller('emissions')
export class EmissionsController {
  constructor(private readonly emissionsService: EmissionsService) {}

  @Get()
  @ApiResponse({ status: 200, description: 'List of emission records' })
  async getEmissions(@Query() query: QueryEmissionsDto) {
    return this.emissionsService.getEmissions(query);
  }
}
