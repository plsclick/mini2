import { RotateCcw } from "lucide-react";
import { AppShell } from "../../components/navigation/AppShell";
import { useProjectSchedule } from "../../hooks/useProjectSchedule";

export function RecoveryCenterPage() {
  const { dashboard } = useProjectSchedule();
  const delayDays = dashboard?.statistics.activeDelayDays ?? 0;
  return <AppShell><main className="page"><section className="page-title compact"><div><p className="eyebrow">RECOVERY PLANNING · {dashboard?.project.name ?? "NO PROJECT"}</p><h1>Schedule recovery</h1><p>Recovery actions will be based on delays recorded for this project.</p></div><button className="primary small" type="button" disabled><RotateCcw size={14} /> APPLY PLAN</button></section><section className="card" style={{ maxWidth: 820 }}><p className="eyebrow">CURRENT STATUS</p><h2 className={delayDays ? "red" : ""} style={{ fontSize: 28, letterSpacing: -1, margin: "6px 0 4px" }}>{delayDays} DAYS ACTIVE IMPACT</h2><p className="sub">{delayDays ? "Create recovery strategies after reviewing the live schedule impact." : "No active delay impact has been recorded."}</p><div className="schedule-empty">No recovery plans have been added to this project yet.</div></section></main></AppShell>;
}
