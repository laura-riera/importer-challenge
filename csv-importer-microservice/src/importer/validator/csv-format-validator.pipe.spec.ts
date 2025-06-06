import { CsvFormatValidatorPipe } from './csv-format-validator.pipe';
import { BadRequestException } from '@nestjs/common';
import { Express } from 'express';

describe('CsvFileValidatorPipe', () => {
  let pipe: CsvFormatValidatorPipe;

  beforeEach(() => {
    pipe = new CsvFormatValidatorPipe();
  });

  it('should throw BadRequestException if no file is provided', () => {
    const file = undefined as unknown as Express.Multer.File;

    expect(() => pipe.transform(file)).toThrow(BadRequestException);
    expect(() => pipe.transform(file)).toThrow('File is required');
  });

  it('should throw BadRequestException for invalid file type', () => {
    const invalidFile = {
      originalname: 'image.png',
      mimetype: 'image/png',
    } as Express.Multer.File;

    expect(() => pipe.transform(invalidFile)).toThrow(BadRequestException);
    expect(() => pipe.transform(invalidFile)).toThrow(
      'Invalid file type: image/png. Only CSV files are allowed.',
    );
  });

  it('should return the file if it has a valid CSV mimetype', () => {
    const validFile = {
      originalname: 'data.csv',
      mimetype: 'text/csv',
    } as Express.Multer.File;

    const result = pipe.transform(validFile);
    expect(result).toBe(validFile);
  });

  it('should accept alternative csv MIME type (application/vnd.ms-excel)', () => {
    const validFile = {
      originalname: 'legacy.csv',
      mimetype: 'application/vnd.ms-excel',
    } as Express.Multer.File;

    const result = pipe.transform(validFile);
    expect(result).toBe(validFile);
  });
});
