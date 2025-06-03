import { Controller, Get } from '@nestjs/common';
import { ImporterAggregatorService } from './aggregator/import-aggregator.service';

@Controller('importer')
export class ImporterController {
  constructor(private readonly aggregator: ImporterAggregatorService) {}

  @Get('summary')
  async getImportSummary() {
    return this.aggregator.getSummary();
  }
}
