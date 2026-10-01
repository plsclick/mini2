import { Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "../features/auth/LoginPage";
import { SignupPage } from "../features/auth/SignupPage";
import { ForgotPassword } from "../features/auth/ForgotPassword";
import { ClientDashboard } from "../features/client/ClientDashboard";
import { ClientProject } from "../features/client/ClientProject";
import { ClientTimeline } from "../features/client/ClientTimeline";
import { MilestonesPage } from "../features/client/MilestonesPage";
import { UpdatesPage } from "../features/client/UpdatesPage";
import { PMDashboard } from "../features/project-manager/PMDashboard";
import { ProjectBuilder } from "../features/project-manager/ProjectBuilder";
import { StagesPage } from "../features/project-manager/StagesPage";
import { TaskManager } from "../features/project-manager/TaskManager";
import { RiskCenterPage } from "../features/project-manager/RiskCenter";
import { RecoveryCenterPage } from "../features/project-manager/RecoveryCenter";
import { ResourcesPage } from "../features/project-manager/ResourcesPage";
import { ReportsPage } from "../features/project-manager/ReportsPage";
import { SimulationPage } from "../features/project-manager/SimulationPage";
import { ActivityPage as PMActivityPage } from "../features/project-manager/ActivityPage";
import { ScheduleWorkspace } from "../features/project-manager/ScheduleWorkspace";
import { CMDashboard } from "../features/construction-manager/CMDashboard";
import { MyTasks } from "../features/construction-manager/MyTasks";
import { DelayReport } from "../features/construction-manager/DelayReport";
import { RequirementReport } from "../features/construction-manager/RequirementReport";
import { SiteUpdates } from "../features/construction-manager/SiteUpdates";
import { ProgressPage } from "../features/construction-manager/ProgressPage";
import { ActivityPage as CMActivityPage } from "../features/construction-manager/ActivityPage";
import { NotificationsPage } from "../pages/shared/NotificationsPage";
import { WorkspacePlaceholder } from "../components/project/WorkspacePlaceholder";
import { ProtectedRoute } from "./ProtectedRoute";
import { useAuthStore } from "../store/authStore";
import { ProfilePage } from "../pages/shared/ProfilePage";
import { SettingsPage } from "../pages/shared/SettingsPage";

const Client = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute role="client">{children}</ProtectedRoute>
);
const PM = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute role="pm">{children}</ProtectedRoute>
);
const CM = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute role="cm">{children}</ProtectedRoute>
);

export function AppRoutes() {
  const user = useAuthStore((state) => state.user);

  return (
    <Routes>
      {/* ── Auth ── */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* ── Client ── */}
      <Route path="/client/dashboard" element={<Client><ClientDashboard /></Client>} />
      <Route path="/client/project" element={<Client><ClientProject /></Client>} />
      <Route path="/client/timeline" element={<Client><ClientTimeline /></Client>} />
      <Route path="/client/milestones" element={<Client><MilestonesPage /></Client>} />
      <Route path="/client/updates" element={<Client><UpdatesPage /></Client>} />
      <Route
        path="/client/documents"
        element={
          <Client>
            <WorkspacePlaceholder eyebrow="CLIENT WORKSPACE" title="Project documents" />
          </Client>
        }
      />
      <Route
        path="/client/*"
        element={
          <Client>
            <WorkspacePlaceholder eyebrow="CLIENT WORKSPACE" title="Project information" />
          </Client>
        }
      />

      {/* ── Project Manager ── */}
      <Route path="/pm/dashboard" element={<PM><PMDashboard /></PM>} />
      <Route path="/pm/projects" element={<PM><ProjectBuilder /></PM>} />
      <Route path="/pm/stages" element={<PM><StagesPage /></PM>} />
      <Route path="/pm/tasks" element={<PM><TaskManager /></PM>} />
      <Route path="/pm/risks" element={<PM><RiskCenterPage /></PM>} />
      <Route path="/pm/recovery" element={<PM><RecoveryCenterPage /></PM>} />
      <Route path="/pm/resources" element={<PM><ResourcesPage /></PM>} />
      <Route path="/pm/reports" element={<PM><ReportsPage /></PM>} />
      <Route path="/pm/simulation" element={<PM><SimulationPage /></PM>} />
      <Route path="/pm/activity" element={<PM><PMActivityPage /></PM>} />
      <Route path="/pm/timeline" element={<PM><ScheduleWorkspace mode="timeline" /></PM>} />
      <Route path="/pm/dependencies" element={<PM><ScheduleWorkspace mode="dependencies" /></PM>} />
      <Route path="/pm/critical-path" element={<PM><ScheduleWorkspace mode="critical-path" /></PM>} />
      <Route
        path="/pm/*"
        element={
          <PM>
            <WorkspacePlaceholder eyebrow="PROJECT MANAGEMENT" title="Project control workspace" />
          </PM>
        }
      />

      {/* ── Construction Manager ── */}
      <Route path="/cm/dashboard" element={<CM><CMDashboard /></CM>} />
      <Route path="/cm/tasks" element={<CM><MyTasks /></CM>} />
      <Route path="/cm/progress" element={<CM><ProgressPage /></CM>} />
      <Route path="/cm/report-delay" element={<CM><DelayReport /></CM>} />
      <Route path="/cm/requirements" element={<CM><RequirementReport /></CM>} />
      <Route path="/cm/updates" element={<CM><SiteUpdates /></CM>} />
      <Route path="/cm/activity" element={<CM><CMActivityPage /></CM>} />
      <Route path="/cm/timeline" element={<CM><ScheduleWorkspace mode="timeline" /></CM>} />
      <Route
        path="/cm/*"
        element={
          <CM>
            <WorkspacePlaceholder eyebrow="SITE OPERATIONS" title="Construction workspace" />
          </CM>
        }
      />

      {/* ── Shared ── */}
      <Route
        path="/notifications"
        element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>}
      />
      <Route
        path="/profile"
        element={<ProtectedRoute><ProfilePage /></ProtectedRoute>}
      />
      <Route
        path="/settings"
        element={<ProtectedRoute><SettingsPage /></ProtectedRoute>}
      />

      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />
      <Route path="*" element={<Navigate to={user ? `/${user.role}/dashboard` : "/login"} replace />} />
    </Routes>
  );
}
