import { Injectable } from '@nestjs/common';
import { CsvRowDto } from '../dto/csv-row.dto';

@Injectable()
export class CsvRowValidatorService {
  validate(row: CsvRowDto): string | null {
    const { countryCode, sectorName, year, value } = row;

    if (!countryCode) {
      return 'Missing country code';
    }

    if (countryCode.length < 2) {
      return 'Invalid country code';
    }

    if (!sectorName) {
      return 'Missing sector name';
    }

    if (
      !Number.isInteger(year) ||
      year < 1800 ||
      year > new Date().getFullYear()
    ) {
      return `Invalid year: ${year}`;
    }

    if (value !== null && typeof value !== 'number') {
      return `Invalid value type for year ${year}`;
    }

    return null;
  }
}
