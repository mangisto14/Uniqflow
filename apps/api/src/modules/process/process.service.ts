import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProcessDto } from './dto/create-process.dto';
import { UpdateProcessDto } from './dto/update-process.dto';
import { Prisma, ProcessStatus } from '@prisma/client';

@Injectable()
export class ProcessService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProcessDto, userId: string) {
    return this.prisma.process.create({
      data: {
        name: dto.name,
        description: dto.description,
        metadata: dto.metadata as Prisma.InputJsonValue | undefined,
        createdById: userId,
      },
      include: { steps: true, createdBy: { select: { id: true, name: true, email: true } } },
    });
  }

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * Math.min(limit, 100);
    const take = Math.min(limit, 100);
    const [processes, total] = await Promise.all([
      this.prisma.process.findMany({
        skip, take,
        include: { createdBy: { select: { id: true, name: true } }, _count: { select: { steps: true, executions: true } } },
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.process.count(),
    ]);
    return { processes, total, page, limit: take };
  }

  async findOne(id: string) {
    const process = await this.prisma.process.findUnique({
      where: { id },
      include: {
        steps: {
          include: { fields: true, branches: true, sharingRules: true, dependsOn: true },
          orderBy: { order: 'asc' },
        },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });
    if (!process) throw new NotFoundException(`Process ${id} not found`);
    return process;
  }

  async update(id: string, dto: UpdateProcessDto) {
    await this.findOne(id);
    return this.prisma.process.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        metadata: dto.metadata as Prisma.InputJsonValue | undefined,
        version: { increment: 1 },
      },
      include: { steps: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.process.delete({ where: { id } });
  }

  async publish(id: string) {
    const process = await this.findOne(id);
    if (process.status !== ProcessStatus.DRAFT) {
      throw new BadRequestException('Only DRAFT processes can be published');
    }
    return this.prisma.process.update({
      where: { id },
      data: { status: ProcessStatus.ACTIVE },
    });
  }

  async duplicate(id: string, userId: string) {
    const process = await this.findOne(id);
    return this.prisma.process.create({
      data: {
        name: `${process.name} (copy)`,
        description: process.description ?? undefined,
        metadata: process.metadata as Prisma.InputJsonValue | undefined,
        createdById: userId,
        steps: {
          create: process.steps.map((step) => ({
            type: step.type,
            name: step.name,
            description: step.description ?? undefined,
            config: step.config as Prisma.InputJsonValue,
            position: step.position as Prisma.InputJsonValue,
            order: step.order,
            assignedTeamId: step.assignedTeamId ?? undefined,
            timeoutMinutes: step.timeoutMinutes ?? undefined,
            isRequired: step.isRequired,
          })),
        },
      },
      include: { steps: true },
    });
  }
}
