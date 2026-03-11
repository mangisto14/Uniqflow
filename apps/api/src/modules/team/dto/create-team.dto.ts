import { IsString, IsOptional, IsHexColor, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTeamDto {
  @ApiProperty({ example: 'Engineering' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ example: '#3b82f6' })
  @IsOptional()
  @IsHexColor()
  color?: string;

  @ApiPropertyOptional({ example: 'Core engineering team' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
