import type { ReactNode } from "react";
import { Brand } from "../components/ui/Brand";
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="auth">
      <aside className="auth-art">
        <Brand />
        <div className="art-copy">
          <p className="eyebrow">CONSTRUCTION INTELLIGENCE</p>
          <h1>
            Build with
            <br />
            <em>visibility.</em>
          </h1>
          <p>
            One project. One timeline.
            <br />
            Complete visibility.
          </p>
        </div>
        <div className="signal-row">
          <div>
            <small>PROJECT HEALTH</small>
            <strong>
              72<span>%</span>
            </strong>
            <div className="rail">
              <i style={{ width: "72%" }} />
            </div>
          </div>
          <div>
            <small>PROJECTED COMPLETION</small>
            <strong className="date">22 DEC</strong>
            <p className="low">
              <i /> LOW DELAY RISK
            </p>
          </div>
        </div>
        <div className="blueprint">
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
      </aside>
      <section className="auth-form">{children}</section>
    </main>
  );
}
