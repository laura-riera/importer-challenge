import { Injectable, BadRequestException } from '@nestjs/common';
import { parse } from 'csv-parse/sync';
import { CsvRowDto } from '../dto/csv-row.dto';

@Injectable()
export class CsvParserService {
  // Parses a CSV file into an array of CsvRowDto objects
  async parse(file: Express.Multer.File): Promise<CsvRowDto[]> {
    // If file is missing or empty, throw a 400 error
    if (!file?.buffer) {
      throw new BadRequestException('No file uploaded or file is empty');
    }

    let records: Record<string, string>[] = [];

    try {
      const content = file.buffer.toString('utf-8'); // Convert file buffer to string
      records = parse(content, {
        columns: true, // Use the first line as headers
        skip_empty_lines: true, // Skip blank lines
        trim: true, // Trim whitespace from fields
      }) as Record<string, string>[];
    } catch (err) {
      // Catch CSV parsing errors and throw as 400 BadRequest
      throw new BadRequestException(
        `Failed to parse CSV: ${(err as Error).message}`,
      );
    }

    // Create an emission record for each year
    const result: CsvRowDto[] = [];

    for (const row of records) {
      const countryCode = row['Country'];
      const sectorName = row['Sector'];
      const parentSectorName = row['Parent sector'] || null;

      // Skip row if required values are missing
      if (!countryCode || !sectorName) {
        continue;
      }

      // Iterate through all keys in the row
      for (const [key, rawValue] of Object.entries(row)) {
        // Only process year columns (e.g., 1850, 1990, etc.)
        if (/^\d{4}$/.test(key)) {
          const year = parseInt(key, 10);
          const raw = String(rawValue); // 👈 importante
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
