import { prisma } from "../src/config/database";
import { hashPassword } from "../src/utils/password";

const password = "Password123!";
const date = (daysFromNow: number) => {
  const value = new Date();
  value.setUTCDate(value.getUTCDate() + daysFromNow);
  return value;
};

interface DemoDelayInput {
  projectId: string;
  taskId: string;
  reportedById: string;
  notifyUserIds: string[];
  reason: string;
  description: string;
  delayDays: number;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

async function ensureDemoDelay(input: DemoDelayInput): Promise<void> {
  const existing = await prisma.delay.findFirst({
    where: { projectId: input.projectId, taskId: input.taskId, reason: input.reason },
    select: { id: true },
  });
  if (existing) return;

  const delay = await prisma.delay.create({
    data: {
      projectId: input.projectId,
      taskId: input.taskId,
      reportedById: input.reportedById,
      reason: input.reason,
      description: input.description,
      delayDays: input.delayDays,
      severity: input.severity,
      status: "OPEN",
    },
  });
  await prisma.activity.create({
    data: {
      projectId: input.projectId,
      userId: input.reportedById,
      action: "DELAY_REPORTED",
      entityType: "Delay",
      entityId: delay.id,
      description: `Seeded ${input.delayDays}-day delay: ${input.reason}`,
    },
  });
  await prisma.notification.createMany({
    data: input.notifyUserIds.map((userId) => ({
      projectId: input.projectId,
      userId,
      title: "Delay reported",
      message: `A ${input.severity.toLowerCase()} delay was reported: ${input.reason}`,
      type: "DELAY" as const,
    })),
  });
}

async function main(): Promise<void> {
  const passwordHash = await hashPassword(password);
  const organization = await prisma.organization.upsert({
    where: { id: "11111111-1111-4111-8111-111111111111" },
    update: { name: "BuildPulse Demo Organization" },
    create: { id: "11111111-1111-4111-8111-111111111111", name: "BuildPulse Demo Organization" },
  });

  const client = await prisma.user.upsert({
    where: { email: "client@buildpulse.demo" },
    update: { organizationId: organization.id, name: "Avery Client", role: "CLIENT", passwordHash, isActive: true },
    create: { organizationId: organization.id, name: "Avery Client", email: "client@buildpulse.demo", passwordHash, role: "CLIENT" },
  });
  const projectManager = await prisma.user.upsert({
    where: { email: "pm@buildpulse.demo" },
    update: { organizationId: organization.id, name: "Morgan Project Manager", role: "PROJECT_MANAGER", passwordHash, isActive: true },
    create: { organizationId: organization.id, name: "Morgan Project Manager", email: "pm@buildpulse.demo", passwordHash, role: "PROJECT_MANAGER" },
  });
  const constructionManager = await prisma.user.upsert({
    where: { email: "cm@buildpulse.demo" },
    update: { organizationId: organization.id, name: "Casey Construction Manager", role: "CONSTRUCTION_MANAGER", passwordHash, isActive: true },
    create: { organizationId: organization.id, name: "Casey Construction Manager", email: "cm@buildpulse.demo", passwordHash, role: "CONSTRUCTION_MANAGER" },
  });

  const priorProject = await prisma.project.findFirst({ where: { organizationId: organization.id, name: "Skyline Residency" }, select: { id: true } });
  if (priorProject) {
    const [survey, foundation, formwork, electrical, liftProcurement, liftInspection, finalStage] = await Promise.all([
      prisma.task.findFirst({ where: { projectId: priorProject.id, name: "Clear and survey plot" }, select: { id: true } }),
      prisma.task.findFirst({ where: { projectId: priorProject.id, name: "Pour raft foundation" }, select: { id: true } }),
      prisma.task.findFirst({ where: { projectId: priorProject.id, name: "Install level 3 formwork" }, select: { id: true } }),
      prisma.task.findFirst({ where: { projectId: priorProject.id, name: "First-fix electrical risers" }, select: { id: true } }),
      prisma.task.findFirst({ where: { projectId: priorProject.id, name: "Procure passenger lift package" }, select: { id: true } }),
      prisma.task.findFirst({ where: { projectId: priorProject.id, name: "Inspect lift equipment delivery" }, select: { id: true } }),
      prisma.stage.findFirst({ where: { projectId: priorProject.id, name: "Final Inspection" }, select: { id: true } }),
    ]);
    let handover = await prisma.task.findFirst({ where: { projectId: priorProject.id, name: "Final inspection and handover" }, select: { id: true } });
    if (!handover && finalStage) {
      handover = await prisma.task.create({
        data: {
          projectId: priorProject.id,
          stageId: finalStage.id,
          name: "Final inspection and handover",
          status: "TODO",
          priority: "HIGH",
          plannedStartDate: date(31),
          plannedEndDate: date(34),
          assignedToId: constructionManager.id,
        },
        select: { id: true },
      });
    }
    if (handover && formwork && electrical && liftInspection) {
      await prisma.taskDependency.createMany({
        data: [formwork.id, electrical.id, liftInspection.id].map((predecessorTaskId) => ({
          projectId: priorProject.id,
          predecessorTaskId,
          successorTaskId: handover.id,
          dependencyType: "FINISH_TO_START" as const,
          lagDays: 0,
        })),
        skipDuplicates: true,
      });
      await prisma.milestone.updateMany({
        where: { projectId: priorProject.id, name: "Practical completion", taskId: null },
        data: { taskId: handover.id },
      });
    }
    if (survey) await prisma.milestone.updateMany({ where: { projectId: priorProject.id, name: "Site handover", taskId: null }, data: { taskId: survey.id } });
    if (foundation) await prisma.milestone.updateMany({ where: { projectId: priorProject.id, name: "Foundation complete", taskId: null }, data: { taskId: foundation.id } });
    const notifyUserIds = [client.id, projectManager.id];
    if (formwork) {
      await ensureDemoDelay({
        projectId: priorProject.id,
        taskId: formwork.id,
        reportedById: constructionManager.id,
        notifyUserIds,
        reason: "Reinforcement delivery shortfall",
        description: "Partial reinforcement deliveries have held the formwork sequence.",
        delayDays: 4,
        severity: "HIGH",
      });
    }
    if (liftProcurement) {
      await ensureDemoDelay({
        projectId: priorProject.id,
        taskId: liftProcurement.id,
        reportedById: constructionManager.id,
        notifyUserIds,
        reason: "Lift component manufacturer backlog",
        description: "A supplier backlog is delaying the long-lead passenger lift package.",
        delayDays: 5,
        severity: "CRITICAL",
      });
    }
    console.log("Skyline Residency already exists; preserving project rows and ensuring missing delay/milestone demo links.");
    return;
  }

  const project = await prisma.project.create({
    data: {
      organizationId: organization.id,
      name: "Skyline Residency",
      description: "A 24-storey residential development with retail at street level.",
      location: "Pune, Maharashtra",
      clientId: client.id,
      projectManagerId: projectManager.id,
      status: "IN_PROGRESS",
      plannedStartDate: date(-70),
      plannedEndDate: date(260),
      actualStartDate: date(-68),
      progress: 31,
      members: { create: [
        { userId: client.id, projectRole: "CLIENT" },
        { userId: projectManager.id, projectRole: "PROJECT_MANAGER" },
        { userId: constructionManager.id, projectRole: "CONSTRUCTION_MANAGER" },
      ] },
    },
  });

  const stageNames = ["Site Preparation", "Foundation", "Structural Work", "Electrical & Plumbing", "Finishing", "Final Inspection"];
  const stages = [];
  for (const [order, name] of stageNames.entries()) {
    stages.push(await prisma.stage.create({
      data: {
        projectId: project.id,
        name,
        order,
        status: order < 2 ? "COMPLETED" : order === 2 ? "IN_PROGRESS" : "PLANNED",
        progress: order < 2 ? 100 : order === 2 ? 42 : 0,
        plannedStartDate: date(-65 + order * 42),
        plannedEndDate: date(-30 + order * 42),
        ...(order < 2 ? { actualStartDate: date(-64 + order * 42), actualEndDate: date(-31 + order * 42) } : {}),
      },
    }));
  }

  const tasks = await Promise.all([
    prisma.task.create({ data: { projectId: project.id, stageId: stages[0].id, name: "Clear and survey plot", status: "COMPLETED", progress: 100, priority: "HIGH", assignedToId: constructionManager.id, plannedStartDate: date(-65), plannedEndDate: date(-57), actualStartDate: date(-65), actualEndDate: date(-56) } }),
    prisma.task.create({ data: { projectId: project.id, stageId: stages[1].id, name: "Excavate foundation pits", status: "COMPLETED", progress: 100, priority: "CRITICAL", assignedToId: constructionManager.id, plannedStartDate: date(-55), plannedEndDate: date(-38), actualStartDate: date(-54), actualEndDate: date(-36) } }),
    prisma.task.create({ data: { projectId: project.id, stageId: stages[1].id, name: "Pour raft foundation", status: "COMPLETED", progress: 100, priority: "CRITICAL", assignedToId: constructionManager.id, plannedStartDate: date(-37), plannedEndDate: date(-25), actualStartDate: date(-35), actualEndDate: date(-22) } }),
    prisma.task.create({ data: { projectId: project.id, stageId: stages[2].id, name: "Reinforce and pour level 3", status: "IN_PROGRESS", progress: 68, priority: "HIGH", assignedToId: constructionManager.id, plannedStartDate: date(-5), plannedEndDate: date(14), actualStartDate: date(-4), estimatedHours: 320, actualHours: 218 } }),
    prisma.task.create({ data: { projectId: project.id, stageId: stages[2].id, name: "Install level 3 formwork", status: "BLOCKED", progress: 15, priority: "CRITICAL", assignedToId: constructionManager.id, plannedStartDate: date(2), plannedEndDate: date(20), estimatedHours: 180 } }),
    prisma.task.create({ data: { projectId: project.id, stageId: stages[3].id, name: "First-fix electrical risers", status: "TODO", progress: 0, priority: "MEDIUM", assignedToId: constructionManager.id, plannedStartDate: date(24), plannedEndDate: date(45), estimatedHours: 240 } }),
    prisma.task.create({ data: { projectId: project.id, stageId: stages[2].id, name: "Procure passenger lift package", status: "IN_PROGRESS", progress: 35, priority: "HIGH", assignedToId: constructionManager.id, plannedStartDate: date(1), plannedEndDate: date(27), estimatedHours: 24 } }),
    prisma.task.create({ data: { projectId: project.id, stageId: stages[2].id, name: "Inspect lift equipment delivery", status: "TODO", progress: 0, priority: "MEDIUM", assignedToId: constructionManager.id, plannedStartDate: date(28), plannedEndDate: date(30), estimatedHours: 12 } }),
    prisma.task.create({ data: { projectId: project.id, stageId: stages[5].id, name: "Final inspection and handover", status: "TODO", progress: 0, priority: "HIGH", assignedToId: constructionManager.id, plannedStartDate: date(31), plannedEndDate: date(34), estimatedHours: 40 } }),
  ]);

  await prisma.taskDependency.createMany({ data: [
    { projectId: project.id, predecessorTaskId: tasks[0].id, successorTaskId: tasks[1].id },
    { projectId: project.id, predecessorTaskId: tasks[1].id, successorTaskId: tasks[2].id },
    { projectId: project.id, predecessorTaskId: tasks[2].id, successorTaskId: tasks[3].id },
    { projectId: project.id, predecessorTaskId: tasks[3].id, successorTaskId: tasks[4].id, dependencyType: "START_TO_START", lagDays: 2 },
    { projectId: project.id, predecessorTaskId: tasks[2].id, successorTaskId: tasks[5].id },
    { projectId: project.id, predecessorTaskId: tasks[2].id, successorTaskId: tasks[6].id },
    { projectId: project.id, predecessorTaskId: tasks[6].id, successorTaskId: tasks[7].id },
    { projectId: project.id, predecessorTaskId: tasks[4].id, successorTaskId: tasks[8].id },
    { projectId: project.id, predecessorTaskId: tasks[5].id, successorTaskId: tasks[8].id },
    { projectId: project.id, predecessorTaskId: tasks[7].id, successorTaskId: tasks[8].id },
  ] });

  await prisma.milestone.createMany({ data: [
    { projectId: project.id, taskId: tasks[0].id, name: "Site handover", plannedDate: date(-60), actualDate: date(-60), status: "ACHIEVED" },
    { projectId: project.id, taskId: tasks[2].id, name: "Foundation complete", plannedDate: date(-25), actualDate: date(-22), status: "ACHIEVED" },
    { projectId: project.id, taskId: tasks[3].id, name: "Structure topped out", plannedDate: date(145), status: "PENDING" },
    { projectId: project.id, taskId: tasks[8].id, name: "Practical completion", plannedDate: date(260), status: "PENDING" },
  ] });

  await prisma.resource.createMany({ data: [
    { projectId: project.id, name: "Site crew A", type: "WORKFORCE", quantity: 28, unit: "workers", status: "AVAILABLE" },
    { projectId: project.id, name: "Tower crane 01", type: "EQUIPMENT", quantity: 1, unit: "unit", status: "IN_USE", cost: 1800 },
    { projectId: project.id, name: "Concrete subcontractor", type: "SUBCONTRACTOR", quantity: 1, unit: "crew", status: "AVAILABLE" },
  ] });
  await prisma.material.createMany({ data: [
    { projectId: project.id, name: "Reinforcement steel", quantityRequired: 85, quantityAvailable: 60, unit: "tonnes", status: "IN_TRANSIT", expectedDeliveryDate: date(4), supplier: "Western Steel Supply" },
    { projectId: project.id, name: "Ready-mix concrete M35", quantityRequired: 120, quantityAvailable: 35, unit: "m3", status: "ORDERED", expectedDeliveryDate: date(2), supplier: "Metro Concrete" },
    { projectId: project.id, name: "Formwork panels", quantityRequired: 240, quantityAvailable: 190, unit: "panels", status: "AVAILABLE", supplier: "BuildForm India" },
    { projectId: project.id, name: "Passenger lift package", quantityRequired: 1, quantityAvailable: 0, unit: "package", status: "ORDERED", expectedDeliveryDate: date(28), supplier: "Apex Vertical Transit" },
  ] });

  await ensureDemoDelay({
    projectId: project.id,
    taskId: tasks[4].id,
    reportedById: constructionManager.id,
    notifyUserIds: [client.id, projectManager.id],
    reason: "Reinforcement delivery shortfall",
    description: "The latest steel shipment arrived below the requested quantity, holding the next formwork sequence.",
    delayDays: 4,
    severity: "HIGH",
  });
  await ensureDemoDelay({
    projectId: project.id,
    taskId: tasks[6].id,
    reportedById: constructionManager.id,
    notifyUserIds: [client.id, projectManager.id],
    reason: "Lift component manufacturer backlog",
    description: "A supplier backlog is delaying the long-lead passenger lift package.",
    delayDays: 5,
    severity: "CRITICAL",
  });
  await prisma.risk.create({ data: { projectId: project.id, taskId: tasks[3].id, createdById: projectManager.id, title: "Monsoon rain may disrupt pours", description: "Extended heavy rain could reduce safe concrete-pour windows.", probability: 0.45, impact: 0.7, severity: "HIGH", status: "MONITORING", mitigation: "Maintain covered storage and schedule pours against daily weather windows." } });
  await prisma.recoveryPlan.create({ data: { projectId: project.id, createdById: projectManager.id, title: "Add evening reinforcement crew", reason: "Recover time lost to the partial steel delivery.", description: "An additional crew will prepare reinforcement outside the primary shift.", estimatedDaysRecovered: 2, status: "PROPOSED" } });
  await prisma.requirement.create({ data: { projectId: project.id, submittedById: constructionManager.id, title: "Additional reinforcement steel", description: "Request the remaining steel quantity for level 3 work.", type: "MATERIAL", quantity: 25, unit: "tonnes", priority: "HIGH", requiredBy: date(3), status: "PENDING" } });
  await prisma.siteUpdate.createMany({ data: [
    { projectId: project.id, submittedById: constructionManager.id, title: "Level 3 columns progressing", description: "Column reinforcement is underway on the east wing; inspections are booked for Thursday.", progress: 31 },
    { projectId: project.id, submittedById: constructionManager.id, title: "Steel delivery issue", description: "Partial reinforcement delivery received; short quantity logged with supplier.", progress: 31, issue: "Remaining steel delivery is required before formwork can proceed." },
  ] });
  await prisma.notification.createMany({ data: [
    { userId: projectManager.id, projectId: project.id, title: "Delay reported", message: "A high severity reinforcement delivery delay needs review.", type: "DELAY" },
    { userId: client.id, projectId: project.id, title: "Project progress updated", message: "Skyline Residency has reached 31% progress.", type: "INFO" },
    { userId: constructionManager.id, projectId: project.id, title: "Task assigned", message: "You are assigned to Reinforce and pour level 3.", type: "TASK" },
  ] });
  await prisma.activity.createMany({ data: [
    { projectId: project.id, userId: projectManager.id, action: "PROJECT_CREATED", entityType: "Project", entityId: project.id, description: "Skyline Residency project created" },
    { projectId: project.id, userId: constructionManager.id, action: "TASK_COMPLETED", entityType: "Task", entityId: tasks[2].id, description: "Raft foundation pour completed" },
    { projectId: project.id, userId: constructionManager.id, action: "DELAY_REPORTED", entityType: "Delay", description: "Reinforcement delivery delay reported" },
    { projectId: project.id, userId: constructionManager.id, action: "REQUIREMENT_SUBMITTED", entityType: "Requirement", description: "Additional reinforcement steel requested" },
  ] });

  console.log("Demo data seeded. Demo password: Password123!");
}

main()
  .catch((error: unknown) => {
    console.error("Seed failed", error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
