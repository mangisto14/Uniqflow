import { PrismaClient, UserRole, ProcessStatus, StepType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create 5 teams
  const teams = await Promise.all([
    prisma.team.upsert({
      where: { id: 'team-engineering' },
      update: {},
      create: {
        id: 'team-engineering',
        name: 'Engineering',
        color: '#3b82f6',
        description: 'Core engineering team',
      },
    }),
    prisma.team.upsert({
      where: { id: 'team-hr' },
      update: {},
      create: {
        id: 'team-hr',
        name: 'Human Resources',
        color: '#10b981',
        description: 'HR and people operations',
      },
    }),
    prisma.team.upsert({
      where: { id: 'team-finance' },
      update: {},
      create: {
        id: 'team-finance',
        name: 'Finance',
        color: '#f59e0b',
        description: 'Finance and accounting',
      },
    }),
    prisma.team.upsert({
      where: { id: 'team-ops' },
      update: {},
      create: {
        id: 'team-ops',
        name: 'Operations',
        color: '#8b5cf6',
        description: 'Business operations',
      },
    }),
    prisma.team.upsert({
      where: { id: 'team-legal' },
      update: {},
      create: {
        id: 'team-legal',
        name: 'Legal',
        color: '#ef4444',
        description: 'Legal and compliance',
      },
    }),
  ]);

  console.log(`Created ${teams.length} teams`);

  // Create 10 users
  const passwordHash = await bcrypt.hash('Password123!', 10);

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'admin@uniqflow.io' },
      update: {},
      create: {
        email: 'admin@uniqflow.io',
        name: 'Super Admin',
        passwordHash,
        role: UserRole.SUPER_ADMIN,
      },
    }),
    prisma.user.upsert({
      where: { email: 'manager@uniqflow.io' },
      update: {},
      create: {
        email: 'manager@uniqflow.io',
        name: 'Process Manager',
        passwordHash,
        role: UserRole.MANAGER,
        teamId: 'team-ops',
      },
    }),
    prisma.user.upsert({
      where: { email: 'eng1@uniqflow.io' },
      update: {},
      create: {
        email: 'eng1@uniqflow.io',
        name: 'Alice Engineer',
        passwordHash,
        role: UserRole.EDITOR,
        teamId: 'team-engineering',
      },
    }),
    prisma.user.upsert({
      where: { email: 'eng2@uniqflow.io' },
      update: {},
      create: {
        email: 'eng2@uniqflow.io',
        name: 'Bob Engineer',
        passwordHash,
        role: UserRole.VIEWER,
        teamId: 'team-engineering',
      },
    }),
    prisma.user.upsert({
      where: { email: 'hr1@uniqflow.io' },
      update: {},
      create: {
        email: 'hr1@uniqflow.io',
        name: 'Carol HR',
        passwordHash,
        role: UserRole.EDITOR,
        teamId: 'team-hr',
      },
    }),
    prisma.user.upsert({
      where: { email: 'hr2@uniqflow.io' },
      update: {},
      create: {
        email: 'hr2@uniqflow.io',
        name: 'Dave HR',
        passwordHash,
        role: UserRole.VIEWER,
        teamId: 'team-hr',
      },
    }),
    prisma.user.upsert({
      where: { email: 'finance1@uniqflow.io' },
      update: {},
      create: {
        email: 'finance1@uniqflow.io',
        name: 'Eve Finance',
        passwordHash,
        role: UserRole.EDITOR,
        teamId: 'team-finance',
      },
    }),
    prisma.user.upsert({
      where: { email: 'ops1@uniqflow.io' },
      update: {},
      create: {
        email: 'ops1@uniqflow.io',
        name: 'Frank Ops',
        passwordHash,
        role: UserRole.VIEWER,
        teamId: 'team-ops',
      },
    }),
    prisma.user.upsert({
      where: { email: 'legal1@uniqflow.io' },
      update: {},
      create: {
        email: 'legal1@uniqflow.io',
        name: 'Grace Legal',
        passwordHash,
        role: UserRole.VIEWER,
        teamId: 'team-legal',
      },
    }),
    prisma.user.upsert({
      where: { email: 'viewer@uniqflow.io' },
      update: {},
      create: {
        email: 'viewer@uniqflow.io',
        name: 'View Only User',
        passwordHash,
        role: UserRole.VIEWER,
      },
    }),
  ]);

  console.log(`Created ${users.length} users`);

  const adminUser = users[0];

  // Create 3 processes
  const process1 = await prisma.process.upsert({
    where: { id: 'process-onboarding' },
    update: {},
    create: {
      id: 'process-onboarding',
      name: 'Employee Onboarding',
      description: 'Standard onboarding process for new employees',
      status: ProcessStatus.ACTIVE,
      createdById: adminUser.id,
      steps: {
        create: [
          {
            type: StepType.FORM,
            name: 'Personal Information',
            description: 'Collect personal details',
            order: 0,
            assignedTeamId: 'team-hr',
            config: {},
            position: { x: 100, y: 100 },
            fields: {
              create: [
                { name: 'full_name', label: 'Full Name', fieldType: 'text', required: true, order: 0 },
                { name: 'email', label: 'Work Email', fieldType: 'email', required: true, order: 1 },
                { name: 'start_date', label: 'Start Date', fieldType: 'date', required: true, order: 2 },
                { name: 'department', label: 'Department', fieldType: 'select', required: true, order: 3,
                  options: [
                    { value: 'engineering', label: 'Engineering' },
                    { value: 'hr', label: 'Human Resources' },
                    { value: 'finance', label: 'Finance' },
                  ],
                },
              ],
            },
          },
          {
            type: StepType.APPROVAL,
            name: 'Manager Approval',
            description: 'Manager approves the onboarding',
            order: 1,
            assignedTeamId: 'team-ops',
            config: {},
            position: { x: 350, y: 100 },
          },
          {
            type: StepType.TASK,
            name: 'Setup Equipment',
            description: 'IT sets up equipment for new employee',
            order: 2,
            assignedTeamId: 'team-engineering',
            config: {},
            position: { x: 600, y: 100 },
          },
        ],
      },
    },
  });

  const process2 = await prisma.process.upsert({
    where: { id: 'process-leave-request' },
    update: {},
    create: {
      id: 'process-leave-request',
      name: 'Leave Request',
      description: 'Process for submitting and approving leave requests',
      status: ProcessStatus.ACTIVE,
      createdById: adminUser.id,
      steps: {
        create: [
          {
            type: StepType.FORM,
            name: 'Leave Application',
            description: 'Submit leave application',
            order: 0,
            config: {},
            position: { x: 100, y: 100 },
            fields: {
              create: [
                { name: 'leave_type', label: 'Leave Type', fieldType: 'select', required: true, order: 0,
                  options: [
                    { value: 'annual', label: 'Annual Leave' },
                    { value: 'sick', label: 'Sick Leave' },
                    { value: 'personal', label: 'Personal Leave' },
                  ],
                },
                { name: 'start_date', label: 'From Date', fieldType: 'date', required: true, order: 1 },
                { name: 'end_date', label: 'To Date', fieldType: 'date', required: true, order: 2 },
                { name: 'reason', label: 'Reason', fieldType: 'textarea', required: false, order: 3 },
              ],
            },
          },
          {
            type: StepType.APPROVAL,
            name: 'HR Approval',
            description: 'HR approves or rejects the leave',
            order: 1,
            assignedTeamId: 'team-hr',
            config: {},
            position: { x: 350, y: 100 },
          },
          {
            type: StepType.NOTIFICATION,
            name: 'Notify Employee',
            description: 'Send notification to employee',
            order: 2,
            config: { message: 'Your leave request has been processed.' },
            position: { x: 600, y: 100 },
          },
        ],
      },
    },
  });

  const process3 = await prisma.process.upsert({
    where: { id: 'process-purchase-order' },
    update: {},
    create: {
      id: 'process-purchase-order',
      name: 'Purchase Order',
      description: 'Process for creating and approving purchase orders',
      status: ProcessStatus.DRAFT,
      createdById: adminUser.id,
      steps: {
        create: [
          {
            type: StepType.FORM,
            name: 'Purchase Request',
            description: 'Submit purchase request details',
            order: 0,
            config: {},
            position: { x: 100, y: 100 },
            fields: {
              create: [
                { name: 'item_name', label: 'Item Name', fieldType: 'text', required: true, order: 0 },
                { name: 'quantity', label: 'Quantity', fieldType: 'number', required: true, order: 1 },
                { name: 'estimated_cost', label: 'Estimated Cost', fieldType: 'number', required: true, order: 2 },
                { name: 'justification', label: 'Justification', fieldType: 'textarea', required: true, order: 3 },
              ],
            },
          },
          {
            type: StepType.CONDITION,
            name: 'Cost Check',
            description: 'Check if cost exceeds threshold',
            order: 1,
            config: { threshold: 10000 },
            position: { x: 350, y: 100 },
          },
          {
            type: StepType.APPROVAL,
            name: 'Finance Approval',
            description: 'Finance approves high-value purchases',
            order: 2,
            assignedTeamId: 'team-finance',
            config: {},
            position: { x: 600, y: 100 },
          },
          {
            type: StepType.REVIEW,
            name: 'Legal Review',
            description: 'Legal reviews the purchase',
            order: 3,
            assignedTeamId: 'team-legal',
            config: {},
            position: { x: 850, y: 100 },
          },
        ],
      },
    },
  });

  console.log(`Created processes: ${process1.name}, ${process2.name}, ${process3.name}`);
  console.log('\nSeed complete!');
  console.log('\nDefault credentials:');
  console.log('  Email: admin@uniqflow.io');
  console.log('  Password: Password123!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
