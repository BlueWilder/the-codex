/**
 * INTEGRATION TEST. Requires a real, throwaway PostgreSQL database.
 *
 * Not matched by any vitest project (filename ends in `-test.ts`, not
 * `.test.ts`), so `npx vitest run` will never pick it up. It deletes rows.
 * See scan-rate-limit.integration-test.ts for how to enable these (Option A).
 *
 * What this pins that the in-memory fake cannot: that the Drizzle predicates
 * in DatabaseStorage actually scope by userId. The route-level suite in
 * friends-routes.test.ts proves the handler asks for the right user; this
 * proves the SQL honours it.
 */
import { beforeEach, describe, expect, it } from "vitest";
import { DatabaseStorage } from "./storage";
import { db } from "./db";
import { friends } from "@shared/schema";
import { eq, inArray } from "drizzle-orm";

const storage = new DatabaseStorage();
const USER_A = "test-friend-user-a";
const USER_B = "test-friend-user-b";

beforeEach(async () => {
  await db.delete(friends).where(inArray(friends.userId, [USER_A, USER_B]));
});

describe("DatabaseStorage friends scoping (real SQL)", () => {
  it("persists the row with the right userId and name", async () => {
    const created = await storage.createFriend({ userId: USER_A, name: "Ana" });
    const rows = await db.select().from(friends).where(eq(friends.id, created.id));
    expect(rows).toHaveLength(1);
    expect(rows[0].userId).toBe(USER_A);
    expect(rows[0].name).toBe("Ana");
  });

  it("getFriends returns only the given user's rows", async () => {
    await storage.createFriend({ userId: USER_A, name: "Ana" });
    await storage.createFriend({ userId: USER_B, name: "Belle" });
    expect((await storage.getFriends(USER_A)).map((f) => f.name)).toEqual(["Ana"]);
    expect((await storage.getFriends(USER_B)).map((f) => f.name)).toEqual(["Belle"]);
  });

  it("updateFriend and deleteFriend refuse to cross user boundaries", async () => {
    const created = await storage.createFriend({ userId: USER_A, name: "Ana" });
    expect(await storage.updateFriend(created.id, USER_B, { name: "Hacked" })).toBeNull();
    expect(await storage.deleteFriend(created.id, USER_B)).toBe(false);
    expect(await storage.updateFriend(created.id, USER_A, { name: "Anastasia" })).not.toBeNull();
    expect(await storage.deleteFriend(created.id, USER_A)).toBe(true);
  });
});
