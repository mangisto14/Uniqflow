import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  ParseBoolPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SvgTemplateService } from './svg-template.service';
import { CreateSvgTemplateDto } from './dto/create-svg-template.dto';
import { UpdateSvgTemplateDto } from './dto/update-svg-template.dto';

@ApiTags('svg-templates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('svg-templates')
export class SvgTemplateController {
  constructor(private readonly svgTemplateService: SvgTemplateService) {}

  @Post()
  create(@Body() dto: CreateSvgTemplateDto, @CurrentUser('id') userId: string) {
    return this.svgTemplateService.create(dto, userId);
  }

  @Get()
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'activeOnly', required: false })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('activeOnly', new DefaultValuePipe(false), ParseBoolPipe) activeOnly: boolean,
  ) {
    return this.svgTemplateService.findAll(page, limit, activeOnly);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.svgTemplateService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSvgTemplateDto) {
    return this.svgTemplateService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.svgTemplateService.remove(id);
  }

  @Post(':id/clone')
  clone(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.svgTemplateService.clone(id, userId);
  }

  @Post(':id/attach/:processId')
  @HttpCode(HttpStatus.OK)
  attach(@Param('id') id: string, @Param('processId') processId: string) {
    return this.svgTemplateService.attachToProcess(id, processId);
  }

  @Delete(':id/attach/:processId')
  @HttpCode(HttpStatus.OK)
  detach(@Param('id') id: string, @Param('processId') processId: string) {
    return this.svgTemplateService.detachFromProcess(id, processId);
  }

  @Get('process/:processId/attachments')
  getProcessAttachments(@Param('processId') processId: string) {
    return this.svgTemplateService.getProcessAttachments(processId);
  }
}
