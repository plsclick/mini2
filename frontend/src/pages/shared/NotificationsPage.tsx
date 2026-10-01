import { AppShell } from "../../components/navigation/AppShell";
import { NotificationCenter } from "../../components/notification/NotificationCenter";
export function NotificationsPage() {
  return (
    <AppShell>
      <main className="page">
        <section className="page-title">
          <div>
            <p className="eyebrow">ALL PROJECTS</p>
            <h1>Notifications</h1>
            <p>Signals that need your attention.</p>
          </div>
        </section>
        <NotificationCenter />
      </main>
    </AppShell>
  );
}
