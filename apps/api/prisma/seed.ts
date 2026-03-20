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

  // ── Built-in SVG Templates ──────────────────────────────────────────────────
  const truckSvg = `<svg viewBox="0 0 400 180" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
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

  const personSvg = `<svg viewBox="0 0 120 230" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
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

  await prisma.svgTemplate.upsert({
    where: { id: 'tpl-pickup-truck' },
    update: {},
    create: {
      id: 'tpl-pickup-truck',
      name: 'רכב טנדר',
      description: 'תבנית SVG של רכב טנדר לסימון נזקים, ציוד ומיקומים',
      svgContent: truckSvg,
      pointsConfig: [],
      isActive: true,
      isBuiltIn: true,
      createdById: adminUser.id,
    },
  });

  await prisma.svgTemplate.upsert({
    where: { id: 'tpl-person-employee' },
    update: {},
    create: {
      id: 'tpl-person-employee',
      name: 'דמות עובד',
      description: 'תבנית SVG של דמות אדם לסימון פציעות, ציוד מגן וממצאים',
      svgContent: personSvg,
      pointsConfig: [],
      isActive: true,
      isBuiltIn: true,
      createdById: adminUser.id,
    },
  });

  console.log('Created 2 built-in SVG templates (טנדר + עובד)');
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
