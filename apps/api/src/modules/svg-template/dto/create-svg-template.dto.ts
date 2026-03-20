import { IsString, IsOptional, IsBoolean, IsArray, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SvgPointDto {
  @ApiProperty({ example: 'point-1' })
  @IsString()
  id: string;

  @ApiProperty({ example: 'כניסה ראשית' })
  @IsString()
  label: string;

  @ApiProperty({ example: 120 })
  x: number;

  @ApiProperty({ example: 80 })
  y: number;

  @ApiPropertyOptional({ example: 'text' })
  @IsOptional()
  @IsString()
  fieldType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  fields?: Record<string, unknown>[];
}

export class CreateSvgTemplateDto {
  @ApiProperty({ example: 'מפת קומה א' })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ example: 'טמפלט למפת הקומה הראשונה' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ description: 'תוכן ה-SVG' })
  @IsString()
  svgContent: string;

  @ApiPropertyOptional({ description: 'URL או base64 לתמונה מקדימה' })
  @IsOptional()
  @IsString()
  thumbnail?: string;

  @ApiPropertyOptional({ type: [SvgPointDto], description: 'נקודות מוגדרות על ה-SVG' })
  @IsOptional()
  @IsArray()
  pointsConfig?: SvgPointDto[];

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
