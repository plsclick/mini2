ALTER TABLE "milestones" ADD COLUMN "taskId" TEXT;

CREATE INDEX "milestones_taskId_idx" ON "milestones"("taskId");

ALTER TABLE "milestones"
ADD CONSTRAINT "milestones_taskId_fkey"
FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;