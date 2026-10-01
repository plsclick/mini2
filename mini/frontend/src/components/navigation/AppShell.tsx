import type { ReactNode } from "react";
import {
  Bell,
  Building2,
  ChevronDown,
  HelpCircle,
  LogOut,
  Menu,
  Search,
  Settings,
  UserRound,
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Brand } from "../ui/Brand";
import { navigation } from "./navigationConfig";
import { useAuthStore } from "../../store/authStore";
import { useUIStore } from "../../store/uiStore";
import { api } from "../../services/api";
import { useEffect, useState } from "react";

const roleLabel = {
  client: "CLIENT",
  pm: "PROJECT MANAGER",
  cm: "CONSTRUCTION MANAGER",
};

export function AppShell({ children }: { children: ReactNode }) {
  const user = useAuthStore((state) => state.user)!;
  const signOut = useAuthStore((state) => state.signOut);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { searchOpen, sidebarOpen, setSearchOpen, toggleSidebar } =
    useUIStore();
  const items = navigation[user.role];
  const [activeProjectName, setActiveProjectName] = useState("No project selected");
  useEffect(() => {
    void api.get<Array<{ id: string; name: string }>>("/projects")
      .then((projects) => setActiveProjectName(projects[0]?.name ?? "No project selected"))
      .catch(() => setActiveProjectName("Project unavailable"));
  }, []);
  const handleSignOut = async () => {
    try { await api.post("/auth/logout", {}); } catch { /* local session still must be cleared */ }
    signOut();
    navigate("/login", { replace: true });
  };
  return (
    <div className="shell">
      <aside className={`side ${sidebarOpen ? "open" : ""}`}>
        <Brand />
        <nav>
          {items.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={label}
              to={path}
              className={pathname === path ? "active" : ""}
            >
              <Icon size={17} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="side-bottom">
          <NavLink to="/settings">
            <Settings size={17} />
            <span>Settings</span>
          </NavLink>
          <NavLink to="/profile">
            <UserRound size={17} />
            <span>Profile</span>
          </NavLink>
        </div>
      </aside>
      <div className="workspace">
        <header>
          <button className="hamb" onClick={toggleSidebar}>
            <Menu />
          </button>
          <div className="project-select">
            <Building2 />
            <span>
              <small>ACTIVE PROJECT</small>{activeProjectName}
            </span>
            <ChevronDown size={15} />
          </div>
          <button className="search" onClick={() => setSearchOpen(true)}>
            <Search size={17} />
            <span>Search project data...</span>
            <kbd>⌘ K</kbd>
          </button>
          <div className="head-actions">
            <button type="button" title="Open settings" onClick={() => navigate("/settings")}>
              <HelpCircle size={18} />
            </button>
            <NavLink className="notify" to="/notifications">
              <Bell size={18} />
              <i />
            </NavLink>
            <div className="user">
              <span className="avatar">{user.initials}</span>
              <span>
                <b>{user.name}</b>
                <small>{roleLabel[user.role]}</small>
              </span>
              <ChevronDown size={15} />
            </div>
            <button type="button" title="Sign out" onClick={() => void handleSignOut()}>
              <LogOut size={18} />
            </button>
          </div>
        </header>
        {children}
      </div>
      <nav className="mobile-nav">
        {items.slice(0, 4).map(({ label, path, icon: Icon }) => (
          <NavLink
            to={path}
            className={pathname === path ? "active" : ""}
            key={label}
          >
            <Icon />
            <span>{label}</span>
          </NavLink>
        ))}
        <NavLink to="/profile">
          <UserRound />
          <span>Profile</span>
        </NavLink>
      </nav>
      {searchOpen && (
        <div className="modal" onClick={() => setSearchOpen(false)}>
          <div className="command" onClick={(event) => event.stopPropagation()}>
            <Search />
            <input
              autoFocus
              placeholder="Search tasks, people, delays, resources..."
            />
            <p>QUICK NAVIGATION</p>
            {[
              [activeProjectName, "/pm/dashboard"],
              ["Tasks and schedule", "/pm/tasks"],
              ["Delays and risks", "/pm/risks"],
              ["Project activity", "/pm/activity"],
            ].map(([result, path]) => (
              <button key={result} type="button" onClick={() => { setSearchOpen(false); navigate(path); }}>
                {result}
                <span>↗</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
