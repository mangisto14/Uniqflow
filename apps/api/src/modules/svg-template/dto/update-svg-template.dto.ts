import { PartialType } from '@nestjs/swagger';
import { CreateSvgTemplateDto } from './create-svg-template.dto';

export class UpdateSvgTemplateDto extends PartialType(CreateSvgTemplateDto) {}
