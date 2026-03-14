import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StepExecutionStatus } from '@prisma/client';

@Injectable()
export class DependencyResolver {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns the ordered list of step IDs that are ready to activate,
   * given the current set of completed step IDs.
   */
  async getReadySteps(
    executionId: string,
    completedStepIds: Set<string>,
  ): Promise<string[]> {
    const execution = await this.prisma.processExecution.findUniqueOrThrow({
      where: { id: executionId },
      include: {
        process: {
          include: {
            steps: {
              orderBy: { order: 'asc' },
              include: { dependsOn: true },
            },
          },
        },
        stepExecutions: true,
      },
    });

    const steps = execution.process.steps;
    const stepExecutions = execution.stepExecutions;
    const ready: string[] = [];

    for (const step of steps) {
      const se = stepExecutions.find((s) => s.stepId === step.id);
      if (!se || se.status !== StepExecutionStatus.PENDING) continue;

      const allDepsMet = step.dependsOn.every((d) => completedStepIds.has(d.dependsOnStepId));
      if (allDepsMet) ready.push(step.id);
    }

    return ready;
  }

  /**
   * Detect cycles in the step dependency graph using DFS.
   * Returns true if a cycle exists.
   */
  async hasCycle(processId: string): Promise<boolean> {
    const steps = await this.prisma.processStep.findMany({
      where: { processId },
      include: { dependsOn: true },
    });

    const graph = new Map<string, string[]>();
    for (const step of steps) {
      graph.set(step.id, step.dependsOn.map((d) => d.dependsOnStepId));
    }

    const visited = new Set<string>();
    const inStack = new Set<string>();

    const dfs = (nodeId: string): boolean => {
      if (inStack.has(nodeId)) return true;
      if (visited.has(nodeId)) return false;
      visited.add(nodeId);
      inStack.add(nodeId);
      for (const neighbor of graph.get(nodeId) ?? []) {
        if (dfs(neighbor)) return true;
      }
      inStack.delete(nodeId);
      return false;
    };

    for (const step of steps) {
      if (dfs(step.id)) return true;
    }
    return false;
  }

  /**
   * Topological sort of steps — returns step IDs in execution order.
   */
  async topologicalSort(processId: string): Promise<string[]> {
    const steps = await this.prisma.processStep.findMany({
      where: { processId },
      include: { dependsOn: true },
      orderBy: { order: 'asc' },
    });

    const inDegree = new Map<string, number>();
    const graph = new Map<string, string[]>();

    for (const step of steps) {
      inDegree.set(step.id, 0);
      graph.set(step.id, []);
    }

    for (const step of steps) {
      for (const dep of step.dependsOn) {
        graph.get(dep.dependsOnStepId)?.push(step.id);
        inDegree.set(step.id, (inDegree.get(step.id) ?? 0) + 1);
      }
    }

    const queue = steps
      .filter((s) => (inDegree.get(s.id) ?? 0) === 0)
      .map((s) => s.id);

    const sorted: string[] = [];
    while (queue.length > 0) {
      const current = queue.shift()!;
      sorted.push(current);
      for (const neighbor of graph.get(current) ?? []) {
        const deg = (inDegree.get(neighbor) ?? 0) - 1;
        inDegree.set(neighbor, deg);
        if (deg === 0) queue.push(neighbor);
      }
    }

    return sorted;
  }
}
