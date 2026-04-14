/**
 * @jest-environment node
 */

jest.mock("bcryptjs", () => ({
  hash: jest.fn().mockResolvedValue("hashed-password"),
  compare: jest.fn(),
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn().mockReturnValue("signed-jwt-token"),
}));

jest.mock("@/lib/mongodb", () => jest.fn().mockResolvedValue({}));
jest.mock("@/models/User", () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

import { NextRequest } from "next/server";
import { POST as registerPOST } from "@/app/api/auth/register/route";
import { POST as loginPOST } from "@/app/api/auth/login/route";
import { POST as logoutPOST } from "@/app/api/auth/logout/route";
import UserModel from "@/models/User";
import bcrypt from "bcryptjs";

const mockUserModel = UserModel as jest.Mocked<typeof UserModel>;
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

function createRequest(path: string, body?: object): NextRequest {
  return new NextRequest(`http://localhost:3000${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
}

describe("Auth API - Register", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 400 when name is missing", async () => {
    const request = createRequest("/api/auth/register", {
      email: "test@example.com",
      password: "Password1",
      confirmPassword: "Password1",
    });

    const response = await registerPOST(request);
    expect(response.status).toBe(400);
  });

  it("returns 400 when email format is invalid", async () => {
    const request = createRequest("/api/auth/register", {
      name: "Usuario",
      email: "email-invalido",
      password: "Password1",
      confirmPassword: "Password1",
    });

    const response = await registerPOST(request);
    expect(response.status).toBe(400);
  });

  it("returns 400 when password does not meet complexity", async () => {
    const request = createRequest("/api/auth/register", {
      name: "Usuario",
      email: "test@example.com",
      password: "password",
      confirmPassword: "password",
    });

    const response = await registerPOST(request);
    expect(response.status).toBe(400);
  });

  it("returns 400 when password confirmation does not match", async () => {
    const request = createRequest("/api/auth/register", {
      name: "Usuario",
      email: "test@example.com",
      password: "Password1",
      confirmPassword: "Password2",
    });

    const response = await registerPOST(request);
    expect(response.status).toBe(400);
  });

  it('returns 409 when email is already registered', async () => {
    (mockUserModel.findOne as jest.Mock).mockResolvedValue({ _id: "existing" });

    const request = createRequest("/api/auth/register", {
      name: "Usuario",
      email: "test@example.com",
      password: "Password1",
      confirmPassword: "Password1",
    });

    const response = await registerPOST(request);
    expect(response.status).toBe(409);
    const data = await response.json();
    expect(data.error).toBe("Correo ya registrado");
  });

  it("registers successfully and sets auth cookie", async () => {
    (mockUserModel.findOne as jest.Mock).mockResolvedValue(null);
    (mockUserModel.create as jest.Mock).mockResolvedValue({
      _id: "user-1",
      name: "Usuario",
      email: "test@example.com",
    });

    const request = createRequest("/api/auth/register", {
      name: "Usuario",
      email: "test@example.com",
      password: "Password1",
      confirmPassword: "Password1",
    });

    const response = await registerPOST(request);

    expect(response.status).toBe(201);
    expect(mockBcrypt.hash).toHaveBeenCalledWith("Password1", 10);
    expect(mockUserModel.create).toHaveBeenCalled();
    expect(response.cookies.get("auth_token")?.value).toBe("signed-jwt-token");
    const data = await response.json();
    expect(data.message).toBe("Registro exitoso");
  });
});

describe("Auth API - Login", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 401 when credentials are invalid", async () => {
    (mockUserModel.findOne as jest.Mock).mockResolvedValue(null);

    const request = createRequest("/api/auth/login", {
      email: "test@example.com",
      password: "Password1",
    });

    const response = await loginPOST(request);
    expect(response.status).toBe(401);
  });

  it("returns 401 when password does not match", async () => {
    (mockUserModel.findOne as jest.Mock).mockResolvedValue({
      _id: "user-1",
      name: "Usuario",
      email: "test@example.com",
      password: "hashed-password",
    });
    (mockBcrypt.compare as jest.Mock).mockResolvedValue(false);

    const request = createRequest("/api/auth/login", {
      email: "test@example.com",
      password: "Password1",
    });

    const response = await loginPOST(request);
    expect(response.status).toBe(401);
  });

  it("logs in successfully and sets auth cookie", async () => {
    (mockUserModel.findOne as jest.Mock).mockResolvedValue({
      _id: "user-1",
      name: "Usuario",
      email: "test@example.com",
      password: "hashed-password",
    });
    (mockBcrypt.compare as jest.Mock).mockResolvedValue(true);

    const request = createRequest("/api/auth/login", {
      email: "test@example.com",
      password: "Password1",
    });

    const response = await loginPOST(request);
    expect(response.status).toBe(200);
    expect(response.cookies.get("auth_token")?.value).toBe("signed-jwt-token");

    const data = await response.json();
    expect(data.user).toBeDefined();
    expect(data.user.password).toBeUndefined();
  });
});

describe("Auth API - Logout", () => {
  it("returns 200 and clears auth cookie", async () => {
    const request = new NextRequest("http://localhost:3000/api/auth/logout", {
      method: "POST",
    });

    const response = await logoutPOST(request);

    expect(response.status).toBe(200);
    const setCookie = response.headers.get("set-cookie") || "";
    expect(setCookie).toContain("auth_token=");
    expect(setCookie.toLowerCase()).toContain("max-age=0");
    const data = await response.json();
    expect(data.message).toBe("Sesión cerrada");
  });
});