import {
  Activity,
  Bell,
  Box,
  Building2,
  CalendarRange,
  CheckSquare,
  FileText,
  Flag,
  GitBranch,
  LayoutDashboard,
  RotateCcw,
  ShieldAlert,
  Sliders,
  Layers,
} from "lucide-react";
import type { UserRole } from "../../types/user";

export type NavigationItem = {
  label: string;
  path: string;
  icon: typeof LayoutDashboard;
};
const item = (
  label: string,
  path: string,
  icon: typeof LayoutDashboard,
): NavigationItem => ({ label, path, icon });

export const navigation: Record<UserRole, NavigationItem[]> = {
  client: [
    item("Overview", "/client/dashboard", LayoutDashboard),
    item("Project", "/client/project", Building2),
    item("Timeline", "/client/timeline", CalendarRange),
    item("Milestones", "/client/milestones", Flag),
    item("Updates", "/client/updates", Bell),
    item("Documents", "/client/documents", FileText),
    item("Notifications", "/notifications", Bell),
  ],
  pm: [
    item("Overview", "/pm/dashboard", LayoutDashboard),
    item("Projects", "/pm/projects", Building2),
    item("Stages", "/pm/stages", Layers),
    item("Timeline", "/pm/timeline", CalendarRange),
    item("Tasks", "/pm/tasks", CheckSquare),
    item("Dependencies", "/pm/dependencies", GitBranch),
    item("Critical Path", "/pm/critical-path", GitBranch),
    item("Resources", "/pm/resources", Box),
    item("Risks", "/pm/risks", ShieldAlert),
    item("Recovery", "/pm/recovery", RotateCcw),
    item("Simulation", "/pm/simulation", Sliders),
    item("Activity", "/pm/activity", Activity),
    item("Reports", "/pm/reports", FileText),
  ],
  cm: [
    item("Overview", "/cm/dashboard", LayoutDashboard),
    item("My Tasks", "/cm/tasks", CheckSquare),
    item("Update Progress", "/cm/progress", Activity),
    item("Timeline", "/cm/timeline", CalendarRange),
    item("Site Updates", "/cm/updates", Bell),
    item("Report Delay", "/cm/report-delay", ShieldAlert),
    item("Requirements", "/cm/requirements", Box),
    item("Activity", "/cm/activity", Activity),
    item("Notifications", "/notifications", Bell),
  ],
};
