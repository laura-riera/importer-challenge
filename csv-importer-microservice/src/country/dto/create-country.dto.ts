import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCountryDto {
  @ApiProperty({ example: 'Spain', description: 'The name of the country' })
  @IsString()
  name: string;
}
