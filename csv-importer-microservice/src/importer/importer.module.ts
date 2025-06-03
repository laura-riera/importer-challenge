import { Module } from '@nestjs/common';
import { ImporterService } from './importer.service';
import { ImporterController } from './importer.controller';
import { CsvParserService } from './parser/csv-parser.service';
import { CsvStructureValidatorService } from './validator/csv-structure-validator.service';
import { CsvRowValidatorService } from './validator/csv-row-validator.service';
import { AccessModule } from '../access/access.module';

@Module({
  imports: [AccessModule],
  controllers: [ImporterController],
  providers: [
    ImporterService,
    CsvParserService,
    CsvStructureValidatorService,
    CsvRowValidatorService,
  ],
})
export class ImporterModule {}
