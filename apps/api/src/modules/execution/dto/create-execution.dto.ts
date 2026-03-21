import { IsString, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateExecutionDto {
  @ApiProperty()
  @IsString()
  processId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class CompleteStepDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  data?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Override next step — manual station routing' })
  @IsOptional()
  @IsString()
  nextStepId?: string;
}

export class RejectStepDto {
  @ApiProperty()
  @IsString()
  reason: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  targetStepId?: string;
}

export class CancelExecutionDto {
  @ApiProperty()
  @IsString()
  reason: string;
}
