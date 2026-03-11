import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(data: {
    userId: string;
    action: string;
    entity: string;
    entityId: string;
    diff?: Record<string, unknown>;
    ipAddress?: string;
  }) {
    return this.prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        entity: data.entity,
        entityId: data.entityId,
        diff: data.diff as Prisma.InputJsonValue | undefined,
        ipAddress: data.ipAddress,
      },
    });
  }

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * Math.min(limit, 100);
    const take = Math.min(limit, 100);
    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        skip, take,
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { timestamp: 'desc' },
      }),
      this.prisma.auditLog.count(),
    ]);
    return { logs, total, page, limit: take };
  }
}
