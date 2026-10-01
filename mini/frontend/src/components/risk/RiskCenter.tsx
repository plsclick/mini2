import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useActiveProject } from "../../hooks/useActiveProject";
import { projectDataService, type ApiRisk } from "../../services/projectDataService";

export function RiskCenter() {
  const navigate = useNavigate();
  const { project } = useActiveProject();
  const [risks, setRisks] = useState<ApiRisk[]>([]);
  useEffect(() => { if (project) void projectDataService.listRisks(project.id).then(setRisks); else setRisks([]); }, [project?.id]);
  return <section className="card risk"><div className="card-head"><div><p className="eyebrow">RISK CENTER</p><h2>Priority risks</h2></div><button className="link" type="button" onClick={() => navigate("/pm/risks")}>VIEW ALL</button></div>{!risks.length && <p className="schedule-empty">No risks have been added to this project.</p>}{risks.slice(0, 5).map((risk) => <button className="risk-item" type="button" key={risk.id} onClick={() => navigate("/pm/risks")}><i className={risk.severity.toLowerCase()}>{risk.severity}</i><span><b>{risk.title}</b><small>{risk.description ?? `${risk.status} · impact ${risk.impact}`}</small></span><ChevronRight size={16} /></button>)}</section>;
}
