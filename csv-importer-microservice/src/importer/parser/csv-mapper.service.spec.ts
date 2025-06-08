import { CsvMapperService } from './csv-mapper.service';
import * as fs from 'fs';

jest.mock('fs');

describe('CsvMapperService', () => {
  let service: CsvMapperService;
  const mockValidator = {
    validate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CsvMapperService(mockValidator as any);
    (fs.writeFileSync as jest.Mock).mockImplementation(() => {});
    (fs.appendFileSync as jest.Mock).mockImplementation(() => {});
  });

  it('should map valid rows and skip those with errors', () => {
    const input = [
      {
        country: 'USA',
        sector: 'Energy',
        'parent sector': '',
        '1990': '100.5',
        '1991': '',
        notayear: 'xyz',
      },
    ];

    mockValidator.validate.mockReturnValueOnce(null);
    mockValidator.validate.mockReturnValueOnce(null);

    const { rows, summary } = service.map(input);

    expect(rows).toEqual([
      {
        countryCode: 'USA',
        sectorName: 'Energy',
        parentSectorName: '',
        year: 1990,
        value: 100.5,
      },
      {
        countryCode: 'USA',
        sectorName: 'Energy',
        parentSectorName: '',
        year: 1991,
        value: null,
      },
    ]);

    expect(summary).toMatch(/2 valid emission records and 0 errors/);
  });

  it('should write validation error if row is invalid', () => {
    const input = [
      {
        country: 'USA',
        sector: 'Energy',
        'parent sector': '',
        '1990': 'abc',
      },
    ];

    mockValidator.validate.mockReturnValueOnce('Invalid value');

    const { rows, summary } = service.map(input);

    expect(rows).toHaveLength(0);
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining('validation-errors.log'),
      expect.stringContaining('Invalid value'),
    );
    expect(summary).toMatch(/0 valid emission records and 1 errors/);
  });

  it('should log incomplete rows if fewer than 165 emissions are generated', () => {
    const input = [
      {
        country: 'USA',
        sector: 'Energy',
        'parent sector': '',
        '1990': '100',
      },
    ];

    mockValidator.validate.mockReturnValue(null);

    const { summary } = service.map(input);

    expect(fs.appendFileSync).toHaveBeenCalledWith(
      expect.stringContaining('incomplete-rows.log'),
      expect.stringContaining('emissions generated'),
    );

    expect(summary).toMatch(/1 valid emission records and 0 errors/);
  });
});
