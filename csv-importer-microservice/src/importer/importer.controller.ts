import {
  Controller,
  Get,
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
import { CsvFileValidationPipe } from './csv-file-validation.pipe';

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
  
- Required columns (case-insensitive): \`Country\`, \`Sector\`, \`Parent sector\`
- One or more year columns with 4-digit format (e.g., \`1990\`, \`2020\`)
- Each row represents emissions data for a country and sector in a given year

**Example CSV:**
\`\`\`csv
Country,Sector,Parent sector,1990,2000
USA,Energy,Production,0.54,-1.2
CAN,Transport,Services,10.3,0.62
\`\`\`
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
    @UploadedFile(CsvFileValidationPipe)
    file: Express.Multer.File,
  ) {
    console.log(file);
    return this.importerService.import(file);
  }
  @Get('data')
  @ApiOperation({ summary: 'View imported emissions (TEMPORAL)' })
  @ApiResponse({ status: 200, description: 'List of imported emissions' })
  async getImportedData() {
    return this.importerService.getAllEmissions();
  }
}
