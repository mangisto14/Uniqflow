import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateStepDto } from './create-step.dto';
import { IsArray, IsOptional, ValidateNested, IsString, IsBoolean, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class StepFieldDto {
  @IsOptional() @IsString() id?: string;
  @IsString() name: string;
  @IsString() label: string;
  @IsString() fieldType: string;
  @IsOptional() @IsBoolean() required?: boolean;
  @IsOptional() @IsString() placeholder?: string;
  @IsOptional() @IsString() options?: string;
  @IsOptional() @IsInt() @Min(0) order?: number;
}

export class UpdateStepDto extends PartialType(CreateStepDto) {
  @ApiPropertyOptional({ type: [StepFieldDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StepFieldDto)
  fields?: StepFieldDto[];
}
