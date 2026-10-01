import type { Dependency } from "../types/dependency";

export const dependencies: Dependency[] = [
  {
    id: "dep-1",
    predecessorId: "t-concrete-l3",
    successorId: "t-steel",
    type: "finish-to-start",
  },
  {
    id: "dep-2",
    predecessorId: "t-concrete-l2",
    successorId: "t-plumbing",
    type: "finish-to-start",
  },
  {
    id: "dep-3",
    predecessorId: "t-steel",
    successorId: "t-electric",
    type: "finish-to-start",
  },
  {
    id: "dep-4",
    predecessorId: "t-electric",
    successorId: "t-interior-prep",
    type: "finish-to-start",
  },
  {
    id: "dep-5",
    predecessorId: "t-plumbing",
    successorId: "t-interior-prep",
    type: "finish-to-start",
  },
  {
    id: "dep-6",
    predecessorId: "t-interior-prep",
    successorId: "t-finishing",
    type: "finish-to-start",
  },
];
