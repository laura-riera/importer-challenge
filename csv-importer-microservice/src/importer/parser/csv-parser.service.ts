import { Injectable, BadRequestException } from '@nestjs/common';
import { parse } from 'csv-parse/sync';

@Injectable()
export class CsvParserService {
  extractRows(
    file: Express.Multer.File,
    normalizedHeaders: string[],
  ): Record<string, string>[] {
    if (!file?.buffer) {
      throw new BadRequestException('No file uploaded or file is empty');
    }

    try {
      const content = file.buffer.toString('utf-8');

      const records = parse(content, {
        columns: normalizedHeaders,
        from_line: 2, // asumes encabezado en la línea 1
        skip_empty_lines: true,
        trim: true,
      }) as Record<string, string>[];

      return records;
    } catch (err) {
      throw new BadRequestException(
        `Failed to parse CSV: ${(err as Error).message}`,
      );
    }
  }
}
