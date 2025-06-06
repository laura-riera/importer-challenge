import { Injectable, PipeTransform, BadRequestException } from '@nestjs/common';
import { Express } from 'express';

@Injectable()
export class CsvFormatValidatorPipe implements PipeTransform {
  transform(file: Express.Multer.File) {
    const allowedTypes = ['text/csv', 'application/vnd.ms-excel'];
    if (!file) {
      throw new BadRequestException('File is required');
    }

    console.log('[CSV VALIDATION]', file.originalname, file.mimetype);

    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type: ${file.mimetype}. Only CSV files are allowed.`,
      );
    }

    return file;
  }
}
