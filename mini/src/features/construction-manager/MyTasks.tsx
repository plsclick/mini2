import { WorkspacePlaceholder } from "../../components/project/WorkspacePlaceholder";
import { activeTasks } from "../../mock/tasks";
export function MyTasks() {
  return (
    <WorkspacePlaceholder eyebrow="MY SITE TASKS" title="My tasks">
      <section className="card task-list">
        {activeTasks.map((task) => (
          <div key={task.id}>
            <b>{task.name}</b>
            <span>{task.stage}</span>
            <span>{task.progress}% complete</span>
            <button className="link">UPDATE</button>
          </div>
        ))}
      </section>
    </WorkspacePlaceholder>
  );
}
