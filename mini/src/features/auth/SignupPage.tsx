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
  const signIn = useAuthStore((s) => s.signIn);
  const navigate = useNavigate();
  const next = () =>
    step === 3
      ? (signIn(role), navigate(`/${role}/dashboard`))
      : setStep(step + 1);
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
              <input placeholder="Your name" />
            </label>
            <label>
              EMAIL
              <input placeholder="name@company.com" />
            </label>
            <label>
              PASSWORD
              <input type="password" placeholder="Create password" />
            </label>
            <label>
              CONFIRM PASSWORD
              <input type="password" placeholder="Confirm password" />
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
              <input placeholder="Company or organization" />
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
        <div className="form-row">
          <button
            className="link"
            onClick={() =>
              step === 1 ? navigate("/login") : setStep(step - 1)
            }
          >
            <ArrowLeft size={14} /> BACK
          </button>
          <button className="primary small" onClick={next}>
            {step === 3 ? "CREATE ACCOUNT" : "CONTINUE"}{" "}
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}
