import { useEffect, useState } from "react";
import { useActiveProject } from "../../hooks/useActiveProject";
import { projectDataService, type ApiActivity } from "../../services/projectDataService";

export function ActivityFeed(_props: { client?: boolean }) {
  const { project } = useActiveProject();
  const [items, setItems] = useState<ApiActivity[]>([]);
  useEffect(() => { if (project) void projectDataService.listActivity(project.id).then(setItems); else setItems([]); }, [project?.id]);
  return <div className="feed">{!items.length && <p className="schedule-empty">No project activity yet.</p>}{items.slice(0, 8).map((item) => <div key={item.id}><span>{new Date(item.createdAt).toLocaleDateString()}</span><i /><p>{item.description}</p></div>)}</div>;
}
