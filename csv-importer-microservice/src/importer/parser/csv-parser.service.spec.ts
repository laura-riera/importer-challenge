import { CsvParserService } from './csv-parser.service';
import { BadRequestException } from '@nestjs/common';

describe('CsvParserService', () => {
  let service: CsvParserService;

  beforeEach(() => {
    service = new CsvParserService();
  });

  it('should parse CSV content into records', () => {
    const mockFile = {
      buffer: Buffer.from(
        'country,sector,parent sector,1990\nUSA,Energy,,100.5',
      ),
    } as Express.Multer.File;

    const headers = ['country', 'sector', 'parent sector', '1990'];

    const result = service.extractRows(mockFile, headers);

    expect(result).toEqual([
      {
        country: 'USA',
        sector: 'Energy',
        'parent sector': '',
        '1990': '100.5',
      },
    ]);
  });

  it('should throw error if file is empty or not uploaded', () => {
    expect(() => service.extractRows(null as any, ['a', 'b'])).toThrow(
      BadRequestException,
    );
  });

  it('should throw BadRequestException on invalid CSV content', () => {
    const mockFile = {
      buffer: Buffer.from('this,is\nnot,a,valid,csv\n"\n'),
    } as Express.Multer.File;

    expect(() => service.extractRows(mockFile, ['a', 'b', 'c'])).toThrow(
      BadRequestException,
    );
  });
});
