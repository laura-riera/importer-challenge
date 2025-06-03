import { Injectable, BadRequestException } from '@nestjs/common';
import { CsvRowDto } from '../dto/csv-row.dto';

@Injectable()
export class CsvRowValidatorService {
  // Validates a single CsvRowDto object
  validate(row: CsvRowDto): void {
    const { countryCode, sectorName, year, value } = row;

    // Required fields
    if (!countryCode.trim()) {
      throw new BadRequestException('Row is missing a country code');
    }

    if (!sectorName.trim()) {
      throw new BadRequestException('Row is missing a sector name');
    }

    if (
      !Number.isInteger(year) ||
      year < 1800 ||
      year > new Date().getFullYear()
    ) {
      throw new BadRequestException(`Invalid year: ${year}`);
    }

    // Value: must be null or a non-negative number
    if (value !== null && (typeof value !== 'number' || value < 0)) {
      throw new BadRequestException(`Invalid value for year ${year}: ${value}`);
    }
  }
}
