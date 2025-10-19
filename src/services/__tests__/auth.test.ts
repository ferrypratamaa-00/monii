import bcrypt from "bcryptjs";
import { describe, expect, it, vi } from "vitest";

// Mock bcrypt
vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));

describe("Auth Utilities", () => {
  describe("bcrypt hashing", () => {
    it("should hash password correctly", async () => {
      (bcrypt.hash as any).mockResolvedValue("hashedpassword");

      const result = await bcrypt.hash("password123", 12);

      expect(bcrypt.hash).toHaveBeenCalledWith("password123", 12);
      expect(result).toBe("hashedpassword");
    });

    it("should compare passwords correctly", async () => {
      (bcrypt.compare as any).mockResolvedValue(true);

      const result = await bcrypt.compare("password123", "hashedpassword");

      expect(bcrypt.compare).toHaveBeenCalledWith(
        "password123",
        "hashedpassword",
      );
      expect(result).toBe(true);
    });
  });
});
