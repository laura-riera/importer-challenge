import { CsvStructureValidatorService } from './csv-structure-validator.service';
import { BadRequestException } from '@nestjs/common';

describe('CsvStructureValidatorService', () => {
  let service: CsvStructureValidatorService;

  beforeEach(() => {
    service = new CsvStructureValidatorService();
  });

  it('should throw if headers are empty', () => {
    expect(() => service.validateAndNormalize([])).toThrow(BadRequestException);
    expect(() => service.validateAndNormalize([])).toThrow(
      'CSV file has no headers',
    );
  });

  it('should throw if required columns are missing', () => {
    const headers = ['Country', 'Sector'];
    expect(() => service.validateAndNormalize(headers)).toThrow(
      'Missing required column(s): parent sector',
    );
  });

  it('should throw if there are duplicate columns', () => {
    const headers = ['Country', 'Sector', 'Sector', 'Parent Sector', '2020'];
    expect(() => service.validateAndNormalize(headers)).toThrow(
      'Duplicate column(s) found: sector',
    );
  });

  it('should throw if no year columns are present', () => {
    const headers = ['Country', 'Sector', 'Parent Sector'];
    expect(() => service.validateAndNormalize(headers)).toThrow(
      'No year columns found (e.g., 1850, 2010, etc.)',
    );
  });

  it('should return normalized headers if valid', () => {
    const headers = [' Country ', 'SECTOR', 'Parent Sector', '2020'];
    const result = service.validateAndNormalize(headers);
    expect(result).toEqual(['country', 'sector', 'parent sector', '2020']);
  });
});
