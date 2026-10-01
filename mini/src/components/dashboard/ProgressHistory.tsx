import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
const history = [
  { week: "W1", planned: 42, actual: 40 },
  { week: "W2", planned: 50, actual: 48 },
  { week: "W3", planned: 58, actual: 54 },
  { week: "W4", planned: 65, actual: 61 },
  { week: "W5", planned: 70, actual: 66 },
  { week: "W6", planned: 76, actual: 72 },
];
export function ProgressHistory() {
  return (
    <section className="card progress-history">
      <div className="card-head">
        <div>
          <p className="eyebrow">PROGRESS HISTORY</p>
          <h2>Planned vs actual</h2>
        </div>
        <span>
          <b>PLANNED 76%</b>
          <b className="amber-text">ACTUAL 72%</b>
        </span>
      </div>
      <div className="progress-chart">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={history}>
            <defs>
              <linearGradient id="actual" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#f5b942" stopOpacity={0.32} />
                <stop offset="100%" stopColor="#f5b942" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="week"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#66707d", fontSize: 9 }}
            />
            <Tooltip
              contentStyle={{
                background: "#1a1f27",
                border: "1px solid #262c35",
                fontSize: 11,
              }}
            />
            <Area
              dataKey="planned"
              stroke="#66707d"
              strokeDasharray="4 4"
              fill="none"
            />
            <Area
              dataKey="actual"
              stroke="#f5b942"
              strokeWidth={2}
              fill="url(#actual)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
