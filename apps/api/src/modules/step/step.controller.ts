import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { StepService } from './step.service';
import { CreateStepDto, ReorderStepsDto } from './dto/create-step.dto';
import { UpdateStepDto } from './dto/update-step.dto';

@ApiTags('steps')
@ApiBearerAuth()
@Controller('processes/:pid/steps')
export class StepController {
  constructor(private readonly stepService: StepService) {}

  @Post()
  create(@Param('pid') pid: string, @Body() dto: CreateStepDto) {
    return this.stepService.create(pid, dto);
  }

  @Get()
  findAll(@Param('pid') pid: string) {
    return this.stepService.findAll(pid);
  }

  @Get(':sid')
  findOne(@Param('pid') pid: string, @Param('sid') sid: string) {
    return this.stepService.findOne(pid, sid);
  }

  @Put('reorder')
  reorder(@Param('pid') pid: string, @Body() dto: ReorderStepsDto) {
    return this.stepService.reorder(pid, dto);
  }

  @Put(':sid')
  update(@Param('pid') pid: string, @Param('sid') sid: string, @Body() dto: UpdateStepDto) {
    return this.stepService.update(pid, sid, dto);
  }

  @Delete(':sid')
  remove(@Param('pid') pid: string, @Param('sid') sid: string) {
    return this.stepService.remove(pid, sid);
  }
}
