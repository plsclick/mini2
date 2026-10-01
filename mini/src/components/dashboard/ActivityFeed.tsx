const clientUpdates = [
  ["Today", "Structure progress updated to 78%"],
  ["Yesterday", "Electrical installation started"],
  ["Yesterday", "Steel delivery delay reported"],
  ["2 days ago", "Foundation completed"],
];
const teamUpdates = [
  ["10:32", "Construction Manager updated Structure to 78%"],
  ["10:35", "System recalculated project completion"],
  ["10:38", "Project Manager approved recovery plan"],
  ["10:40", "System client notified"],
];
export function ActivityFeed({ client = false }: { client?: boolean }) {
  return (
    <div className="feed">
      {(client ? clientUpdates : teamUpdates).map(([time, description]) => (
        <div key={`${time}-${description}`}>
          <span>{time}</span>
          <i />
          <p>{description}</p>
        </div>
      ))}
    </div>
  );
}
