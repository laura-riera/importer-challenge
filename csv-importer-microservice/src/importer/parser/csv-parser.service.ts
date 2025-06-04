import { Injectable, BadRequestException } from '@nestjs/common';
import { parse } from 'csv-parse/sync';
import { CsvRowDto } from '../dto/csv-row.dto';
import { CsvRowValidatorService } from '../validator/csv-row-validator.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CsvParserService {
  constructor(private readonly rowValidator: CsvRowValidatorService) {}

  // Parses a CSV file into an array of CsvRowDto using normalized headers
  async parse(
    file: Express.Multer.File,
    normalizedHeaders: string[],
  ): Promise<CsvRowDto[]> {
    if (!file?.buffer) {
      throw new BadRequestException('No file uploaded or file is empty');
    }

    let records: Record<string, string>[] = [];

    try {
      const content = file.buffer.toString('utf-8');

      records = parse(content, {
        columns: normalizedHeaders,
        from_line: 2, // skip the original header row
        skip_empty_lines: true,
        trim: true,
      }) as Record<string, string>[];
    } catch (err) {
      throw new BadRequestException(
        `Failed to parse CSV: ${(err as Error).message}`,
      );
    }

    const result: CsvRowDto[] = [];
    const logFilePath = path.join(process.cwd(), 'incomplete-rows.log');
    fs.writeFileSync(logFilePath, ''); // Limpia el archivo al inicio

    for (const [index, row] of records.entries()) {
      const countryCode = row['country'];
      const sectorName = row['sector'];
      const parentSectorName = row['parent sector'] || null;

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

          // Validate the row before adding
          this.rowValidator.validate(dto);

          result.push(dto);
          emissionsGenerated++;
        }
      }

      if (emissionsGenerated < 165) {
        const logLine = `Row ${index + 1} (${countryCode}, ${sectorName}): ${emissionsGenerated} emissions generated\n`;
        fs.appendFileSync(logFilePath, logLine);
      }
    }
    return await Promise.resolve(result);
  }
}
