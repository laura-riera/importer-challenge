import { Injectable, BadRequestException } from '@nestjs/common';
import { parse } from 'csv-parse/sync';
import { CsvRowDto } from '../dto/csv-row.dto';

@Injectable()
export class CsvParserService {
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

      // Override original headers with normalized ones
      records = parse(content, {
        columns: normalizedHeaders,
        skip_empty_lines: true,
        trim: true,
      }) as Record<string, string>[];
    } catch (err) {
      throw new BadRequestException(
        `Failed to parse CSV: ${(err as Error).message}`,
      );
    }

    const result: CsvRowDto[] = [];

    for (const row of records) {
      const countryCode = row['country'];
      const sectorName = row['sector'];
      const parentSectorName = row['parent sector'] || null;

      if (!countryCode || !sectorName) continue;

      for (const [key, rawValue] of Object.entries(row)) {
        if (/^\d{4}$/.test(key)) {
          const year = parseInt(key, 10);
          const raw = String(rawValue);
          const parsed = parseFloat(raw);
          const val = raw === '' || isNaN(parsed) ? null : parsed;

          result.push({
            countryCode,
            sectorName,
            parentSectorName,
            year,
            value: val,
          });
        }
      }
    }

    return await Promise.resolve(result);
  }
}
