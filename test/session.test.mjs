import assert from "node:assert/strict";
import test from "node:test";

class Storage {
  #values = new Map();

  getItem(key) { return this.#values.get(key) ?? null; }
  setItem(key, value) { this.#values.set(key, String(value)); }
  removeItem(key) { this.#values.delete(key); }
  clear() { this.#values.clear(); }
}

globalThis.localStorage = new Storage();
globalThis.window = new EventTarget();

const {
  apiRequest,
  hasUsableStoredSession,
  isStudentPortalRole,
  saveSession,
} = await import("../src/lib/api.js");

function tokenWith(payload) {
  return `header.${Buffer.from(JSON.stringify(payload)).toString("base64url")}.signature`;
}

function validSession() {
  saveSession(
    tokenWith({ exp: Math.floor(Date.now() / 1000) + 3600 }),
    { id: "student-1", role: "student" }
  );
}

test.beforeEach(() => {
  localStorage.clear();
  globalThis.fetch = undefined;
});

test("expired tokens clear the complete session", () => {
  saveSession(tokenWith({ exp: 1 }), { id: "student-1", role: "student" });

  assert.equal(hasUsableStoredSession(), false);
  assert.equal(localStorage.getItem("kampuslyToken"), null);
  assert.equal(localStorage.getItem("kampuslyProfile"), null);
  assert.equal(localStorage.getItem("kampuslyUser"), null);
});

test("malformed tokens clear the complete session", () => {
  saveSession("not-a-jwt", { id: "student-1", role: "student" });

  assert.equal(hasUsableStoredSession(), false);
  assert.equal(localStorage.getItem("kampuslyToken"), null);
});

test("only the five student-facing roles are permitted", () => {
  for (const role of ["student", "seller", "food_vendor", "laundry_provider", "grocery_shopper"]) {
    assert.equal(isStudentPortalRole(role), true);
  }

  assert.equal(isStudentPortalRole("admin"), false);
  assert.equal(isStudentPortalRole("unknown"), false);
});

test("server and network validation failures retain a valid stored session", async () => {
  validSession();
  globalThis.fetch = async () => ({
    ok: false,
    status: 500,
    json: async () => ({ message: "Server unavailable" }),
  });
  await assert.rejects(() => apiRequest("/auth/me"));
  assert.ok(localStorage.getItem("kampuslyToken"));

  globalThis.fetch = async () => { throw new TypeError("Network request failed"); };
  await assert.rejects(() => apiRequest("/auth/me"));
  assert.ok(localStorage.getItem("kampuslyToken"));
});

test("401 validation failures clear the session", async () => {
  validSession();
  globalThis.fetch = async () => ({
    ok: false,
    status: 401,
    json: async () => ({ message: "Session expired" }),
  });

  await assert.rejects(() => apiRequest("/auth/me"));
  assert.equal(localStorage.getItem("kampuslyToken"), null);
});
