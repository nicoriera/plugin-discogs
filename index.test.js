const request = require("supertest");
const app = require("./index");

describe("POST /chat", () => {
  let server;

  beforeAll(() => {
    server = app.listen(3000);
  });

  afterAll((done) => {
    server.close(done);
  });

  it("should return a response with search results", async () => {
    const res = await request(server)
      .post("/chat")
      .send({ user_message: "Thriller" })
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body.message).toContain("Thriller");
  });

  it("should return a response with no results found", async () => {
    const res = await request(server)
      .post("/chat")
      .send({ user_message: "qwertyuiopasdfghjklzxcvbnm" })
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body.message).toContain("No results found");
  });
});
