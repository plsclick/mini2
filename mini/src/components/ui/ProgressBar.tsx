export function ProgressBar({ name, value }: { name: string; value: number }) {
  return (
    <div className="bar">
      <span>{name}</span>
      <div>
        <i style={{ width: `${value}%` }} />
      </div>
      <b>{value}%</b>
    </div>
  );
}
