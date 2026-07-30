/** Public (safe) Harvey status — never includes the full API key. */
export type HarveyPublicStatus = {
  configured: boolean;
  /** e.g. ••••••••abcd */
  maskedKey: string | null;
  baseUrl: string;
  updatedAt: string | null;
  statusLabel: "connected" | "missing";
};
