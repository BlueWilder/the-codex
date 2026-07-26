import express, { type Express, type RequestHandler } from "express";
import request from "supertest";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";

// Mounts the friends routes with a stubbed auth middleware that reads the
// user id from the X-Test-User header (401 when missing), so we can exercise
// auth gating and per-user scoping without a real OIDC session.
let app: Express;
let db: typeof import("./db").db;
let friends: typeof import("@shared/schema").friends;

const testAuth: RequestHandler = (req: any, res, next) => {
  const userId = req.headers["x-test-user"];
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  req.user = { claims: { sub: userId } };
  next();
};

const USER_A = "test-friend-user-a";
const USER_B = "test-friend-user-b";

beforeAll(async () => {
  const { registerFriendRoutes } = await import("./routes");
  ({ db } = await import("./db"));
  ({ friends } = await import("@shared/schema"));

  app = express();
  app.use(express.json());
  registerFriendRoutes(app, testAuth);
});

beforeEach(async () => {
  const { inArray } = await import("drizzle-orm");
  await db.delete(friends).where(inArray(friends.userId, [USER_A, USER_B]));
});

describe("/api/friends auth", () => {
  it("returns 401 for all methods when logged out", async () => {
    expect((await request(app).get("/api/friends")).status).toBe(401);
    expect((await request(app).post("/api/friends").send({ name: "Ana" })).status).toBe(401);
    expect((await request(app).put("/api/friends/1").send({ name: "Ana" })).status).toBe(401);
    expect((await request(app).delete("/api/friends/1")).status).toBe(401);
  });
});

describe("/api/friends CRUD and scoping", () => {
  it("creates a friend and persists the row with the right userId and name", async () => {
    const res = await request(app)
      .post("/api/friends")
      .set("X-Test-User", USER_A)
      .send({ name: "Ana" });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Ana");

    // Verify directly in the database, not just the returned object.
    const { eq } = await import("drizzle-orm");
    const rows = await db.select().from(friends).where(eq(friends.id, res.body.id));
    expect(rows).toHaveLength(1);
    expect(rows[0].userId).toBe(USER_A);
    expect(rows[0].name).toBe("Ana");
  });

  it("rejects empty names on create and rename", async () => {
    const created = await request(app)
      .post("/api/friends")
      .set("X-Test-User", USER_A)
      .send({ name: "" });
    expect(created.status).toBe(400);

    const add = await request(app)
      .post("/api/friends")
      .set("X-Test-User", USER_A)
      .send({ name: "Bob" });
    const renamed = await request(app)
      .put(`/api/friends/${add.body.id}`)
      .set("X-Test-User", USER_A)
      .send({ name: "" });
    expect(renamed.status).toBe(400);
  });

  it("lists only the caller's friends", async () => {
    await request(app).post("/api/friends").set("X-Test-User", USER_A).send({ name: "Ana" });
    await request(app).post("/api/friends").set("X-Test-User", USER_B).send({ name: "Belle" });

    const listA = await request(app).get("/api/friends").set("X-Test-User", USER_A);
    expect(listA.status).toBe(200);
    expect(listA.body.map((f: any) => f.name)).toEqual(["Ana"]);

    const listB = await request(app).get("/api/friends").set("X-Test-User", USER_B);
    expect(listB.body.map((f: any) => f.name)).toEqual(["Belle"]);
  });

  it("renames a friend for the owner and 404s for another user", async () => {
    const created = await request(app)
      .post("/api/friends")
      .set("X-Test-User", USER_A)
      .send({ name: "Ana" });

    const asOther = await request(app)
      .put(`/api/friends/${created.body.id}`)
      .set("X-Test-User", USER_B)
      .send({ name: "Hacked" });
    expect(asOther.status).toBe(404);

    const asOwner = await request(app)
      .put(`/api/friends/${created.body.id}`)
      .set("X-Test-User", USER_A)
      .send({ name: "Anastasia" });
    expect(asOwner.status).toBe(200);
    expect(asOwner.body.name).toBe("Anastasia");
  });

  it("deletes a friend for the owner and 404s for another user", async () => {
    const created = await request(app)
      .post("/api/friends")
      .set("X-Test-User", USER_A)
      .send({ name: "Ana" });

    const asOther = await request(app)
      .delete(`/api/friends/${created.body.id}`)
      .set("X-Test-User", USER_B);
    expect(asOther.status).toBe(404);

    const asOwner = await request(app)
      .delete(`/api/friends/${created.body.id}`)
      .set("X-Test-User", USER_A);
    expect(asOwner.status).toBe(204);

    const list = await request(app).get("/api/friends").set("X-Test-User", USER_A);
    expect(list.body).toEqual([]);
  });
});

describe("/api/friends duplicate name enforcement", () => {
  it("rejects a duplicate name on create (case-insensitive, trimmed) with 409", async () => {
    await request(app).post("/api/friends").set("X-Test-User", USER_A).send({ name: "Ana" });

    const dup = await request(app)
      .post("/api/friends")
      .set("X-Test-User", USER_A)
      .send({ name: "  aNa  " });
    expect(dup.status).toBe(409);
    expect(dup.body.message).toMatch(/already in your friends list/);

    // A different user may still use the same name.
    const other = await request(app)
      .post("/api/friends")
      .set("X-Test-User", USER_B)
      .send({ name: "Ana" });
    expect(other.status).toBe(201);
  });

  it("rejects renames that collide with another friend, but allows re-casing the same friend", async () => {
    const ana = await request(app).post("/api/friends").set("X-Test-User", USER_A).send({ name: "Ana" });
    await request(app).post("/api/friends").set("X-Test-User", USER_A).send({ name: "Bob" });

    const collide = await request(app)
      .put(`/api/friends/${ana.body.id}`)
      .set("X-Test-User", USER_A)
      .send({ name: " bob " });
    expect(collide.status).toBe(409);
    expect(collide.body.message).toMatch(/already in your friends list/);

    const recase = await request(app)
      .put(`/api/friends/${ana.body.id}`)
      .set("X-Test-User", USER_A)
      .send({ name: "ANA" });
    expect(recase.status).toBe(200);
    expect(recase.body.name).toBe("ANA");
  });

  it("stores the trimmed name on create", async () => {
    const res = await request(app)
      .post("/api/friends")
      .set("X-Test-User", USER_A)
      .send({ name: "  Cara  " });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Cara");
  });
});
