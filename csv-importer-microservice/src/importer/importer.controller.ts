import {
  Controller,
  // Get,
  Post,
  UploadedFile,
  UseInterceptors,
  HttpCode,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImporterService } from './importer.service';
import { Express } from 'express';
import {
  ApiConsumes,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CsvFormatValidatorPipe } from './validator/csv-format-validator.pipe';

@ApiTags('CSV Import')
@Controller('import')
export class ImporterController {
  constructor(private readonly importerService: ImporterService) {}

  @Post('csv')
  @HttpCode(200)
  @ApiOperation({ summary: 'Import emissions from CSV file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: `Upload a CSV file with the following structure:

Each row represents emissions data for a country and sector in a range of years

To ensure a valid import, the CSV file must include the following columns. Column names are case-insensitive. Duplicate columns are not allowed.
- **Country**: Code representing the country or region associated with the emission data (e.g., \`CUB\`, \`ESP\`, \`SWZ\`)
- **Sector**: The economic or activity sector to which the emission value belongs (e.g., \`Energy\`, \`Transport\`, \`Waste\`)
- **Parent sector**: The broader category or grouping to which the Sector belongs (e.g., \`Energy\` could be a parent of \`Fuel Combustion Activities\`)
- One or more **year** columns with 4-digit format (e.g., \`1990\`, \`2020\`)

`,
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'CSV imported successfully and summary returned',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file format or structure',
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadCsv(
    @UploadedFile(CsvFormatValidatorPipe)
    file: Express.Multer.File,
  ) {
    console.log(file);
    return this.importerService.import(file);
  }
}
