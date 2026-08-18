import { describe, expect, it } from "vitest";
import { storageDriver } from "@/lib/storage";

describe("storage driver", () => {
  it("refuses local disk when MIZANE_ENV is production", () => {
    const prevEnv = process.env.MIZANE_ENV;
    const prevDriver = process.env.STORAGE_DRIVER;
    try {
      process.env.MIZANE_ENV = "production";
      process.env.STORAGE_DRIVER = "local";
      expect(() => storageDriver()).toThrow(/STORAGE_DRIVER=local/);
    } finally {
      process.env.MIZANE_ENV = prevEnv;
      process.env.STORAGE_DRIVER = prevDriver;
    }
  });
});
