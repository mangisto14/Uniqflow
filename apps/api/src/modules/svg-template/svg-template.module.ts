import { Module } from '@nestjs/common';
import { SvgTemplateController } from './svg-template.controller';
import { SvgTemplateService } from './svg-template.service';

@Module({
  controllers: [SvgTemplateController],
  providers: [SvgTemplateService],
  exports: [SvgTemplateService],
})
export class SvgTemplateModule {}
