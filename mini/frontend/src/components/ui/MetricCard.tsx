interface Props {
  label: string;
  value: string;
  detail?: string;
  tone?: "amber" | "danger" | "plain";
}
export function MetricCard({ label, value, detail, tone = "plain" }: Props) {
  return (
    <article className={`metric ${tone}`}>
      <p>{label}</p>
      <strong>{value}</strong>
      {detail && <span>{detail}</span>}
    </article>
  );
}
