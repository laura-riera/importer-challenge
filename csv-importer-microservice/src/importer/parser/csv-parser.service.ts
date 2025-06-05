import { Injectable, BadRequestException } from '@nestjs/common';
import { parse } from 'csv-parse/sync';
import { CsvRowDto } from '../dto/csv-row.dto';
import { CsvRowValidatorService } from '../validator/csv-row-validator.service';
import {
  normalizeCountryCode,
  normalizeSectorName,
} from '../utils/text-normalizer';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CsvParserService {
  constructor(private readonly rowValidator: CsvRowValidatorService) {}

  parse(
    file: Express.Multer.File,
    normalizedHeaders: string[],
  ): { rows: CsvRowDto[]; summary: string } {
    if (!file?.buffer) {
      throw new BadRequestException('No file uploaded or file is empty');
    }

    let records: Record<string, string>[] = [];

    try {
      const content = file.buffer.toString('utf-8');

      records = parse(content, {
        columns: normalizedHeaders,
        from_line: 2,
        skip_empty_lines: true,
        trim: true,
      }) as Record<string, string>[];
    } catch (err) {
      throw new BadRequestException(
        `Failed to parse CSV: ${(err as Error).message}`,
      );
    }

    const rows: CsvRowDto[] = [];
    const errors: string[] = [];

    const incompleteLogPath = path.join(process.cwd(), 'incomplete-rows.log');
    const validationLogPath = path.join(process.cwd(), 'validation-errors.log');
    fs.writeFileSync(incompleteLogPath, '');
    fs.writeFileSync(validationLogPath, '');

    for (const [index, row] of records.entries()) {
      const countryCode = normalizeCountryCode(row['country']);
      const sectorName = normalizeSectorName(row['sector']);
      const parentSectorName = normalizeSectorName(row['parent sector']);

      if (!countryCode || !sectorName) continue;

      let emissionsGenerated = 0;

      for (const [key, rawValue] of Object.entries(row)) {
        if (/^\d{4}$/.test(key)) {
          const year = parseInt(key, 10);
          const raw = String(rawValue);
          const parsed = parseFloat(raw);
          const value = raw === '' || isNaN(parsed) ? null : parsed;

          const dto: CsvRowDto = {
            countryCode,
            sectorName,
            parentSectorName,
            year,
            value,
          };

          const error = this.rowValidator.validate(dto);
          if (error) {
            errors.push(
              `Row ${index + 2} (${countryCode}, ${sectorName}, year ${year}): ${error}`,
            );
            continue;
          }

          rows.push(dto);
          emissionsGenerated++;
        }
      }

      if (emissionsGenerated < 165) {
        const logLine = `Row ${index + 2} (${countryCode}, ${sectorName}): ${emissionsGenerated} emissions generated\n`;
        fs.appendFileSync(incompleteLogPath, logLine);
      }
    }

    if (errors.length > 0) {
      fs.writeFileSync(validationLogPath, errors.join('\n'));
    }

    const summary = `Import completed with ${rows.length} valid rows and ${errors.length} errors${
      errors.length ? ' (see validation-errors.log)' : ''
    }`;

    return { rows, summary };
  }
}
