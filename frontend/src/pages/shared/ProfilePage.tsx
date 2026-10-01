import { useEffect, useState } from "react";
import { AppShell } from "../../components/navigation/AppShell";
import { api } from "../../services/api";
import { useAuthStore } from "../../store/authStore";

interface ProfileResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl: string | null;
  organization: { name: string };
}

export function ProfilePage() {
  const storedUser = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [name, setName] = useState(storedUser?.name ?? "");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void api.get<ProfileResponse>("/auth/me")
      .then((result) => {
        setProfile(result);
        setName(result.name);
        setAvatarUrl(result.avatarUrl ?? "");
      })
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "Could not load your profile."));
  }, []);

  const save = async () => {
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const result = await api.put<ProfileResponse>("/auth/me", { name, avatarUrl: avatarUrl || null });
      setProfile(result);
      const updatedUser = { ...storedUser!, name: result.name, initials: result.name.split(/\s+/).slice(0, 2).map((part) => part[0] ?? "").join("").toUpperCase() };
      localStorage.setItem("buildpulse.user", JSON.stringify(updatedUser));
      updateUser(updatedUser);
      setMessage("Profile updated.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not update your profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <main className="page">
        <section className="page-title compact">
          <div><p className="eyebrow">ACCOUNT</p><h1>Your profile</h1><p>Manage the identity connected to your workspace.</p></div>
        </section>
        <section className="card" style={{ maxWidth: 720 }}>
          <p className="eyebrow">PROFILE DETAILS</p>
          <div className="twocol">
            <label>FULL NAME<input value={name} onChange={(event) => setName(event.target.value)} /></label>
            <label>EMAIL<input value={profile?.email ?? ""} readOnly /></label>
            <label>ROLE<input value={profile?.role ?? ""} readOnly /></label>
            <label>ORGANIZATION<input value={profile?.organization.name ?? ""} readOnly /></label>
          </div>
          <label>AVATAR URL <small>OPTIONAL</small><input value={avatarUrl} onChange={(event) => setAvatarUrl(event.target.value)} placeholder="https://..." /></label>
          {message && <p role="status">{message}</p>}
          {error && <p role="alert" style={{ color: "var(--red)" }}>{error}</p>}
          <button className="primary small" type="button" onClick={() => void save()} disabled={saving}>{saving ? "SAVING..." : "SAVE PROFILE"}</button>
        </section>
      </main>
    </AppShell>
  );
}
