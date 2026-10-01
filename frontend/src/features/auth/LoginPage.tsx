import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AuthLayout } from "../../layouts/AuthLayout";
import { useAuthStore } from "../../store/authStore";
import { useState } from "react";
export function LoginPage() {
  const authenticate = useAuthStore((s) => s.authenticate);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const enter = async (loginEmail: string, loginPassword: string) => {
    setError("");
    setIsSubmitting(true);
    try {
      const user = await authenticate(loginEmail, loginPassword);
      navigate(`/${user.role}/dashboard`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Sign in failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const demoAccounts = {
    client: "client@buildpulse.demo",
    pm: "pm@buildpulse.demo",
    cm: "cm@buildpulse.demo",
  } as const;

  return (
    <AuthLayout>
      <div className="auth-inner">
        <p className="eyebrow">SECURE PROJECT ACCESS</p>
        <h2>Welcome back.</h2>
        <p className="sub">Sign in to your construction control center.</p>
        <form onSubmit={(event) => { event.preventDefault(); void enter(email, password); }}>
          <label>
            EMAIL
            <input type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@company.com" />
          </label>
          <label>
            PASSWORD
            <input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" />
          </label>
          <div className="form-row">
            <label className="check">
              <input type="checkbox" />
              Remember me
            </label>
            <button type="button" onClick={() => navigate("/forgot-password")} className="link">
              Forgot password?
            </button>
          </div>
          {error && <p role="alert" style={{ color: "var(--red)" }}>{error}</p>}
          <button className="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "SIGNING IN..." : "SIGN IN"} <ArrowRight size={16} />
          </button>
        </form>
        <div className="or">
          <span />
          OR
          <span />
        </div>
        <button className="google">
          G <span>Continue with Google</span>
        </button>
        <div className="demo">
          <p>QUICK DEMO ACCESS</p>
          <div>
            <button type="button" onClick={() => void enter(demoAccounts.client, "Password123!")}>Client</button>
            <button type="button" onClick={() => void enter(demoAccounts.pm, "Password123!")}>Project Manager</button>
            <button type="button" onClick={() => void enter(demoAccounts.cm, "Password123!")}>Construction Manager</button>
          </div>
        </div>
        <p className="signup">
          Don't have an account?{" "}
          <button type="button" className="link" onClick={() => navigate("/signup")}>
            Create account
          </button>
        </p>
      </div>
    </AuthLayout>
  );
}
