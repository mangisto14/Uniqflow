import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

@Injectable()
export class TeamService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTeamDto) {
    return this.prisma.team.create({
      data: {
        name: dto.name,
        color: dto.color ?? '#3b82f6',
        description: dto.description,
      },
    });
  }

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * Math.min(limit, 100);
    const take = Math.min(limit, 100);
    const [teams, total] = await Promise.all([
      this.prisma.team.findMany({ skip, take, orderBy: { createdAt: 'asc' } }),
      this.prisma.team.count(),
    ]);
    return { teams, total, page, limit: take };
  }

  async findOne(id: string) {
    const team = await this.prisma.team.findUnique({
      where: { id },
      include: { members: { select: { id: true, name: true, email: true, role: true } } },
    });
    if (!team) throw new NotFoundException(`Team ${id} not found`);
    return team;
  }

  async update(id: string, dto: UpdateTeamDto) {
    await this.findOne(id);
    return this.prisma.team.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.team.delete({ where: { id } });
  }

  async getInbox(id: string) {
    await this.findOne(id);
    return this.prisma.dispatchRecord.findMany({
      where: { targetTeamId: id, status: 'sent' },
      orderBy: { sentAt: 'desc' },
      take: 50,
    });
  }

  async getReceived(id: string) {
    await this.findOne(id);
    return this.prisma.dispatchRecord.findMany({
      where: { targetTeamId: id },
      orderBy: { sentAt: 'desc' },
      take: 100,
    });
  }

  async getStats(id: string) {
    await this.findOne(id);
    const [totalReceived, unread, members] = await Promise.all([
      this.prisma.dispatchRecord.count({ where: { targetTeamId: id } }),
      this.prisma.dispatchRecord.count({ where: { targetTeamId: id, status: 'sent' } }),
      this.prisma.user.count({ where: { teamId: id, isActive: true } }),
    ]);
    return { totalReceived, unread, members };
  }
}
