import { useState } from "react";
import { AppShell } from "../../components/navigation/AppShell";

interface SettingsState {
  notifications: boolean;
  weeklySummary: boolean;
  compactTables: boolean;
}

const defaultSettings: SettingsState = { notifications: true, weeklySummary: true, compactTables: false };

function readSettings(): SettingsState {
  try {
    return { ...defaultSettings, ...JSON.parse(localStorage.getItem("buildpulse.settings") ?? "{}") } as SettingsState;
  } catch {
    return defaultSettings;
  }
}

export function SettingsPage() {
  const [settings, setSettings] = useState(readSettings);
  const [saved, setSaved] = useState(false);
  const update = (field: keyof SettingsState) => setSettings((current) => ({ ...current, [field]: !current[field] }));
  const save = () => {
    localStorage.setItem("buildpulse.settings", JSON.stringify(settings));
    setSaved(true);
  };

  return (
    <AppShell>
      <main className="page">
        <section className="page-title compact">
          <div><p className="eyebrow">WORKSPACE</p><h1>Settings</h1><p>Choose how BUILD//PULSE keeps you informed.</p></div>
        </section>
        <section className="card" style={{ maxWidth: 720 }}>
          <p className="eyebrow">NOTIFICATIONS AND DISPLAY</p>
          {(["notifications", "weeklySummary", "compactTables"] as const).map((field) => (
            <label className="check" key={field} style={{ display: "flex", justifyContent: "space-between", padding: "16px 0" }}>
              <span>{field === "notifications" ? "Project notifications" : field === "weeklySummary" ? "Weekly project summary" : "Compact data tables"}</span>
              <input type="checkbox" checked={settings[field]} onChange={() => update(field)} />
            </label>
          ))}
          {saved && <p role="status">Settings saved on this device.</p>}
          <button className="primary small" type="button" onClick={save}>SAVE SETTINGS</button>
        </section>
      </main>
    </AppShell>
  );
}
