import { Controller, Get } from '@nestjs/common';
import { MetadataService } from './metadata.service';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';

@ApiTags('Metadata')
@Controller('status')
export class MetadataController {
  constructor(private readonly metadataService: MetadataService) {}

  @Get()
  @ApiOperation({
    summary: 'Get metadata about the emissions dataset',
    description: `Returns a summary of the emissions dataset, including:

- **Total records**: Number of emission records in the database
- **Min/Max year**: Range of years covered in the dataset
- **Min/Max value**: Emission value range
- **Available countries**: List of country codes present in the dataset
- **Available sectors**: List of distinct sector names

This endpoint provides metadata useful for configuring filters or understanding the dataset coverage.`,
  })
  @ApiResponse({
    status: 200,
    description: 'Returns global statistics about the emissions dataset',
  })
  async getStatus() {
    return this.metadataService.getStatus();
  }
}
