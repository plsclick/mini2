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
        <button className="google" type="button" onClick={() => setError("Google sign-in is not configured for this workspace yet.")}>
          G <span>Continue with Google</span>
        </button>
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
