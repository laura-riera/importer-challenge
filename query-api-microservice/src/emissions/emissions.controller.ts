import { Controller, Get, Query } from '@nestjs/common';
import { EmissionsService } from './emissions.service';
import { QueryEmissionsDto } from './dto/query-emissions.dto';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';

@ApiTags('Emissions')
@Controller('emissions')
export class EmissionsController {
  constructor(private readonly emissionsService: EmissionsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get filtered emission records',
    description:
      'Returns a paginated list of emission records filtered by country, sector, year, value range, and more.',
  })
  @ApiResponse({ status: 200, description: 'List of emission records' })
  async getEmissions(@Query() query: QueryEmissionsDto) {
    return this.emissionsService.getEmissions(query);
  }
}
