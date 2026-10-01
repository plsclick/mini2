import type { User, UserRole } from "../types/user";
import { mockUsers } from "../mock/users";
import { fakeDelay } from "./api";

export const authService = {
  /** Sign in with email + password (mock: accepts any credentials) */
  async signIn(email: string, _password: string): Promise<User> {
    // Derive role from email domain for demo purposes
    let role: UserRole = "client";
    if (email.includes("pm") || email.includes("manager")) role = "pm";
    else if (email.includes("cm") || email.includes("site")) role = "cm";
    return fakeDelay(mockUsers[role]);
  },

  /** Demo quick-login by role */
  async signInAsRole(role: UserRole): Promise<User> {
    return fakeDelay(mockUsers[role]);
  },

  /** Sign up — returns the new user based on selected role */
  async signUp(
    _name: string,
    _email: string,
    role: UserRole,
  ): Promise<User> {
    return fakeDelay({ ...mockUsers[role], id: crypto.randomUUID() });
  },

  async signOut(): Promise<void> {
    return fakeDelay(undefined);
  },
};
