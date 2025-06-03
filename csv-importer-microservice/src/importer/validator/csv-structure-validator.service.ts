import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class CsvStructureValidatorService {
  private readonly requiredHeaders = ['country', 'sector', 'parent sector'];

  // Validates and returns normalized headers
  validateAndNormalize(headers: string[]): string[] {
    if (!headers?.length) {
      throw new BadRequestException('CSV file has no headers');
    }

    const normalizedHeaders = headers.map((h) => h.trim().toLowerCase());

    const counts = new Map<string, number>();
    for (const header of normalizedHeaders) {
      counts.set(header, (counts.get(header) ?? 0) + 1);
    }

    const duplicates = [...counts.entries()]
      .filter(([, count]) => count > 1)
      .map(([header]) => header);

    if (duplicates.length > 0) {
      throw new BadRequestException(
        `Duplicate column(s) found: ${duplicates.join(', ')}`,
      );
    }

    const missing = this.requiredHeaders.filter(
      (required) => !counts.has(required),
    );
    if (missing.length > 0) {
      throw new BadRequestException(
        `Missing required column(s): ${missing.join(', ')}`,
      );
    }

    const hasYearColumn = normalizedHeaders.some((h) => /^\d{4}$/.test(h));
    if (!hasYearColumn) {
      throw new BadRequestException(
        'No year columns found (e.g., 1850, 2010, etc.)',
      );
    }

    return normalizedHeaders;
  }
}
