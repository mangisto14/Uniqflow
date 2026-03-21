import { Injectable, NotFoundException, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSvgTemplateDto } from './dto/create-svg-template.dto';
import { UpdateSvgTemplateDto } from './dto/update-svg-template.dto';

// ── Built-in SVG content ──────────────────────────────────────────────────────
const TRUCK_SVG = `<svg viewBox="0 0 400 180" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
  <rect x="20" y="80" width="360" height="60" rx="8" fill="#4b5563"/>
  <path d="M200 80 L182 42 L322 42 L340 80 Z" fill="#6b7280"/>
  <path d="M208 78 L194 50 L308 50 L320 78 Z" fill="#bfdbfe" opacity="0.85"/>
  <rect x="25" y="56" width="168" height="34" rx="4" fill="#374151" stroke="#6b7280" stroke-width="1.5"/>
  <line x1="80" y1="56" x2="80" y2="90" stroke="#6b7280" stroke-width="1" stroke-dasharray="4,3" opacity="0.6"/>
  <line x1="130" y1="56" x2="130" y2="90" stroke="#6b7280" stroke-width="1" stroke-dasharray="4,3" opacity="0.6"/>
  <rect x="348" y="88" width="22" height="12" rx="3" fill="#9ca3af"/>
  <rect x="30" y="88" width="22" height="12" rx="3" fill="#9ca3af"/>
  <circle cx="90" cy="147" r="26" fill="#1f2937"/>
  <circle cx="90" cy="147" r="15" fill="#374151"/>
  <circle cx="90" cy="147" r="8" fill="#9ca3af"/>
  <circle cx="300" cy="147" r="26" fill="#1f2937"/>
  <circle cx="300" cy="147" r="15" fill="#374151"/>
  <circle cx="300" cy="147" r="8" fill="#9ca3af"/>
  <rect x="64" y="133" width="272" height="18" rx="5" fill="#374151"/>
  <rect x="352" y="74" width="11" height="17" rx="3" fill="#fef08a"/>
  <rect x="37" y="74" width="11" height="17" rx="3" fill="#fca5a5"/>
  <text x="75" y="77" font-family="sans-serif" font-size="9" fill="#9ca3af" opacity="0.7">ארגז משא</text>
</svg>`;

const PERSON_SVG = `<svg viewBox="0 0 120 230" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
  <circle cx="60" cy="34" r="26" fill="#fde68a"/>
  <path d="M34 28 Q60 6 86 28 Q83 14 60 11 Q37 14 34 28 Z" fill="#92400e"/>
  <circle cx="50" cy="30" r="4" fill="#1e3a5f"/>
  <circle cx="70" cy="30" r="4" fill="#1e3a5f"/>
  <circle cx="51" cy="29" r="1.5" fill="white"/>
  <circle cx="71" cy="29" r="1.5" fill="white"/>
  <path d="M50 43 Q60 52 70 43" fill="none" stroke="#92400e" stroke-width="2" stroke-linecap="round"/>
  <rect x="52" y="58" width="16" height="12" fill="#fde68a"/>
  <path d="M20 82 L44 68 L60 80 L76 68 L100 82 L100 152 L20 152 Z" fill="#3b82f6"/>
  <path d="M44 68 L60 92 L76 68" fill="#eff6ff"/>
  <rect x="6" y="84" width="17" height="52" rx="8" fill="#3b82f6"/>
  <rect x="97" y="84" width="17" height="52" rx="8" fill="#3b82f6"/>
  <ellipse cx="14" cy="140" rx="10" ry="11" fill="#fde68a"/>
  <ellipse cx="106" cy="140" rx="10" ry="11" fill="#fde68a"/>
  <rect x="20" y="152" width="80" height="52" fill="#1e3a5f"/>
  <line x1="60" y1="152" x2="60" y2="204" stroke="#172554" stroke-width="3"/>
  <ellipse cx="40" cy="207" rx="21" ry="9" fill="#1c1917"/>
  <ellipse cx="80" cy="207" rx="21" ry="9" fill="#1c1917"/>
  <rect x="50" y="106" width="20" height="26" rx="3" fill="white" opacity="0.92"/>
  <rect x="54" y="110" width="12" height="4" rx="1" fill="#93c5fd"/>
  <rect x="54" y="117" width="12" height="2" rx="1" fill="#d1d5db"/>
  <rect x="54" y="122" width="8" height="2" rx="1" fill="#d1d5db"/>
  <rect x="57" y="102" width="6" height="6" rx="1" fill="#d1d5db"/>
</svg>`;

const BUILT_IN_TEMPLATES = [
  {
    id: 'tpl-pickup-truck',
    name: 'רכב טנדר',
    description: 'תבנית SVG של רכב טנדר לסימון נזקים, ציוד ומיקומים',
    svgContent: TRUCK_SVG,
  },
  {
    id: 'tpl-person-employee',
    name: 'דמות עובד',
    description: 'תבנית SVG של דמות אדם לסימון פציעות, ציוד מגן וממצאים',
    svgContent: PERSON_SVG,
  },
];

// ─────────────────────────────────────────────────────────────────────────────

@Injectable()
export class SvgTemplateService implements OnModuleInit {
  private readonly logger = new Logger(SvgTemplateService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Runs once on startup — ensures built-in templates always exist in DB */
  async onModuleInit() {
    try {
      const adminUser = await this.prisma.user.findFirst({
        where: { role: { in: ['SUPER_ADMIN', 'ADMIN'] } },
        orderBy: { createdAt: 'asc' },
      });
      if (!adminUser) {
        this.logger.warn('No admin user found — skipping built-in template seed');
        return;
      }
      for (const tpl of BUILT_IN_TEMPLATES) {
        await this.prisma.svgTemplate.upsert({
          where: { id: tpl.id },
          update: {},
          create: {
            id: tpl.id,
            name: tpl.name,
            description: tpl.description,
            svgContent: tpl.svgContent,
            pointsConfig: [],
            isActive: true,
            isBuiltIn: true,
            createdById: adminUser.id,
          },
        });
      }
      this.logger.log(`Built-in SVG templates seeded (${BUILT_IN_TEMPLATES.length})`);
    } catch (err) {
      this.logger.error('Failed to seed built-in SVG templates', err);
    }
  }

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
        orderBy: [{ isBuiltIn: 'desc' }, { createdAt: 'asc' }],
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
