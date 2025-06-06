import { CsvRowValidatorService } from './csv-row-validator.service';
import { CsvRowDto } from '../dto/csv-row.dto';

describe('CsvRowValidatorService', () => {
  let service: CsvRowValidatorService;

  beforeEach(() => {
    service = new CsvRowValidatorService();
  });

  const validRow: CsvRowDto = {
    countryCode: 'US',
    sectorName: 'Energy',
    parentSectorName: 'Total',
    year: 2020,
    value: 123.45,
  };

  it('should return null for valid row', () => {
    expect(service.validate(validRow)).toBeNull();
  });

  it('should return error for missing country code', () => {
    const row = { ...validRow, countryCode: '' };
    expect(service.validate(row)).toBe('Missing country code');
  });

  it('should return error for short country code', () => {
    const row = { ...validRow, countryCode: 'A' };
    expect(service.validate(row)).toBe('Invalid country code');
  });

  it('should return error for missing sector name', () => {
    const row = { ...validRow, sectorName: '' };
    expect(service.validate(row)).toBe('Missing sector name');
  });

  it('should return error for non-integer year', () => {
    const row = { ...validRow, year: 2020.5 };
    expect(service.validate(row)).toBe('Invalid year: 2020.5');
  });

  it('should return error for year out of range (too old)', () => {
    const row = { ...validRow, year: 1799 };
    expect(service.validate(row)).toBe('Invalid year: 1799');
  });

  it('should return error for year in the future', () => {
    const nextYear = new Date().getFullYear() + 1;
    const row = { ...validRow, year: nextYear };
    expect(service.validate(row)).toBe(`Invalid year: ${nextYear}`);
  });

  it('should return error for non-numeric value', () => {
    const row = { ...validRow, value: 'invalid' as unknown as number };
    expect(service.validate(row)).toBe(`Invalid value type for year 2020`);
  });

  it('should allow null value', () => {
    const row = { ...validRow, value: null };
    expect(service.validate(row)).toBeNull();
  });
});
