import { Injectable } from '@nestjs/common';
import { CsvStructureValidatorService } from './validator/csv-structure-validator.service';
import { CsvParserService } from './parser/csv-parser.service';
import { CsvRowValidatorService } from './validator/csv-row-validator.service';
import { CsvRowDto } from './dto/csv-row.dto';
import { CountryService } from '../access/country/country.service';
import { SectorService } from '../access/sector/sector.service';
import { EmissionService } from '../access/emission/emission.service';
import { ImporterAggregatorService } from './aggregator/import-aggregator.service';

@Injectable()
export class ImporterService {
  constructor(
    private readonly structureValidator: CsvStructureValidatorService,
    private readonly parser: CsvParserService,
    private readonly rowValidator: CsvRowValidatorService,
    private readonly countryService: CountryService,
    private readonly sectorService: SectorService,
    private readonly emissionService: EmissionService,
    private readonly aggregator: ImporterAggregatorService,
  ) {}

  async import(file: Express.Multer.File) {
    // 1. Step: Get raw headers and validate structure
    const rawHeaderLine = file.buffer.toString('utf-8').split(/\r?\n/)[0];
    const rawHeaders = rawHeaderLine.split(','); // or '\t' if TSV
    const normalizedHeaders =
      this.structureValidator.validateAndNormalize(rawHeaders);

    // 2. Step: Parse CSV rows into DTOs
    const rows: CsvRowDto[] = await this.parser.parse(file, normalizedHeaders);

    // 3. Step: Validate and insert each row
    for (const row of rows) {
      this.rowValidator.validate(row);

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

    // 4. Step: Return import summary
    return this.aggregator.getSummary();
  }

  async getAllEmissions(): Promise<any[]> {
    return this.emissionService.findAll();
  }
}
