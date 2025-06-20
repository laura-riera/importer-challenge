import { Injectable } from '@nestjs/common';
import { CsvStructureValidatorService } from './validator/csv-structure-validator.service';
import { CsvParserService } from './parser/csv-parser.service';
import { CsvDeduplicatorService } from './utils/csv-deduplicator.service';
import { CsvMapperService } from './parser/csv-mapper.service';
import { CountryService } from '../access/country/country.service';
import { SectorService } from '../access/sector/sector.service';
import { EmissionService } from '../access/emission/emission.service';
import { ImporterAggregatorService } from './aggregator/import-aggregator.service';

@Injectable()
export class ImporterService {
  constructor(
    private readonly structureValidator: CsvStructureValidatorService,
    private readonly parser: CsvParserService,
    private readonly deduplicator: CsvDeduplicatorService,
    private readonly mapper: CsvMapperService,
    private readonly countryService: CountryService,
    private readonly sectorService: SectorService,
    private readonly emissionService: EmissionService,
    private readonly aggregator: ImporterAggregatorService,
  ) {}

  async import(file: Express.Multer.File) {
    // 1. Get raw headers and validate structure
    const rawHeaderLine = file.buffer.toString('utf-8').split(/\r?\n/)[0];
    const rawHeaders = rawHeaderLine.split(',');
    const normalizedHeaders =
      this.structureValidator.validateAndNormalize(rawHeaders);

    // 2. Parse CSV rows
    const rawRows = this.parser.extractRows(file, normalizedHeaders);

    // 3. Deduplicate rows
    const { rows: deduped, removed } = this.deduplicator.deduplicate(rawRows);

    // 4. Transform to DTOs
    const { rows, summary } = this.mapper.map(deduped);

    // 5. Insert each valid row
    for (const row of rows) {
      const country = await this.countryService.getOrCreateCountry(
        row.countryCode,
      );
      const sector = await this.sectorService.getOrCreateSector(
        row.sectorName,
        row.parentSectorName ?? undefined,
      );

      await this.emissionService.getOrCreateEmissionRecord(
        country.id,
        sector.id,
        row.year,
        row.value,
      );
    }

    // 6. Get aggregation result
    const summaryData = await this.aggregator.getSummary();

    const dupsSummary = `${removed > 0 ? `${removed} duplicated csv rows were removed before transformation.` : 'No duplicates found.'}`;

    // 7. Return both summaries
    return {
      removed: dupsSummary,
      summary: summary,
      aggregations: summaryData,
    };
  }

  async getAllEmissions(): Promise<any[]> {
    return this.emissionService.findAll();
  }
}
