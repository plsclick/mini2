CREATE TYPE "Role" AS ENUM ('CLIENT', 'PROJECT_MANAGER', 'CONSTRUCTION_MANAGER');
CREATE TYPE "ProjectStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED');
CREATE TYPE "StageStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED');
CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED', 'CANCELLED');
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE "DependencyType" AS ENUM ('FINISH_TO_START', 'START_TO_START', 'FINISH_TO_FINISH', 'START_TO_FINISH');
CREATE TYPE "ResourceType" AS ENUM ('WORKFORCE', 'EQUIPMENT', 'SUBCONTRACTOR', 'OTHER');
CREATE TYPE "MaterialStatus" AS ENUM ('REQUIRED', 'ORDERED', 'IN_TRANSIT', 'AVAILABLE', 'DELAYED', 'CANCELLED');
CREATE TYPE "MilestoneStatus" AS ENUM ('PENDING', 'ACHIEVED', 'MISSED', 'CANCELLED');
CREATE TYPE "DelaySeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE "DelayStatus" AS ENUM ('OPEN', 'INVESTIGATING', 'RESOLVED');
CREATE TYPE "RiskSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE "RiskStatus" AS ENUM ('OPEN', 'MONITORING', 'MITIGATED', 'CLOSED');
CREATE TYPE "RecoveryPlanStatus" AS ENUM ('PROPOSED', 'APPROVED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED');
CREATE TYPE "RequirementType" AS ENUM ('MATERIAL', 'WORKFORCE', 'EQUIPMENT', 'OTHER');
CREATE TYPE "RequirementPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE "RequirementStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'FULFILLED');
CREATE TYPE "NotificationType" AS ENUM ('INFO', 'WARNING', 'DELAY', 'RISK', 'TASK', 'REQUIREMENT', 'MILESTONE', 'SYSTEM');

CREATE TABLE "organizations" (
  "id" TEXT NOT NULL, "name" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "users" (
  "id" TEXT NOT NULL, "organizationId" TEXT NOT NULL, "name" TEXT NOT NULL, "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL, "role" "Role" NOT NULL, "avatarUrl" TEXT, "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "projects" (
  "id" TEXT NOT NULL, "organizationId" TEXT NOT NULL, "name" TEXT NOT NULL, "description" TEXT, "location" TEXT,
  "clientId" TEXT, "projectManagerId" TEXT, "status" "ProjectStatus" NOT NULL DEFAULT 'PLANNED',
  "plannedStartDate" TIMESTAMP(3), "plannedEndDate" TIMESTAMP(3), "actualStartDate" TIMESTAMP(3), "actualEndDate" TIMESTAMP(3),
  "progress" DOUBLE PRECISION NOT NULL DEFAULT 0, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "projects_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "projects_progress_check" CHECK ("progress" >= 0 AND "progress" <= 100)
);
CREATE TABLE "project_members" (
  "id" TEXT NOT NULL, "projectId" TEXT NOT NULL, "userId" TEXT NOT NULL, "projectRole" "Role" NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "project_members_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "stages" (
  "id" TEXT NOT NULL, "projectId" TEXT NOT NULL, "name" TEXT NOT NULL, "description" TEXT, "order" INTEGER NOT NULL DEFAULT 0,
  "status" "StageStatus" NOT NULL DEFAULT 'PLANNED', "plannedStartDate" TIMESTAMP(3), "plannedEndDate" TIMESTAMP(3),
  "actualStartDate" TIMESTAMP(3), "actualEndDate" TIMESTAMP(3), "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "stages_pkey" PRIMARY KEY ("id"), CONSTRAINT "stages_progress_check" CHECK ("progress" >= 0 AND "progress" <= 100)
);
CREATE TABLE "tasks" (
  "id" TEXT NOT NULL, "projectId" TEXT NOT NULL, "stageId" TEXT, "name" TEXT NOT NULL, "description" TEXT,
  "status" "TaskStatus" NOT NULL DEFAULT 'TODO', "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
  "progress" DOUBLE PRECISION NOT NULL DEFAULT 0, "plannedStartDate" TIMESTAMP(3), "plannedEndDate" TIMESTAMP(3),
  "actualStartDate" TIMESTAMP(3), "actualEndDate" TIMESTAMP(3), "estimatedHours" DOUBLE PRECISION, "actualHours" DOUBLE PRECISION,
  "assignedToId" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "tasks_pkey" PRIMARY KEY ("id"), CONSTRAINT "tasks_progress_check" CHECK ("progress" >= 0 AND "progress" <= 100)
);
CREATE TABLE "task_dependencies" (
  "id" TEXT NOT NULL, "projectId" TEXT NOT NULL, "predecessorTaskId" TEXT NOT NULL, "successorTaskId" TEXT NOT NULL,
  "dependencyType" "DependencyType" NOT NULL DEFAULT 'FINISH_TO_START', "lagDays" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "task_dependencies_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "task_dependencies_no_self_check" CHECK ("predecessorTaskId" <> "successorTaskId")
);
CREATE TABLE "resources" (
  "id" TEXT NOT NULL, "projectId" TEXT NOT NULL, "name" TEXT NOT NULL, "type" "ResourceType" NOT NULL,
  "quantity" DOUBLE PRECISION NOT NULL DEFAULT 0, "unit" TEXT, "status" TEXT NOT NULL DEFAULT 'AVAILABLE', "cost" DOUBLE PRECISION,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "resources_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "materials" (
  "id" TEXT NOT NULL, "projectId" TEXT NOT NULL, "name" TEXT NOT NULL, "quantityRequired" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "quantityAvailable" DOUBLE PRECISION NOT NULL DEFAULT 0, "unit" TEXT, "status" "MaterialStatus" NOT NULL DEFAULT 'REQUIRED',
  "expectedDeliveryDate" TIMESTAMP(3), "supplier" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "materials_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "milestones" (
  "id" TEXT NOT NULL, "projectId" TEXT NOT NULL, "name" TEXT NOT NULL, "description" TEXT, "plannedDate" TIMESTAMP(3),
  "actualDate" TIMESTAMP(3), "status" "MilestoneStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "milestones_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "delays" (
  "id" TEXT NOT NULL, "projectId" TEXT NOT NULL, "taskId" TEXT, "reportedById" TEXT NOT NULL, "reason" TEXT NOT NULL,
  "description" TEXT, "delayDays" INTEGER NOT NULL, "severity" "DelaySeverity" NOT NULL DEFAULT 'MEDIUM',
  "status" "DelayStatus" NOT NULL DEFAULT 'OPEN', "reportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "resolvedAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "delays_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "risks" (
  "id" TEXT NOT NULL, "projectId" TEXT NOT NULL, "taskId" TEXT, "createdById" TEXT NOT NULL, "title" TEXT NOT NULL,
  "description" TEXT, "probability" DOUBLE PRECISION NOT NULL DEFAULT 0.5, "impact" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
  "severity" "RiskSeverity" NOT NULL DEFAULT 'MEDIUM', "status" "RiskStatus" NOT NULL DEFAULT 'OPEN', "mitigation" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "risks_pkey" PRIMARY KEY ("id"), CONSTRAINT "risks_probability_check" CHECK ("probability" BETWEEN 0 AND 1),
  CONSTRAINT "risks_impact_check" CHECK ("impact" BETWEEN 0 AND 1)
);
CREATE TABLE "recovery_plans" (
  "id" TEXT NOT NULL, "projectId" TEXT NOT NULL, "createdById" TEXT NOT NULL, "title" TEXT NOT NULL, "description" TEXT,
  "reason" TEXT, "status" "RecoveryPlanStatus" NOT NULL DEFAULT 'PROPOSED', "estimatedDaysRecovered" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "recovery_plans_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "requirements" (
  "id" TEXT NOT NULL, "projectId" TEXT NOT NULL, "submittedById" TEXT NOT NULL, "title" TEXT NOT NULL, "description" TEXT,
  "type" "RequirementType" NOT NULL, "quantity" DOUBLE PRECISION, "unit" TEXT, "priority" "RequirementPriority" NOT NULL DEFAULT 'MEDIUM',
  "status" "RequirementStatus" NOT NULL DEFAULT 'PENDING', "requiredBy" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "requirements_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "site_updates" (
  "id" TEXT NOT NULL, "projectId" TEXT NOT NULL, "submittedById" TEXT NOT NULL, "title" TEXT NOT NULL, "description" TEXT,
  "progress" DOUBLE PRECISION, "issue" TEXT, "photoUrls" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "site_updates_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "notifications" (
  "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "projectId" TEXT, "title" TEXT NOT NULL, "message" TEXT NOT NULL,
  "type" "NotificationType" NOT NULL DEFAULT 'INFO', "isRead" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "activities" (
  "id" TEXT NOT NULL, "projectId" TEXT, "userId" TEXT NOT NULL, "action" TEXT NOT NULL, "entityType" TEXT NOT NULL,
  "entityId" TEXT, "description" TEXT NOT NULL, "metadata" JSONB, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "project_members_projectId_userId_key" ON "project_members"("projectId", "userId");
CREATE UNIQUE INDEX "task_dependencies_predecessorTaskId_successorTaskId_key" ON "task_dependencies"("predecessorTaskId", "successorTaskId");

ALTER TABLE "users" ADD CONSTRAINT "users_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "projects" ADD CONSTRAINT "projects_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "projects" ADD CONSTRAINT "projects_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "projects" ADD CONSTRAINT "projects_projectManagerId_fkey" FOREIGN KEY ("projectManagerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "stages" ADD CONSTRAINT "stages_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "stages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "task_dependencies" ADD CONSTRAINT "task_dependencies_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "task_dependencies" ADD CONSTRAINT "task_dependencies_predecessorTaskId_fkey" FOREIGN KEY ("predecessorTaskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "task_dependencies" ADD CONSTRAINT "task_dependencies_successorTaskId_fkey" FOREIGN KEY ("successorTaskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "resources" ADD CONSTRAINT "resources_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "materials" ADD CONSTRAINT "materials_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "delays" ADD CONSTRAINT "delays_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "delays" ADD CONSTRAINT "delays_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "delays" ADD CONSTRAINT "delays_reportedById_fkey" FOREIGN KEY ("reportedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "risks" ADD CONSTRAINT "risks_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "risks" ADD CONSTRAINT "risks_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "risks" ADD CONSTRAINT "risks_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "recovery_plans" ADD CONSTRAINT "recovery_plans_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "recovery_plans" ADD CONSTRAINT "recovery_plans_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "requirements" ADD CONSTRAINT "requirements_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "requirements" ADD CONSTRAINT "requirements_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "site_updates" ADD CONSTRAINT "site_updates_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "site_updates" ADD CONSTRAINT "site_updates_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "activities" ADD CONSTRAINT "activities_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "activities" ADD CONSTRAINT "activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
