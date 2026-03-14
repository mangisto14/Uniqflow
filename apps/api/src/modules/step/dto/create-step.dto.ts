import {
  IsString,
  IsEnum,
  IsOptional,
  IsObject,
  IsInt,
  IsNumber,
  IsBoolean,
  IsArray,
  ValidateNested,
  Min,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StepType } from '@prisma/client';

class PositionDto {
  @IsNumber()
  x: number;

  @IsNumber()
  y: number;
}

export class CreateStepDto {
  @ApiProperty({ enum: StepType })
  @IsEnum(StepType)
  type: StepType;

  @ApiProperty({ example: 'Collect Employee Info' })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => PositionDto)
  position?: PositionDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  assignedTeamId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  timeoutMinutes?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;
}

export class ReorderStepsDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  stepIds: string[];
}
