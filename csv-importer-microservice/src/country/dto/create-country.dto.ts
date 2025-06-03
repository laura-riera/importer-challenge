import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCountryDto {
  @ApiProperty({
    example: 'MEX',
    description: 'Country or region code (e.g., MEX, EU28, WORLD, OECD, etc.)',
  })
  @IsString()
  code: string;
}
