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
}
