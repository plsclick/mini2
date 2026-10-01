import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthLayout } from "../../layouts/AuthLayout";
import { useAuthStore } from "../../store/authStore";
import type { UserRole } from "../../types/user";
import { RoleSelector } from "./RoleSelector";
export function SignupPage() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<UserRole>("client");
  const register = useAuthStore((s) => s.register);
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", organizationName: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const update = (field: keyof typeof form, value: string) => setForm((current) => ({ ...current, [field]: value }));
  const next = async () => {
    setError("");
    if (step === 1) {
      if (!form.name || !form.email || !form.password || !form.confirmPassword) return setError("Complete all account fields.");
      if (form.password !== form.confirmPassword) return setError("Passwords do not match.");
      if (form.password.length < 8 || !/[A-Z]/.test(form.password) || !/[0-9]/.test(form.password)) return setError("Password needs 8 characters, one uppercase letter, and one number.");
    }
    if (step < 3) return setStep(step + 1);
    if (!form.organizationName) return setError("Enter your organization name.");
    setIsSubmitting(true);
    try {
      const user = await register({ name: form.name, email: form.email, password: form.password, organizationName: form.organizationName, role: role === "client" ? "CLIENT" : role === "pm" ? "PROJECT_MANAGER" : "CONSTRUCTION_MANAGER" });
      navigate(`/${user.role}/dashboard`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not create account.");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <AuthLayout>
      <div className="auth-inner">
        <p className="eyebrow">CREATE ACCOUNT · {step}/3</p>
        {step === 1 && (
          <>
            <h2>Set up your account.</h2>
            <p className="sub">Start with a secure project workspace.</p>
            <label>
              FULL NAME
              <input value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="Your name" />
            </label>
            <label>
              EMAIL
              <input type="email" value={form.email} onChange={(event) => update("email", event.target.value)} placeholder="name@company.com" />
            </label>
            <label>
              PASSWORD
              <input type="password" value={form.password} onChange={(event) => update("password", event.target.value)} placeholder="Create password" />
            </label>
            <label>
              CONFIRM PASSWORD
              <input type="password" value={form.confirmPassword} onChange={(event) => update("confirmPassword", event.target.value)} placeholder="Confirm password" />
            </label>
          </>
        )}
        {step === 2 && (
          <>
            <h2>What is your role?</h2>
            <p className="sub">
              Your workspace will be tailored to how you work.
            </p>
            <RoleSelector value={role} onChange={setRole} />
          </>
        )}
        {step === 3 && (
          <>
            <h2>Project information.</h2>
            <p className="sub">
              Add the essentials. You can complete this later.
            </p>
            <label>
              ORGANIZATION NAME
              <input value={form.organizationName} onChange={(event) => update("organizationName", event.target.value)} placeholder="Company or organization" />
            </label>
            <label>
              PHONE
              <input placeholder="+91 00000 00000" />
            </label>
            <label>
              PROJECT CODE <small>OPTIONAL</small>
              <input placeholder="SKY-2026" />
            </label>
          </>
        )}
        {error && <p role="alert" style={{ color: "var(--red)" }}>{error}</p>}
        <div className="form-row">
          <button
            className="link"
            onClick={() =>
              step === 1 ? navigate("/login") : setStep(step - 1)
            }
          >
            <ArrowLeft size={14} /> BACK
          </button>
          <button className="primary small" onClick={() => void next()} disabled={isSubmitting}>
            {isSubmitting ? "CREATING..." : step === 3 ? "CREATE ACCOUNT" : "CONTINUE"}{" "}
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}
