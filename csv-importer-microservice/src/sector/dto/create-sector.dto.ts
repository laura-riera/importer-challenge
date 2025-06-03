import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSectorDto {
  @ApiProperty({
    description: 'Name of the sector to create',
    example: 'Mineral Products',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Name of the parent sector (if any)',
    example: 'Industrial process',
    required: false,
    nullable: true,
  })
  @IsString()
  @IsOptional()
  parentName?: string;
}
