import { CsvParserService } from './csv-parser.service';
import { CsvRowValidatorService } from '../validator/csv-row-validator.service';
import { BadRequestException } from '@nestjs/common';
import * as fs from 'fs';

describe('CsvParserService', () => {
  let service: CsvParserService;
  let mockRowValidator: jest.Mocked<CsvRowValidatorService>;

  beforeEach(() => {
    mockRowValidator = {
      validate: jest.fn(),
    } as unknown as jest.Mocked<CsvRowValidatorService>;

    jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
    jest.spyOn(fs, 'appendFileSync').mockImplementation(() => {});

    service = new CsvParserService(mockRowValidator);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should parse valid CSV and return rows and summary', () => {
    const csvContent = `country,sector,parent sector,1990,1991
USA,Energy,,100.5,200.7`;

    const file = {
      buffer: Buffer.from(csvContent),
    } as Express.Multer.File;

    mockRowValidator.validate.mockReturnValue(null);

    const result = service.parse(file, [
      'country',
      'sector',
      'parent sector',
      '1990',
      '1991',
    ]);

    expect(result.rows).toHaveLength(2);
    expect(result.summary).toMatch(/2 valid rows and 0 errors/);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockRowValidator.validate).toHaveBeenCalledTimes(2);
  });

  it('should skip rows with validation errors and write to log', () => {
    const csvContent = `country,sector,parent sector,1990
USA,Energy,,invalid`;

    const file = {
      buffer: Buffer.from(csvContent),
    } as Express.Multer.File;

    mockRowValidator.validate.mockReturnValue('Invalid value');

    const writeFileSpy = jest.spyOn(fs, 'writeFileSync');
    const appendFileSpy = jest.spyOn(fs, 'appendFileSync');

    const result = service.parse(file, [
      'country',
      'sector',
      'parent sector',
      '1990',
    ]);

    expect(result.rows).toHaveLength(0);
    expect(result.summary).toMatch(/0 valid rows and 1 errors/);
    expect(writeFileSpy).toHaveBeenCalledWith(
      expect.stringContaining('validation-errors.log'),
      expect.stringContaining('Invalid value'),
    );
    expect(appendFileSpy).toHaveBeenCalled();
  });

  it('should throw BadRequestException if CSV is malformed', () => {
    const csvContent = `country,sector,parent sector,1990
"USA,Energy,,"100.5"`;

    const file = {
      buffer: Buffer.from(csvContent),
    } as Express.Multer.File;

    expect(() =>
      service.parse(file, ['country', 'sector', 'parent sector', '1990']),
    ).toThrow(BadRequestException);
  });

  it('should throw BadRequestException if file is missing or empty', () => {
    const file = { buffer: null } as unknown as Express.Multer.File;

    expect(() =>
      service.parse(file, ['country', 'sector', 'parent sector', '1990']),
    ).toThrow(BadRequestException);
  });
});
