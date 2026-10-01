import { useState } from "react";
const reports = [
  "Project Progress",
  "Schedule Variance",
  "Delay Report",
  "Risk Report",
  "Resource Utilization",
  "Recovery Report",
];
export function ReportGrid() {
  const [selected, setSelected] = useState<string | null>(null);
  const exportReport = (report: string) => {
    const contents = `Report,Value\n${report},Requested from BUILD//PULSE\n`;
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([contents], { type: "text/csv" }));
    link.download = `${report.toLowerCase().replace(/\s+/g, "-")}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    setSelected(report);
  };
  return (
    <section className="card report-grid">
      <div className="card-head">
        <div>
          <p className="eyebrow">REPORTING</p>
          <h2>Project intelligence reports</h2>
        </div>
        <button className="outline" type="button" onClick={() => exportReport("Project Progress")}>EXPORT CSV</button>
      </div>
      {reports.map((report) => (
        <button key={report} type="button" onClick={() => exportReport(report)}>
          <span>REPORT</span>
          <b>{report}</b>
          <small>Updated today · Export</small>
        </button>
      ))}
      {selected && <p role="status" style={{ color: "var(--green)", fontSize: 11 }}>Exported {selected}.</p>}
    </section>
  );
}
