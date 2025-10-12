import request from "supertest";
import { db } from "../src/config/prisma";
import app from "../src/app";

describe("User Routes", () => {
  // Bersihkan tabel sebelum & sesudah test
  beforeEach(async () => {
    await db.user.deleteMany();
  });

  afterAll(async () => {
    await db.$disconnect();
  });

  const testUser = {
    name: "Pitok",
    email: "pitok@example.com",
    password: "secure123"
  };

  let createdUserId: string;
  let authToken: string;

  it("should register a new user", async () => {
    const res = await request(app)
      .post("/api/v1/users/register")
      .send(testUser)
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(testUser.email);
    createdUserId = res.body.data.id;
  });

  it("should login with valid credentials", async () => {
    // Create user first
    await db.user.create({
      data: {
        ...testUser,
        password: "$2a$10$XqKmYwHYHzGRYO7P0hqQZeJKvMxLkQkWqNqZ7FZyVkKp1vXx4KCVO" // hashed "secure123"
      }
    });

    const res = await request(app)
      .post("/api/v1/users/login")
      .send({
        email: testUser.email,
        password: testUser.password
      })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(testUser.email);

    // Get token from cookie or response based on TOKEN_SET_IN config
    const cookies = res.headers['set-cookie'];
    if (cookies) {
      authToken = cookies[0].split(';')[0].split('=')[1];
    }
  });

  it("should fail to register with duplicate email", async () => {
    // Create user first
    await request(app)
      .post("/api/v1/users/register")
      .send(testUser);

    const res = await request(app)
      .post("/api/v1/users/register")
      .send(testUser)
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/email sudah/i);
  });

  it("should get all users (protected route)", async () => {
    // Create and login first
    await request(app)
      .post("/api/v1/users/register")
      .send(testUser);

    const loginRes = await request(app)
      .post("/api/v1/users/login")
      .send({
        email: testUser.email,
        password: testUser.password
      });

    const cookies = loginRes.headers['set-cookie'];

    const res = await request(app)
      .get("/api/v1/users")
      .set('Cookie', cookies)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("should get user by ID (protected route)", async () => {
    // Register and login
    await request(app)
      .post("/api/v1/users/register")
      .send(testUser);

    const loginRes = await request(app)
      .post("/api/v1/users/login")
      .send({
        email: testUser.email,
        password: testUser.password
      });

    const cookies = loginRes.headers['set-cookie'];
    const userId = loginRes.body.data.id;

    const res = await request(app)
      .get(`/api/v1/users/${userId}`)
      .set('Cookie', cookies)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(userId);
  });

  it("should update user (protected route)", async () => {
    // Register and login
    await request(app)
      .post("/api/v1/users/register")
      .send(testUser);

    const loginRes = await request(app)
      .post("/api/v1/users/login")
      .send({
        email: testUser.email,
        password: testUser.password
      });

    const cookies = loginRes.headers['set-cookie'];
    const userId = loginRes.body.data.id;

    const res = await request(app)
      .patch(`/api/v1/users/${userId}`)
      .set('Cookie', cookies)
      .send({ name: "Updated Name" })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe("Updated Name");
  });

  it("should delete user (protected route)", async () => {
    // Register and login
    await request(app)
      .post("/api/v1/users/register")
      .send(testUser);

    const loginRes = await request(app)
      .post("/api/v1/users/login")
      .send({
        email: testUser.email,
        password: testUser.password
      });

    const cookies = loginRes.headers['set-cookie'];
    const userId = loginRes.body.data.id;

    const res = await request(app)
      .delete(`/api/v1/users/${userId}`)
      .set('Cookie', cookies)
      .expect(200);

    expect(res.body.success).toBe(true);

    const deleted = await db.user.findUnique({ where: { id: userId } });
    expect(deleted).toBeNull();
  });

  it("should return 404 for unknown user (protected route)", async () => {
    const fakeId = "b8a1c9f2-b2c3-4e4d-8b16-018e71fc3e70"; // UUID format

    // Register and login first
    await request(app)
      .post("/api/v1/users/register")
      .send(testUser);

    const loginRes = await request(app)
      .post("/api/v1/users/login")
      .send({
        email: testUser.email,
        password: testUser.password
      });

    const cookies = loginRes.headers['set-cookie'];

    const res = await request(app)
      .get(`/api/v1/users/${fakeId}`)
      .set('Cookie', cookies)
      .expect(404);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/not found/i);
  });

  it("should fail to access protected routes without auth", async () => {
    const res = await request(app)
      .get("/api/v1/users")
      .expect(401);

    expect(res.body.success).toBe(false);
  });
});
