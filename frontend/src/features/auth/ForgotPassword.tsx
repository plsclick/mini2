import { ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AuthLayout } from "../../layouts/AuthLayout";
export function ForgotPassword() {
  const navigate = useNavigate();
  return (
    <AuthLayout>
      <div className="auth-inner">
        <p className="eyebrow">ACCOUNT RECOVERY</p>
        <h2>Reset your password.</h2>
        <p className="sub">
          We’ll send a secure reset link to your work email.
        </p>
        <label>
          EMAIL
          <input type="email" placeholder="name@company.com" />
        </label>
        <button className="primary">
          SEND RESET LINK <ArrowRight size={16} />
        </button>
        <button className="link back-link" onClick={() => navigate("/login")}>
          <ArrowLeft size={14} /> RETURN TO SIGN IN
        </button>
      </div>
    </AuthLayout>
  );
}
