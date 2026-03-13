# CLAUDE.md — Uniqflow | מיוחדים
# test 0222
## System Specification

**Product:** Uniqflow (מיוחדים) — Enterprise Process Management Platform
**Version:** 1.0.0
**Codename:** `uniqflow`

### Core Capabilities

1. **Visual Process Builder** — Drag-and-drop DAG editor for defining multi-step workflows with conditions, branches, parallel paths, and loops
2. **Rule Engine** — Runtime condition evaluation with nested boolean logic, field references, and built-in functions
3. **Execution Runtime** — Stateful process executor with dependency resolution, branch handling, and error recovery
4. **Data Dispatch** — Automated distribution of collected process data to designated teams based on configurable sharing rules
5. **RBAC & Admin** — Role-based access control with granular permissions and full admin panel
6. **Team Dashboards** — Per-team views with inbox, received data, statistics, and real-time updates

### Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18, TypeScript, Vite | SPA client |
| State | Zustand | Client state management |
| Visual Builder | React Flow | DAG editor |
| Styling | TailwindCSS | Utility-first CSS |
| Backend | NestJS, TypeScript | REST API + WebSocket |
| ORM | Prisma | Type-safe database access |
| Database | PostgreSQL 16 | Primary data store |
| Cache/Queue | Redis 7 | Caching, job queues, pub/sub |
| Real-time | Socket.IO | Live updates |
| Auth | JWT (access + refresh tokens) | Authentication |
| Monorepo | Turborepo | Build orchestration |

### Architecture Pattern

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                      │
│  ┌──────────┐ ┌──────────┐ ┌────────┐ ┌──────────────┐ │
│  │ Builder  │ │Execution │ │ Admin  │ │Team Dashboard│ │
│  │(ReactFlow│ │  View    │ │ Panel  │ │              │ │
│  └────┬─────┘ └────┬─────┘ └───┬────┘ └──────┬───────┘ │
│       │             │           │              │         │
│  ┌────┴─────────────┴───────────┴──────────────┴──────┐  │
│  │              API Client + Zustand Stores           │  │
│  └────────────────────────┬───────────────────────────┘  │
└───────────────────────────┼──────────────────────────────┘
                            │ HTTP + WebSocket
┌───────────────────────────┼──────────────────────────────┐
│                    BACKEND (NestJS)                       │
│  ┌────────────────────────┴───────────────────────────┐  │
│  │              REST Controllers + WS Gateway         │  │
│  └────────────────────────┬───────────────────────────┘  │
│       │             │           │              │         │
│  ┌────┴────┐  ┌─────┴────┐ ┌───┴────┐  ┌─────┴───────┐ │
│  │  Auth   │  │ Process  │ │  Team  │  │   Audit     │ │
│  │ Module  │  │ Module   │ │ Module │  │   Module    │ │
│  └─────────┘  └─────┬────┘ └────────┘  └─────────────┘ │
│                      │                                   │
│  ┌───────────────────┴───────────────────────────────┐  │
│  │              ENGINE (Core Business Logic)          │  │
│  │  ┌────────────┐ ┌───────────┐ ┌────────────────┐  │  │
│  │  │  State     │ │ Condition │ │   Process      │  │  │
│  │  │  Machine   │ │  Parser   │ │   Executor     │  │  │
│  │  └────────────┘ └───────────┘ └───────┬────────┘  │  │
│  │  ┌────────────┐ ┌───────────┐ ┌───────┴────────┐  │  │
│  │  │  Step      │ │ Dispatch  │ │  Dependency    │  │  │
│  │  │  Handlers  │ │  Engine   │ │  Resolver      │  │  │
│  │  └────────────┘ └───────────┘ └────────────────┘  │  │
│  └───────────────────────────────────────────────────┘  │
│                           │                              │
│  ┌────────────────────────┴───────────────────────────┐  │
│  │              Prisma ORM                            │  │
│  └────────────────────────┬───────────────────────────┘  │
└───────────────────────────┼──────────────────────────────┘
                            │
              ┌─────────────┼──────────────┐
              │ PostgreSQL  │    Redis      │
              └─────────────┴──────────────┘
```

---

## Project Structure

```
uniqflow/
├── package.json
├── turbo.json
├── tsconfig.base.json
├── docker-compose.yml
├── .env.example
├── CLAUDE.md
│
├── packages/
│   └── shared/
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── types/
│           │   ├── index.ts
│           │   ├── process.ts
│           │   ├── step.ts
│           │   ├── execution.ts
│           │   ├── conditions.ts
│           │   ├── user.ts
│           │   ├── sharing.ts
│           │   ├── audit.ts
│           │   └── notifications.ts
│           ├── constants/
│           │   ├── permissions.ts
│           │   └── defaults.ts
│           └── utils/
│               ├── index.ts
│               └── validators.ts
│
├── apps/
│   ├── web/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts
│   │   ├── tailwind.config.ts
│   │   ├── index.html
│   │   └── src/
│   │       ├── main.tsx
│   │       ├── App.tsx
│   │       ├── routes.tsx
│   │       ├── api/
│   │       │   ├── client.ts
│   │       │   ├── auth.api.ts
│   │       │   ├── processes.api.ts
│   │       │   ├── executions.api.ts
│   │       │   ├── teams.api.ts
│   │       │   ├── users.api.ts
│   │       │   └── notifications.api.ts
│   │       ├── stores/
│   │       │   ├── auth.store.ts
│   │       │   ├── process.store.ts
│   │       │   ├── execution.store.ts
│   │       │   └── ui.store.ts
│   │       ├── hooks/
│   │       │   ├── useAuth.ts
│   │       │   ├── usePermissions.ts
│   │       │   ├── useSocket.ts
│   │       │   └── useDebounce.ts
│   │       ├── providers/
│   │       │   ├── AuthProvider.tsx
│   │       │   └── SocketProvider.tsx
│   │       ├── components/
│   │       │   ├── layout/
│   │       │   │   ├── AppShell.tsx
│   │       │   │   ├── Sidebar.tsx
│   │       │   │   ├── TopBar.tsx
│   │       │   │   └── AdminLayout.tsx
│   │       │   ├── ui/
│   │       │   │   ├── Button.tsx
│   │       │   │   ├── Input.tsx
│   │       │   │   ├── Select.tsx
│   │       │   │   ├── Modal.tsx
│   │       │   │   ├── DataTable.tsx
│   │       │   │   ├── Badge.tsx
│   │       │   │   ├── Card.tsx
│   │       │   │   ├── Dropdown.tsx
│   │       │   │   ├── Toast.tsx
│   │       │   │   └── Spinner.tsx
│   │       │   └── PermissionGate.tsx
│   │       ├── features/
│   │       │   ├── dashboard/
│   │       │   │   ├── DashboardPage.tsx
│   │       │   │   ├── StatsGrid.tsx
│   │       │   │   ├── ProcessList.tsx
│   │       │   │   └── ShareMatrix.tsx
│   │       │   ├── builder/
│   │       │   │   ├── BuilderPage.tsx
│   │       │   │   ├── FlowCanvas.tsx
│   │       │   │   ├── Palette.tsx
│   │       │   │   ├── ConfigPanel.tsx
│   │       │   │   ├── BuilderToolbar.tsx
│   │       │   │   ├── nodes/
│   │       │   │   │   ├── BaseNode.tsx
│   │       │   │   │   ├── FormNode.tsx
│   │       │   │   │   ├── ApprovalNode.tsx
│   │       │   │   │   ├── ConditionNode.tsx
│   │       │   │   │   ├── NotificationNode.tsx
│   │       │   │   │   ├── TaskNode.tsx
│   │       │   │   │   └── ReviewNode.tsx
│   │       │   │   ├── edges/
│   │       │   │   │   ├── DefaultEdge.tsx
│   │       │   │   │   └── ConditionalEdge.tsx
│   │       │   │   ├── hooks/
│   │       │   │   │   ├── useFlowState.ts
│   │       │   │   │   └── useUndoRedo.ts
│   │       │   │   └── utils/
│   │       │   │       ├── serializer.ts
│   │       │   │       ├── validator.ts
│   │       │   │       └── layout.ts
│   │       │   ├── conditions/
│   │       │   │   ├── ConditionEditor.tsx
│   │       │   │   ├── RuleRow.tsx
│   │       │   │   ├── RuleGroup.tsx
│   │       │   │   ├── FieldPicker.tsx
│   │       │   │   ├── ConditionPreview.tsx
│   │       │   │   └── ConditionTester.tsx
│   │       │   ├── forms/
│   │       │   │   ├── FormDesigner.tsx
│   │       │   │   ├── FieldEditor.tsx
│   │       │   │   ├── FormRenderer.tsx
│   │       │   │   ├── FormPreview.tsx
│   │       │   │   ├── fields/
│   │       │   │   │   ├── TextField.tsx
│   │       │   │   │   ├── NumberField.tsx
│   │       │   │   │   ├── DateField.tsx
│   │       │   │   │   ├── SelectField.tsx
│   │       │   │   │   ├── TextareaField.tsx
│   │       │   │   │   ├── FileField.tsx
│   │       │   │   │   └── CheckboxField.tsx
│   │       │   │   └── validation.ts
│   │       │   ├── execution/
│   │       │   │   ├── ExecutionList.tsx
│   │       │   │   ├── ExecutionDetail.tsx
│   │       │   │   ├── StepInteraction.tsx
│   │       │   │   ├── ExecutionTimeline.tsx
│   │       │   │   └── hooks/
│   │       │   │       └── useExecution.ts
│   │       │   ├── team-dashboard/
│   │       │   │   ├── TeamHome.tsx
│   │       │   │   ├── TeamInbox.tsx
│   │       │   │   ├── ReceivedData.tsx
│   │       │   │   └── TeamStats.tsx
│   │       │   ├── notifications/
│   │       │   │   ├── NotificationBell.tsx
│   │       │   │   ├── NotificationList.tsx
│   │       │   │   └── NotificationPrefs.tsx
│   │       │   └── audit/
│   │       │       └── AuditViewer.tsx
│   │       └── pages/
│   │           ├── LoginPage.tsx
│   │           └── admin/
│   │               ├── UsersPage.tsx
│   │               ├── TeamsPage.tsx
│   │               ├── RolesPage.tsx
│   │               └── SettingsPage.tsx
│   │
│   └── api/
│       ├── package.json
│       ├── tsconfig.json
│       ├── nest-cli.json
│       ├── .env
│       ├── prisma/
│       │   ├── schema.prisma
│       │   ├── seed.ts
│       │   └── migrations/
│       └── src/
│           ├── main.ts
│           ├── app.module.ts
│           ├── prisma/
│           │   ├── prisma.module.ts
│           │   └── prisma.service.ts
│           ├── common/
│           │   ├── filters/
│           │   │   └── http-exception.filter.ts
│           │   ├── pipes/
│           │   │   └── validation.pipe.ts
│           │   ├── interceptors/
│           │   │   ├── transform.interceptor.ts
│           │   │   └── logging.interceptor.ts
│           │   └── decorators/
│           │       └── public.decorator.ts
│           ├── modules/
│           │   ├── auth/
│           │   │   ├── auth.module.ts
│           │   │   ├── auth.controller.ts
│           │   │   ├── auth.service.ts
│           │   │   ├── strategies/
│           │   │   │   └── jwt.strategy.ts
│           │   │   ├── guards/
│           │   │   │   ├── jwt-auth.guard.ts
│           │   │   │   ├── roles.guard.ts
│           │   │   │   └── permissions.guard.ts
│           │   │   ├── decorators/
│           │   │   │   ├── roles.decorator.ts
│           │   │   │   ├── permissions.decorator.ts
│           │   │   │   └── current-user.decorator.ts
│           │   │   └── dto/
│           │   │       ├── login.dto.ts
│           │   │       ├── register.dto.ts
│           │   │       └── tokens.dto.ts
│           │   ├── process/
│           │   │   ├── process.module.ts
│           │   │   ├── process.controller.ts
│           │   │   ├── process.service.ts
│           │   │   └── dto/
│           │   ├── step/
│           │   │   ├── step.module.ts
│           │   │   ├── step.controller.ts
│           │   │   ├── step.service.ts
│           │   │   └── dto/
│           │   ├── execution/
│           │   │   ├── execution.module.ts
│           │   │   ├── execution.controller.ts
│           │   │   ├── execution.service.ts
│           │   │   ├── execution.gateway.ts
│           │   │   └── dto/
│           │   ├── team/
│           │   │   ├── team.module.ts
│           │   │   ├── team.controller.ts
│           │   │   ├── team.service.ts
│           │   │   └── dto/
│           │   ├── user/
│           │   │   ├── user.module.ts
│           │   │   ├── user.controller.ts
│           │   │   ├── user.service.ts
│           │   │   └── dto/
│           │   ├── notifications/
│           │   │   ├── notification.module.ts
│           │   │   ├── notification.service.ts
│           │   │   ├── notification.gateway.ts
│           │   │   └── channels/
│           │   │       ├── email.channel.ts
│           │   │       └── webhook.channel.ts
│           │   └── audit/
│           │       ├── audit.module.ts
│           │       ├── audit.service.ts
│           │       ├── audit.controller.ts
│           │       └── audit.interceptor.ts
│           └── engine/
│               ├── engine.module.ts
│               ├── state-machine/
│               │   ├── process-fsm.ts
│               │   ├── step-fsm.ts
│               │   ├── transition-rules.ts
│               │   └── lifecycle-hooks.ts
│               ├── conditions/
│               │   ├── condition-parser.ts
│               │   ├── operator-registry.ts
│               │   ├── expression-evaluator.ts
│               │   ├── builtin-functions.ts
│               │   └── __tests__/
│               ├── executor/
│               │   ├── process-executor.ts
│               │   ├── step-runner.ts
│               │   ├── branch-handler.ts
│               │   ├── dependency-resolver.ts
│               │   ├── execution-context.ts
│               │   ├── error-strategy.ts
│               │   └── __tests__/
│               ├── handlers/
│               │   ├── base.handler.ts
│               │   ├── form.handler.ts
│               │   ├── approval.handler.ts
│               │   ├── condition.handler.ts
│               │   ├── task.handler.ts
│               │   ├── notification.handler.ts
│               │   ├── review.handler.ts
│               │   └── handler-registry.ts
│               └── dispatch/
│                   ├── dispatch-engine.ts
│                   ├── rule-processor.ts
│                   ├── data-filter.ts
│                   ├── digest-builder.ts
│                   ├── delivery-tracker.ts
│                   ├── channels/
│                   └── templates/
```

---

## Database Schema

Full Prisma schema — copy to apps/api/prisma/schema.prisma:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserRole {
  SUPER_ADMIN
  ADMIN
  MANAGER
  EDITOR
  VIEWER
}

model Team {
  id          String   @id @default(cuid())
  name        String
  color       String   @default("#3b82f6")
  description String?
  isActive    Boolean  @default(true) @map("is_active")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  members       User[]
  assignedSteps ProcessStep[]
  sharingRules  SharingRule[] @relation("TargetTeam")
  @@map("teams")
}

model User {
  id           String    @id @default(cuid())
  email        String    @unique
  name         String
  passwordHash String    @map("password_hash")
  role         UserRole  @default(VIEWER)
  teamId       String?   @map("team_id")
  isActive     Boolean   @default(true) @map("is_active")
  lastLoginAt  DateTime? @map("last_login_at")
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")
  team              Team?            @relation(fields: [teamId], references: [id])
  createdProcesses  Process[]
  stepExecutions    StepExecution[]
  auditLogs         AuditLog[]
  refreshTokens     RefreshToken[]
  @@map("users")
}

model RefreshToken {
  id        String   @id @default(cuid())
  userId    String   @map("user_id")
  token     String   @unique
  expiresAt DateTime @map("expires_at")
  createdAt DateTime @default(now()) @map("created_at")
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([token])
  @@map("refresh_tokens")
}

enum ProcessStatus {
  DRAFT
  ACTIVE
  PAUSED
  COMPLETED
  CANCELLED
}

model Process {
  id          String        @id @default(cuid())
  name        String
  description String?
  status      ProcessStatus @default(DRAFT)
  version     Int           @default(1)
  metadata    Json?
  createdById String        @map("created_by_id")
  createdAt   DateTime      @default(now()) @map("created_at")
  updatedAt   DateTime      @updatedAt @map("updated_at")
  createdBy  User             @relation(fields: [createdById], references: [id])
  steps      ProcessStep[]
  executions ProcessExecution[]
  @@index([status])
  @@index([createdById])
  @@map("processes")
}

enum StepType {
  FORM
  APPROVAL
  CONDITION
  NOTIFICATION
  TASK
  REVIEW
}

model ProcessStep {
  id             String   @id @default(cuid())
  processId      String   @map("process_id")
  type           StepType
  name           String
  description    String?
  config         Json     @default("{}")
  position       Json     @default("{\"x\": 0, \"y\": 0}")
  order          Int      @default(0)
  assignedTeamId String?  @map("assigned_team_id")
  timeoutMinutes Int?     @map("timeout_minutes")
  isRequired     Boolean  @default(true) @map("is_required")
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")
  process      Process          @relation(fields: [processId], references: [id], onDelete: Cascade)
  assignedTeam Team?            @relation(fields: [assignedTeamId], references: [id])
  dependsOn    StepDependency[] @relation("DependentStep")
  dependedBy   StepDependency[] @relation("DependencyStep")
  fields       StepField[]
  branches     StepBranch[]
  sharingRules SharingRule[]
  executions   StepExecution[]
  @@index([processId])
  @@map("process_steps")
}

model StepDependency {
  id              String @id @default(cuid())
  stepId          String @map("step_id")
  dependsOnStepId String @map("depends_on_step_id")
  type            String @default("completion")
  step      ProcessStep @relation("DependentStep", fields: [stepId], references: [id], onDelete: Cascade)
  dependsOn ProcessStep @relation("DependencyStep", fields: [dependsOnStepId], references: [id], onDelete: Cascade)
  @@unique([stepId, dependsOnStepId])
  @@map("step_dependencies")
}

model StepField {
  id            String  @id @default(cuid())
  stepId        String  @map("step_id")
  name          String
  label         String
  fieldType     String  @map("field_type")
  required      Boolean @default(false)
  defaultValue  String? @map("default_value")
  placeholder   String?
  options       Json?
  validation    Json?
  order         Int     @default(0)
  conditionalOn Json?   @map("conditional_on")
  step ProcessStep @relation(fields: [stepId], references: [id], onDelete: Cascade)
  @@index([stepId])
  @@map("step_fields")
}

model StepBranch {
  id           String  @id @default(cuid())
  stepId       String  @map("step_id")
  label        String
  condition    Json
  targetStepId String? @map("target_step_id")
  isDefault    Boolean @default(false) @map("is_default")
  order        Int     @default(0)
  step ProcessStep @relation(fields: [stepId], references: [id], onDelete: Cascade)
  @@index([stepId])
  @@map("step_branches")
}

enum ShareType {
  ALL_DATA
  FILTERED
  DIGEST
}

model SharingRule {
  id           String    @id @default(cuid())
  stepId       String    @map("step_id")
  targetTeamId String    @map("target_team_id")
  shareType    ShareType @default(ALL_DATA)
  filterConfig Json?     @map("filter_config")
  template     String?
  isActive     Boolean   @default(true) @map("is_active")
  step       ProcessStep @relation(fields: [stepId], references: [id], onDelete: Cascade)
  targetTeam Team        @relation("TargetTeam", fields: [targetTeamId], references: [id])
  @@map("sharing_rules")
}

model ProcessExecution {
  id          String        @id @default(cuid())
  processId   String        @map("process_id")
  status      ProcessStatus @default(ACTIVE)
  currentData Json          @default("{}") @map("current_data")
  startedById String        @map("started_by_id")
  startedAt   DateTime      @default(now()) @map("started_at")
  completedAt DateTime?     @map("completed_at")
  cancelledAt DateTime?     @map("cancelled_at")
  metadata    Json?
  process        Process         @relation(fields: [processId], references: [id])
  stepExecutions StepExecution[]
  @@index([processId])
  @@index([status])
  @@map("process_executions")
}

enum StepExecutionStatus {
  PENDING
  ACTIVE
  COMPLETED
  SKIPPED
  FAILED
}

model StepExecution {
  id           String              @id @default(cuid())
  executionId  String              @map("execution_id")
  stepId       String              @map("step_id")
  status       StepExecutionStatus @default(PENDING)
  data         Json                @default("{}")
  assignedToId String?             @map("assigned_to_id")
  notes        String?
  startedAt    DateTime?           @map("started_at")
  completedAt  DateTime?           @map("completed_at")
  metadata     Json?
  execution  ProcessExecution @relation(fields: [executionId], references: [id], onDelete: Cascade)
  step       ProcessStep      @relation(fields: [stepId], references: [id])
  assignedTo User?            @relation(fields: [assignedToId], references: [id])
  @@index([executionId])
  @@index([stepId])
  @@index([status])
  @@map("step_executions")
}

model AuditLog {
  id        String   @id @default(cuid())
  userId    String   @map("user_id")
  action    String
  entity    String
  entityId  String   @map("entity_id")
  diff      Json?
  ipAddress String?  @map("ip_address")
  timestamp DateTime @default(now())
  user User @relation(fields: [userId], references: [id])
  @@index([entity, entityId])
  @@index([userId])
  @@index([timestamp])
  @@map("audit_logs")
}

model Notification {
  id        String   @id @default(cuid())
  userId    String   @map("user_id")
  title     String
  body      String
  type      String
  link      String?
  entityId  String?  @map("entity_id")
  isRead    Boolean  @default(false) @map("is_read")
  createdAt DateTime @default(now()) @map("created_at")
  @@index([userId, isRead])
  @@index([createdAt])
  @@map("notifications")
}

model DispatchRecord {
  id           String    @id @default(cuid())
  executionId  String    @map("execution_id")
  stepId       String    @map("step_id")
  targetTeamId String    @map("target_team_id")
  channel      String
  payload      Json
  status       String    @default("sent")
  sentAt       DateTime  @default(now()) @map("sent_at")
  readAt       DateTime? @map("read_at")
  @@index([targetTeamId])
  @@index([executionId])
  @@map("dispatch_records")
}
```

---

## Shared Types

All types below go in packages/shared/src/types/:

```typescript
// ── process.ts ──
export enum ProcessStatus {
  DRAFT = 'DRAFT', ACTIVE = 'ACTIVE', PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED', CANCELLED = 'CANCELLED',
}

export interface IProcess {
  id: string;
  name: string;
  description?: string;
  status: ProcessStatus;
  version: number;
  metadata?: Record<string, unknown>;
  createdById: string;
  steps: IStep[];
  createdAt: string;
  updatedAt: string;
}

// ── step.ts ──
export enum StepType {
  FORM = 'FORM', APPROVAL = 'APPROVAL', CONDITION = 'CONDITION',
  NOTIFICATION = 'NOTIFICATION', TASK = 'TASK', REVIEW = 'REVIEW',
}

export type FieldType = 'text' | 'number' | 'email' | 'date' | 'select' | 'multi_select' | 'textarea' | 'file' | 'checkbox';

export interface IStep {
  id: string; processId: string; type: StepType; name: string;
  description?: string; config: Record<string, unknown>;
  position: { x: number; y: number }; order: number;
  assignedTeamId?: string; timeoutMinutes?: number; isRequired: boolean;
  fields?: IStepField[]; branches?: IStepBranch[];
  dependencies?: IStepDependency[]; sharingRules?: ISharingRule[];
}

export interface IStepField {
  id: string; stepId: string; name: string; label: string;
  fieldType: FieldType; required: boolean; defaultValue?: string;
  placeholder?: string; options?: { value: string; label: string }[];
  validation?: { min?: number; max?: number; minLength?: number; maxLength?: number; pattern?: string };
  order: number; conditionalOn?: IConditionGroup;
}

export interface IStepBranch {
  id: string; stepId: string; label: string;
  condition: IConditionGroup; targetStepId?: string;
  isDefault: boolean; order: number;
}

export interface IStepDependency {
  id: string; stepId: string; dependsOnStepId: string;
  type: 'completion' | 'approval' | 'condition';
}

// ── conditions.ts ──
export enum Operator {
  EQUALS = 'equals', NOT_EQUALS = 'not_equals',
  GT = 'gt', LT = 'lt', GTE = 'gte', LTE = 'lte',
  CONTAINS = 'contains', NOT_CONTAINS = 'not_contains',
  STARTS_WITH = 'starts_with', ENDS_WITH = 'ends_with',
  IN = 'in', NOT_IN = 'not_in',
  IS_EMPTY = 'is_empty', IS_NOT_EMPTY = 'is_not_empty', REGEX = 'regex',
}

export enum LogicOperator { AND = 'AND', OR = 'OR' }

export interface ICondition { field: string; operator: Operator; value: unknown; }
export interface IConditionGroup {
  logic: LogicOperator;
  conditions: Array<ICondition | IConditionGroup>;
}

// ── execution.ts ──
export enum StepExecutionStatus {
  PENDING = 'PENDING', ACTIVE = 'ACTIVE', COMPLETED = 'COMPLETED',
  SKIPPED = 'SKIPPED', FAILED = 'FAILED',
}

export interface IExecution {
  id: string; processId: string; status: ProcessStatus;
  currentData: Record<string, unknown>; startedById: string;
  startedAt: string; completedAt?: string;
  stepExecutions: IStepExecution[];
}

export interface IStepExecution {
  id: string; executionId: string; stepId: string;
  status: StepExecutionStatus; data: Record<string, unknown>;
  assignedToId?: string; notes?: string;
  startedAt?: string; completedAt?: string;
}

// ── user.ts ──
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN', ADMIN = 'ADMIN', MANAGER = 'MANAGER',
  EDITOR = 'EDITOR', VIEWER = 'VIEWER',
}

export interface IUser {
  id: string; email: string; name: string; role: UserRole;
  teamId?: string; team?: ITeam; isActive: boolean;
}

export interface ITeam {
  id: string; name: string; color: string; description?: string;
  isActive: boolean; members?: IUser[];
}

// ── sharing.ts ──
export enum ShareType { ALL_DATA = 'ALL_DATA', FILTERED = 'FILTERED', DIGEST = 'DIGEST' }

export interface ISharingRule {
  id: string; stepId: string; targetTeamId: string;
  shareType: ShareType;
  filterConfig?: { include?: string[]; exclude?: string[] };
  template?: string; isActive: boolean;
}

// ── audit.ts ──
export type AuditAction = 'create' | 'update' | 'delete' | 'execute' | 'approve' | 'reject' | 'dispatch' | 'login' | 'logout';

export interface IAuditLog {
  id: string; userId: string; action: AuditAction;
  entity: string; entityId: string;
  diff?: { before: unknown; after: unknown }; timestamp: string;
}

// ── notifications.ts ──
export type NotificationType = 'info' | 'warning' | 'action_required' | 'dispatch' | 'process_complete';

export interface INotification {
  id: string; userId: string; title: string; body: string;
  type: NotificationType; link?: string; isRead: boolean; createdAt: string;
}
```

```typescript
// ── constants/permissions.ts ──
export enum Permission {
  CREATE_PROCESS = 'create_process', EDIT_PROCESS = 'edit_process',
  DELETE_PROCESS = 'delete_process', VIEW_PROCESS = 'view_process',
  EXECUTE_PROCESS = 'execute_process', MANAGE_TEAMS = 'manage_teams',
  MANAGE_USERS = 'manage_users', VIEW_ADMIN = 'view_admin',
  VIEW_AUDIT = 'view_audit', MANAGE_SETTINGS = 'manage_settings',
  VIEW_DASHBOARD = 'view_dashboard', VIEW_TEAM_DASHBOARD = 'view_team_dashboard',
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  SUPER_ADMIN: Object.values(Permission),
  ADMIN: Object.values(Permission).filter(p => p !== Permission.MANAGE_SETTINGS),
  MANAGER: [Permission.CREATE_PROCESS, Permission.EDIT_PROCESS, Permission.VIEW_PROCESS, Permission.EXECUTE_PROCESS, Permission.VIEW_DASHBOARD, Permission.VIEW_TEAM_DASHBOARD],
  EDITOR: [Permission.EDIT_PROCESS, Permission.VIEW_PROCESS, Permission.EXECUTE_PROCESS, Permission.VIEW_DASHBOARD],
  VIEWER: [Permission.VIEW_PROCESS, Permission.VIEW_DASHBOARD],
};
```

---

## Build Phases — Execute Sequentially

### Phase 1: Foundation (Week 1-2)

```
1.1  Monorepo setup (Turborepo, workspaces, tsconfig)
1.2  packages/shared — all types + constants from above
1.3  apps/api — NestJS init, Prisma schema, migrate, PrismaModule
1.4  CRUD modules: Process, Step, Team, User (module + controller + service + dto)
1.5  apps/web — Vite + React + Tailwind + Router + AppShell + API client
1.6  Seed data: 5 teams, 10 users, 3 processes
1.7  docker-compose.yml (PostgreSQL + Redis)
```

Verify: `turbo dev` runs. CRUD works via Swagger. Frontend loads.

### Phase 2: Auth & Admin (Week 3-4)

```
2.1  Auth backend: JWT + refresh tokens + bcrypt + guards
2.2  RBAC: RolesGuard + PermissionsGuard + decorators
2.3  Auth frontend: AuthProvider + Login page + route guards
2.4  Admin Panel: Users, Teams, Roles, Settings pages
```

Verify: Login works. RBAC blocks unauthorized. Admin panel functional.

### Phase 3: Process Engine (Week 5-8)

```
3.1  State Machine: ProcessFSM + StepFSM + transition rules
3.2  Condition Parser: operators + evaluator + nested groups + tests
3.3  Dependency Resolver: DAG traversal + cycle detection
3.4  Process Executor: start + advance + completeStep + rejectStep
3.5  Step Handlers: Form, Approval, Condition, Task, Notification, Review
3.6  Execution API: all endpoints
3.7  WebSocket gateway: real-time execution events
```

Verify: Full execution cycle works. Branches resolve. Dependencies block. Loops work.

### Phase 4: Visual Builder & UI (Week 9-11)

```
4.1  Flow Builder: React Flow + custom nodes + palette + config panel
4.2  Condition Editor: visual rule builder + preview + tester
4.3  Form Designer: drag fields + configure + preview + FormRenderer
4.4  Execution UI: list + detail + step interaction + timeline + real-time
```

Verify: Build process visually. Execute through UI. Real-time updates work.

### Phase 5: Dispatch & Dashboards (Week 12-14)

```
5.1  Dispatch Engine: rule processor + data filter + digest + channels
5.2  Team Dashboard: inbox + received data + stats + export
5.3  Audit Trail: interceptor + viewer + export
5.4  Notifications: in-app + email + preferences
```

Verify: Data dispatches to teams. Team dashboard shows received data. Audit logs everything.

---

## Engine Interfaces

```typescript
interface IProcessExecutor {
  start(processId: string, userId: string): Promise<IExecution>;
  advance(executionId: string): Promise<void>;
  completeStep(executionId: string, stepId: string, data: Record<string, unknown>, userId: string): Promise<IStepExecution>;
  rejectStep(executionId: string, stepId: string, reason: string, userId: string, targetStepId?: string): Promise<void>;
  pause(executionId: string, userId: string): Promise<void>;
  resume(executionId: string, userId: string): Promise<void>;
  cancel(executionId: string, reason: string, userId: string): Promise<void>;
}

interface IStepHandler {
  readonly type: StepType;
  validate(step: IStep, data: Record<string, unknown>): ValidationResult;
  execute(context: IExecutionContext, step: IStep, data: Record<string, unknown>): Promise<StepResult>;
  onComplete(context: IExecutionContext, step: IStep): Promise<void>;
}

interface IConditionEvaluator {
  evaluate(condition: IConditionGroup, context: IExecutionContext): boolean;
  resolveField(fieldPath: string, context: IExecutionContext): unknown;
}

interface IDispatchEngine {
  dispatch(executionId: string, stepId: string): Promise<DispatchResult[]>;
}
```

---

## API Endpoints

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/logout
GET    /api/auth/me

GET    /api/processes
POST   /api/processes
GET    /api/processes/:id
PUT    /api/processes/:id
DELETE /api/processes/:id
POST   /api/processes/:id/publish
POST   /api/processes/:id/duplicate

GET    /api/processes/:pid/steps
POST   /api/processes/:pid/steps
PUT    /api/processes/:pid/steps/:sid
DELETE /api/processes/:pid/steps/:sid
PUT    /api/processes/:pid/steps/reorder
PUT    /api/processes/:pid/steps/bulk

POST   /api/executions
GET    /api/executions
GET    /api/executions/:id
POST   /api/executions/:id/steps/:sid/complete
POST   /api/executions/:id/steps/:sid/reject
POST   /api/executions/:id/pause
POST   /api/executions/:id/resume
POST   /api/executions/:id/cancel
GET    /api/executions/:id/history

GET    /api/teams
POST   /api/teams
GET    /api/teams/:id
PUT    /api/teams/:id
DELETE /api/teams/:id
GET    /api/teams/:id/inbox
GET    /api/teams/:id/received
GET    /api/teams/:id/stats

GET    /api/users
POST   /api/users
GET    /api/users/:id
PUT    /api/users/:id
DELETE /api/users/:id

GET    /api/audit
GET    /api/notifications
PUT    /api/notifications/:id/read
PUT    /api/notifications/read-all
```

---

## Environment

```env
DATABASE_URL=postgresql://uniqflow:uniqflow_dev@localhost:5432/uniqflow
REDIS_URL=redis://localhost:6379
JWT_SECRET=uniqflow-jwt-secret-change-in-production-min-32-chars
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
API_PORT=3001
API_PREFIX=/api
CORS_ORIGIN=http://localhost:5173
APP_NAME=Uniqflow
APP_URL=http://localhost:5173
```

## Docker Compose

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: uniqflow
      POSTGRES_USER: uniqflow
      POSTGRES_PASSWORD: uniqflow_dev
    ports: ["5432:5432"]
    volumes: [pgdata:/var/lib/postgresql/data]
  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
    volumes: [redisdata:/data]
volumes:
  pgdata:
  redisdata:
```

---

## Constraints

- ALL engine operations use database transactions
- ProcessExecutor.advance() MUST be idempotent
- Use SELECT FOR UPDATE on execution state mutations
- Validate ALL input with class-validator
- Rate limit auth (5/min), API (100/min/user)
- Paginate lists (default 20, max 100)
- Cache team/user in Redis (5min TTL)
- RTL support — use logical CSS properties
- Test coverage 80%+ on engine/
- Strict TypeScript — no `any`
- JSDoc on all public engine methods

---

## Start

Begin Phase 1, Step 1.1. Complete each step before the next. Run `turbo dev` after each step to verify.

**Project: Uniqflow (מיוחדים)**
**Package scope: @uniqflow/**
