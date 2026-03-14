import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateStepDto, ReorderStepsDto } from './dto/create-step.dto';
import { UpdateStepDto } from './dto/update-step.dto';

@Injectable()
export class StepService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertProcessExists(processId: string) {
    const process = await this.prisma.process.findUnique({ where: { id: processId } });
    if (!process) throw new NotFoundException(`Process ${processId} not found`);
    return process;
  }

  async create(processId: string, dto: CreateStepDto) {
    await this.assertProcessExists(processId);
    return this.prisma.processStep.create({
      data: {
        processId,
        type: dto.type,
        name: dto.name,
        description: dto.description,
        config: (dto.config ?? {}) as Prisma.InputJsonValue,
        position: (dto.position ?? { x: 0, y: 0 }) as unknown as Prisma.InputJsonValue,
        order: dto.order ?? 0,
        assignedTeamId: dto.assignedTeamId,
        timeoutMinutes: dto.timeoutMinutes,
        isRequired: dto.isRequired ?? true,
      },
      include: { fields: true, branches: true, assignedTeam: true },
    });
  }

  async findAll(processId: string) {
    await this.assertProcessExists(processId);
    return this.prisma.processStep.findMany({
      where: { processId },
      include: { fields: true, branches: true, dependsOn: true, sharingRules: true },
      orderBy: { order: 'asc' },
    });
  }

  async findOne(processId: string, stepId: string) {
    const step = await this.prisma.processStep.findFirst({
      where: { id: stepId, processId },
      include: { fields: true, branches: true, dependsOn: true, sharingRules: true },
    });
    if (!step) throw new NotFoundException(`Step ${stepId} not found`);
    return step;
  }

  async update(processId: string, stepId: string, dto: UpdateStepDto) {
    await this.findOne(processId, stepId);

    return this.prisma.$transaction(async (tx) => {
      await tx.processStep.update({
        where: { id: stepId },
        data: {
          name: dto.name,
          description: dto.description,
          type: dto.type,
          config: dto.config as Prisma.InputJsonValue | undefined,
          position: dto.position as Prisma.InputJsonValue | undefined,
          order: dto.order,
          assignedTeamId: dto.assignedTeamId,
          timeoutMinutes: dto.timeoutMinutes,
          isRequired: dto.isRequired,
        },
      });

      if (dto.fields !== undefined) {
        await tx.stepField.deleteMany({ where: { stepId } });
        if (dto.fields.length > 0) {
          await tx.stepField.createMany({
            data: dto.fields.map((f, i) => ({
              stepId,
              name: f.name,
              label: f.label,
              fieldType: f.fieldType,
              required: f.required ?? false,
              placeholder: f.placeholder,
              options: f.options ? f.options.split(',').map((o) => o.trim()) : undefined,
              order: f.order ?? i,
            })),
          });
        }
      }

      return tx.processStep.findUniqueOrThrow({
        where: { id: stepId },
        include: { fields: true, branches: true },
      });
    });
  }

  async remove(processId: string, stepId: string) {
    await this.findOne(processId, stepId);
    return this.prisma.processStep.delete({ where: { id: stepId } });
  }

  async reorder(processId: string, dto: ReorderStepsDto) {
    await this.assertProcessExists(processId);
    const updates = dto.stepIds.map((id, index) =>
      this.prisma.processStep.update({ where: { id }, data: { order: index } }),
    );
    return this.prisma.$transaction(updates);
  }

  async bulkUpdate(processId: string, _steps: UpdateStepDto[]) {
    await this.assertProcessExists(processId);
    return { message: 'Bulk update not yet implemented' };
  }
}
