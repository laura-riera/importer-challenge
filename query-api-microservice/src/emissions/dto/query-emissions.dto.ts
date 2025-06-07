/* eslint-disable @typescript-eslint/no-unsafe-argument */

import {
  IsOptional,
  IsString,
  IsInt,
  IsNumber,
  Min,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryEmissionsDto {
  @ApiPropertyOptional({ description: 'Country code (e.g., ESP)' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({
    description: 'Sector name (e.g., Fuel Combustion Activities)',
  })
  @IsOptional()
  @IsString()
  sector?: string;

  @ApiPropertyOptional({
    description:
      'Parent sector name (e.g., Energy). Use "null" to filter sectors with no parent.',
    type: String,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  parentSector?: string | null;

  @ApiPropertyOptional({ description: 'Year of the emission record' })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  year?: number;

  @ApiPropertyOptional({ description: 'Minimum emissions value' })
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  minValue?: number;

  @ApiPropertyOptional({ description: 'Maximum emissions value' })
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  maxValue?: number;

  @ApiPropertyOptional({
    description: 'Sort field and direction, e.g., year:asc or value:desc',
    example: 'year:desc',
  })
  @IsOptional()
  @Matches(/^(year|value)(:(asc|desc))?$/, {
    message: 'Sort must be in the format field[:asc|desc], e.g., year:desc',
  })
  sort?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ description: 'Page size', default: 50 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  pageSize: number = 50;
}
