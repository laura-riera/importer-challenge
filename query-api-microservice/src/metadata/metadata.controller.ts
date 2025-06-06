import { Controller, Get } from '@nestjs/common';
import { MetadataService } from './metadata.service';
import { ApiTags, ApiResponse } from '@nestjs/swagger';

@ApiTags('Metadata')
@Controller('status')
export class MetadataController {
  constructor(private readonly metadataService: MetadataService) {}

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Returns global statistics about the emissions dataset',
  })
  async getStatus() {
    return this.metadataService.getStatus();
  }
}
