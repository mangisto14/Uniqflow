import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ExecutionService } from './execution.service';
import {
  CreateExecutionDto,
  CompleteStepDto,
  RejectStepDto,
  CancelExecutionDto,
} from './dto/create-execution.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('executions')
@ApiBearerAuth()
@Controller('executions')
export class ExecutionController {
  constructor(private readonly executionService: ExecutionService) {}

  @Post()
  start(@Body() dto: CreateExecutionDto, @CurrentUser() user: { id: string }) {
    return this.executionService.start(dto, user.id);
  }

  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.executionService.findAll(page, limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.executionService.findOne(id);
  }

  @Post(':id/steps/:sid/complete')
  completeStep(
    @Param('id') id: string,
    @Param('sid') sid: string,
    @Body() dto: CompleteStepDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.executionService.completeStep(id, sid, dto, user.id);
  }

  @Post(':id/steps/:sid/reject')
  rejectStep(
    @Param('id') id: string,
    @Param('sid') sid: string,
    @Body() dto: RejectStepDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.executionService.rejectStep(id, sid, dto, user.id);
  }

  @Post(':id/pause')
  pause(@Param('id') id: string) {
    return this.executionService.pause(id);
  }

  @Post(':id/resume')
  resume(@Param('id') id: string) {
    return this.executionService.resume(id);
  }

  @Post(':id/cancel')
  cancel(@Param('id') id: string, @Body() dto: CancelExecutionDto) {
    return this.executionService.cancel(id, dto);
  }

  @Get(':id/history')
  getHistory(@Param('id') id: string) {
    return this.executionService.getHistory(id);
  }
}
