import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSvgTemplateDto } from './dto/create-svg-template.dto';
import { UpdateSvgTemplateDto } from './dto/update-svg-template.dto';

@Injectable()
export class SvgTemplateService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSvgTemplateDto, userId: string) {
    return this.prisma.svgTemplate.create({
      data: {
        name: dto.name,
        description: dto.description,
        svgContent: dto.svgContent,
        thumbnail: dto.thumbnail,
        pointsConfig: (dto.pointsConfig as object[]) ?? [],
        isActive: dto.isActive ?? true,
        createdById: userId,
      },
      include: { createdBy: { select: { id: true, name: true } } },
    });
  }

  async findAll(page = 1, limit = 20, activeOnly = false) {
    const skip = (page - 1) * Math.min(limit, 100);
    const take = Math.min(limit, 100);
    const where = activeOnly ? { isActive: true } : {};
    const [templates, total] = await Promise.all([
      this.prisma.svgTemplate.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          description: true,
          thumbnail: true,
          isActive: true,
          isBuiltIn: true,
          createdAt: true,
          createdBy: { select: { id: true, name: true } },
        },
      }),
      this.prisma.svgTemplate.count({ where }),
    ]);
    return { templates, total, page, limit: take };
  }

  async findOne(id: string) {
    const template = await this.prisma.svgTemplate.findUnique({
      where: { id },
      include: { createdBy: { select: { id: true, name: true } } },
    });
    if (!template) throw new NotFoundException(`SvgTemplate ${id} not found`);
    return template;
  }

  async update(id: string, dto: UpdateSvgTemplateDto) {
    await this.findOne(id);
    return this.prisma.svgTemplate.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.svgContent !== undefined && { svgContent: dto.svgContent }),
        ...(dto.thumbnail !== undefined && { thumbnail: dto.thumbnail }),
        ...(dto.pointsConfig !== undefined && { pointsConfig: dto.pointsConfig as object[] }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
      include: { createdBy: { select: { id: true, name: true } } },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.svgTemplate.delete({ where: { id } });
  }

  async clone(id: string, userId: string) {
    const original = await this.findOne(id);
    return this.prisma.svgTemplate.create({
      data: {
        name: `${original.name} (עותק)`,
        description: original.description,
        svgContent: original.svgContent,
        thumbnail: original.thumbnail,
        pointsConfig: original.pointsConfig as object[],
        isActive: true,
        isBuiltIn: false,
        createdById: userId,
      },
      include: { createdBy: { select: { id: true, name: true } } },
    });
  }

  async attachToProcess(templateId: string, processId: string) {
    return this.prisma.processSvgAttachment.upsert({
      where: { processId_templateId: { processId, templateId } },
      update: {},
      create: { processId, templateId },
      include: { template: { select: { id: true, name: true, thumbnail: true, description: true } } },
    });
  }

  async detachFromProcess(templateId: string, processId: string) {
    return this.prisma.processSvgAttachment.deleteMany({
      where: { processId, templateId },
    });
  }

  async getProcessAttachments(processId: string) {
    return this.prisma.processSvgAttachment.findMany({
      where: { processId },
      include: {
        template: {
          select: { id: true, name: true, description: true, thumbnail: true, pointsConfig: true, svgContent: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}
