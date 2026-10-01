const reports = [
  "Project Progress",
  "Schedule Variance",
  "Delay Report",
  "Risk Report",
  "Resource Utilization",
  "Recovery Report",
];
export function ReportGrid() {
  return (
    <section className="card report-grid">
      <div className="card-head">
        <div>
          <p className="eyebrow">REPORTING</p>
          <h2>Project intelligence reports</h2>
        </div>
        <button className="outline">EXPORT CSV</button>
      </div>
      {reports.map((report) => (
        <button key={report}>
          <span>REPORT</span>
          <b>{report}</b>
          <small>Updated today · Export</small>
        </button>
      ))}
    </section>
  );
}
