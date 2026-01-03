import { test, expect, vi, beforeEach, describe } from "vitest";

// Mock server-only to allow testing
vi.mock("server-only", () => ({}));

// Mock jose library
const mockSign = vi.fn();
const mockSetProtectedHeader = vi.fn();
const mockSetExpirationTime = vi.fn();
const mockSetIssuedAt = vi.fn();

vi.mock("jose", () => ({
  SignJWT: vi.fn().mockImplementation(() => ({
    setProtectedHeader: mockSetProtectedHeader.mockReturnThis(),
    setExpirationTime: mockSetExpirationTime.mockReturnThis(),
    setIssuedAt: mockSetIssuedAt.mockReturnThis(),
    sign: mockSign,
  })),
  jwtVerify: vi.fn(),
}));

// Mock Next.js cookies
const mockSet = vi.fn();
const mockCookies = vi.fn().mockResolvedValue({
  set: mockSet,
  get: vi.fn(),
  delete: vi.fn(),
});

vi.mock("next/headers", () => ({
  cookies: mockCookies,
}));

describe("createSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSign.mockResolvedValue("mock-jwt-token");
  });

  test("creates a JWT token with correct payload", async () => {
    const { createSession } = await import("@/lib/auth");
    const { SignJWT } = await import("jose");

    const userId = "user123";
    const email = "test@example.com";

    await createSession(userId, email);

    expect(SignJWT).toHaveBeenCalledWith(
      expect.objectContaining({
        userId,
        email,
        expiresAt: expect.any(Date),
      })
    );
  });

  test("sets JWT with correct configuration", async () => {
    const { createSession } = await import("@/lib/auth");

    const userId = "user456";
    const email = "user@test.com";

    await createSession(userId, email);

    expect(mockSetProtectedHeader).toHaveBeenCalledWith({ alg: "HS256" });
    expect(mockSetExpirationTime).toHaveBeenCalledWith("7d");
    expect(mockSetIssuedAt).toHaveBeenCalled();
    expect(mockSign).toHaveBeenCalled();
  });

  test("sets cookie with correct name and token", async () => {
    const { createSession } = await import("@/lib/auth");

    const userId = "user789";
    const email = "admin@example.com";

    await createSession(userId, email);

    expect(mockSet).toHaveBeenCalledWith(
      "auth-token",
      "mock-jwt-token",
      expect.any(Object)
    );
  });

  test("sets cookie with httpOnly flag", async () => {
    const { createSession } = await import("@/lib/auth");

    await createSession("user1", "user1@test.com");

    expect(mockSet).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      expect.objectContaining({
        httpOnly: true,
      })
    );
  });

  test("sets cookie with sameSite lax", async () => {
    const { createSession } = await import("@/lib/auth");

    await createSession("user2", "user2@test.com");

    expect(mockSet).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      expect.objectContaining({
        sameSite: "lax",
      })
    );
  });

  test("sets cookie with root path", async () => {
    const { createSession } = await import("@/lib/auth");

    await createSession("user3", "user3@test.com");

    expect(mockSet).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      expect.objectContaining({
        path: "/",
      })
    );
  });

  test("sets cookie expiration to 7 days from now", async () => {
    const { createSession } = await import("@/lib/auth");

    const beforeTime = Date.now();
    await createSession("user4", "user4@test.com");
    const afterTime = Date.now();

    const callArgs = mockSet.mock.calls[0];
    const cookieOptions = callArgs[2];
    const expiresDate = cookieOptions.expires;

    expect(expiresDate).toBeInstanceOf(Date);

    const expiresMs = expiresDate.getTime();
    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;

    expect(expiresMs).toBeGreaterThanOrEqual(beforeTime + sevenDaysInMs);
    expect(expiresMs).toBeLessThanOrEqual(afterTime + sevenDaysInMs);
  });

  test("sets secure flag to false in development", async () => {
    const { createSession } = await import("@/lib/auth");

    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";

    await createSession("user5", "user5@test.com");

    expect(mockSet).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      expect.objectContaining({
        secure: false,
      })
    );

    process.env.NODE_ENV = originalEnv;
  });

  test("sets secure flag to true in production", async () => {
    const { createSession } = await import("@/lib/auth");

    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";

    await createSession("user6", "user6@test.com");

    expect(mockSet).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      expect.objectContaining({
        secure: true,
      })
    );

    process.env.NODE_ENV = originalEnv;
  });

  test("creates session with different user IDs", async () => {
    const { createSession } = await import("@/lib/auth");
    const { SignJWT } = await import("jose");

    const testCases = [
      { userId: "abc123", email: "user1@test.com" },
      { userId: "xyz789", email: "user2@test.com" },
      { userId: "def456", email: "user3@test.com" },
    ];

    for (const { userId, email } of testCases) {
      vi.clearAllMocks();
      await createSession(userId, email);

      expect(SignJWT).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          email,
        })
      );
    }
  });

  test("creates session with different email formats", async () => {
    const { createSession } = await import("@/lib/auth");
    const { SignJWT } = await import("jose");

    const emails = [
      "simple@test.com",
      "user.name@example.co.uk",
      "admin+tag@domain.org",
    ];

    for (const email of emails) {
      vi.clearAllMocks();
      await createSession("userId", email);

      expect(SignJWT).toHaveBeenCalledWith(
        expect.objectContaining({
          email,
        })
      );
    }
  });

  test("calls cookies function to get cookie store", async () => {
    const { createSession } = await import("@/lib/auth");

    await createSession("user7", "user7@test.com");

    expect(mockCookies).toHaveBeenCalled();
  });

  test("handles JWT signing correctly", async () => {
    const { createSession } = await import("@/lib/auth");

    const customToken = "custom-jwt-token-123";
    mockSign.mockResolvedValueOnce(customToken);

    await createSession("user8", "user8@test.com");

    expect(mockSet).toHaveBeenCalledWith(
      "auth-token",
      customToken,
      expect.any(Object)
    );
  });
});
