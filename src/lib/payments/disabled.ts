export const disabledProvider = {
  name: "disabled" as const,
  async initiate(): Promise<never> {
    throw new Error("PAYMENTS_DISABLED");
  },
  async verifyByRef(): Promise<never> {
    throw new Error("PAYMENTS_DISABLED");
  },
  async parseWebhook(): Promise<never> {
    throw new Error("PAYMENTS_DISABLED");
  },
  async refund(): Promise<never> {
    throw new Error("PAYMENTS_DISABLED");
  },
};
