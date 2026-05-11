export const ACCENT = "#84cc16";

export const TOPIC_COLORS = {
  jwtStructure: "#a78bfa",
  unverifiedSignature: "#06b6d4",
  algNone: "#f59e0b",
  algorithmConfusion: "#84cc16",
  kidInjection: "#ef4444",
  jwkInjection: "#ec4899",
  jkuInjection: "#3b82f6",
  publicKeyRecovery: "#22c55e",
} as const;

export const JWT_PART_COLORS = {
  header: "#e06c75",
  payload: "#98c379",
  signature: "#61afef",
} as const;
