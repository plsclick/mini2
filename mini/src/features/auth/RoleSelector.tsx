import { CalendarRange, HardHat, UserRound } from "lucide-react";
import type { UserRole } from "../../types/user";
const roles: [UserRole, typeof UserRound, string, string][] = [
  ["client", UserRound, "CLIENT", "Monitor your project and stay informed."],
  [
    "pm",
    CalendarRange,
    "PROJECT MANAGER",
    "Plan, manage and control the project.",
  ],
  [
    "cm",
    HardHat,
    "CONSTRUCTION MANAGER",
    "Execute work and report site progress.",
  ],
];
export function RoleSelector({
  value,
  onChange,
}: {
  value: UserRole;
  onChange: (role: UserRole) => void;
}) {
  return (
    <div className="role-cards">
      {roles.map(([role, Icon, title, description]) => (
        <button
          key={role}
          className={value === role ? "selected" : ""}
          onClick={() => onChange(role)}
        >
          <Icon />
          <b>{title}</b>
          <span>{description}</span>
        </button>
      ))}
    </div>
  );
}
