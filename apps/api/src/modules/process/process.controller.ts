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
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ProcessService } from './process.service';
import { CreateProcessDto } from './dto/create-process.dto';
import { UpdateProcessDto } from './dto/update-process.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('processes')
@ApiBearerAuth()
@Controller('processes')
export class ProcessController {
  constructor(private readonly processService: ProcessService) {}

  @Post()
  create(@Body() dto: CreateProcessDto, @CurrentUser() user: { id: string }) {
    return this.processService.create(dto, user.id);
  }

  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.processService.findAll(page, limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.processService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProcessDto) {
    return this.processService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.processService.remove(id);
  }

  @Post(':id/publish')
  publish(@Param('id') id: string) {
    return this.processService.publish(id);
  }

  @Post(':id/duplicate')
  duplicate(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.processService.duplicate(id, user.id);
  }
}
