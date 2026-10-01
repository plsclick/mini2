import type { User } from "../types/user";

export const mockUsers: Record<string, User> = {
  client: {
    id: "u-client",
    name: "Meera Kapoor",
    role: "client",
    initials: "MK",
  },
  pm: {
    id: "u-pm",
    name: "Aditya Sharma",
    role: "pm",
    initials: "AS",
  },
  cm: {
    id: "u-cm",
    name: "Rohan Singh",
    role: "cm",
    initials: "RS",
  },
};
