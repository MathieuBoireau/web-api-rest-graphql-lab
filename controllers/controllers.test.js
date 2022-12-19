const supertest = require("supertest");
const app = require("../app");
const {
  testAnnonces,
  testInsertion,
  testQuestion,
} = require("../db/json/annonces.json");
const { createDB, closeDB } = require("../db/testDB");
const { Annonce } = require("../db/schema/annonce");
const User = require("../db/schema/user");
const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../oauth2");

let annonceId;
let mongod;

beforeAll(async () => {
  jest.spyOn(console, "log").mockImplementation(() => {});
  mongod = await createDB();
});
beforeEach(async () => {
  for (let json of testAnnonces) {
    const annonce = new Annonce(json);
    annonce.photos = [Buffer.from("89504e470d0a1a0a0000000d4948445200000001000000010802000000907753de000000017352474200aece1ce90000000467414d410000b18f0bfc6105000000097048597300000ec300000ec301c76fa8640000000c49444154185763f8ffff3f0005fe02fea73581840000000049454e44ae426082", "hex")]
    await annonce.save();
    annonceId = annonce._id;
  }
});
afterEach(async () => {
  Annonce.deleteMany();
});
afterAll(async () => {
  await closeDB(mongod);
});

describe("with authentication", () => {
  /**
   * @type { import('supertest').SuperAgentTest } request
   */
  let request;
  let agentHeader;
  beforeEach(async () => {
    const user = await User.findOne({
      email: "agent@mail",
    });
    const token = jwt.sign({ user }, jwtSecret);
    agentHeader = { Authorization: `Bearer ${token}` };
    request = supertest.agent(app);
    request.set(agentHeader);
  });

  test("get annonces", async () => {
    const res = await request
        .get("/annonces");
      expect(res.statusCode).toEqual(200);
      expect(res.text).toContain('"title": "annonce1"');
      expect(res.text).toContain('"title": "annonce2"');
      expect(res.text).toContain('"title": "annonce3"');
  });

  test("get annonce", async () => {
    const res = await request
      .get(`/annonces/${annonceId}`)
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain('"title": "annonce3"');
  });

  test("create annonce", async () => {
    const nInsert = 0;
    const res = await request
      .post(`/annonces`)
      .set("Content-Type", "multipart/form-data")
      .field("title", testInsertion[nInsert].title)
      .field("publication_status", testInsertion[nInsert].publication_status)
      .field("type", testInsertion[nInsert].type)
      .field("status", testInsertion[nInsert].status)
      .field("description", testInsertion[nInsert].description)
      .field("price", testInsertion[nInsert].price)
      .field("date", testInsertion[nInsert].date)
      .field("photos", [])
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain(`"title": "${testInsertion[nInsert].title}",`)
  });

  test("create annonce with errors", async () => {
    const res = await request
      .post(`/annonces`)
      .set("Content-Type", "multipart/form-data")
      .field("title", "")
      .field("type", "")
      .field("status", "")
      .field("description", "")
      .field("price", "")
      .field("date", "")
      .field("photos", [])
    expect(res.statusCode).toEqual(200);
    expect(res.text).toEqual('')
  });

  test("update annonce", async () => {
    const nUpdate = 1;
    const res = await request
      .put(`/annonces/${annonceId}`)
      .set("Content-Type", "multipart/form-data")
      .field("title", testInsertion[nUpdate].title)
      .field("publication_status", testInsertion[nUpdate].publication_status)
      .field("type", testInsertion[nUpdate].type)
      .field("status", testInsertion[nUpdate].status)
      .field("description", testInsertion[nUpdate].description)
      .field("price", testInsertion[nUpdate].price)
      .field("date", testInsertion[nUpdate].date)
      .field("photos", [])
    expect(res.statusCode).toEqual(200);
    expect((await Annonce.findById(annonceId)).title).toEqual(testInsertion[nUpdate].title)
  });

  test("update annonce with errors", async () => {
    const res = await request
      .put(`/annonces/${annonceId}`)
      .set("Content-Type", "multipart/form-data")
      .field("title", '')
      .field("publication_status", '')
      .field("type", '')
      .field("status", '')
      .field("description", '')
      .field("price", '')
      .field("date", '')
      .field("photos", [])
    expect(res.statusCode).toEqual(200);
    expect(res.text).toEqual('')
  });

  test("delete annonce", async () => {
    const res = await request
      .delete(`/annonces/${annonceId}`)
    expect(res.statusCode).toEqual(200);
    expect(await Annonce.findById(annonceId)).toEqual(null);
  });

  test("getImage", async () => {
    const resPhoto = await request
      .get(`/annonces/${annonceId}/images/1`)
    expect(resPhoto.statusCode).toEqual(200);
  });

  test("getImage that doesn't exist", async () => {
    const resPhoto = await request
      .get(`/annonces/${annonceId}/images/2`)
    expect(resPhoto.statusCode).toEqual(404);
  });

  test("create question as user", async () => {
    const user = await User.findOne({
      email: "user@mail",
    });
    const token = jwt.sign({ user }, jwtSecret);
    const res = await request
      .set({ Authorization: `Bearer ${token}` })
      .post(`/annonces/${annonceId}/question`)
      .set("Content-Type", "multipart/form-data")
      .field("title", testQuestion.title)
    expect(res.statusCode).toEqual(200);
    expect((await Annonce.findById(annonceId)).questions[0].title).toEqual(testQuestion.title);
  });

  test("create reponse", async () => {
    const user = await User.findOne({
      email: "user@mail",
    });
    const userToken = jwt.sign({ user }, jwtSecret);
    await request
      .set({ Authorization: `Bearer ${userToken}` })
      .post(`/annonces/${annonceId}/question`)
      .set("Content-Type", "multipart/form-data")
      .field("title", testQuestion.title)

    const testReponse = { title: "Intitule de reponse" }
    const res = await request
      .set(agentHeader)
      .post(`/annonces/${annonceId}/question/0`)
      .set("Content-Type", "multipart/form-data")
      .field("title", testReponse.title)
    expect(res.statusCode).toEqual(200);
    expect((await Annonce.findById(annonceId)).questions[0].answer.title).toEqual(testReponse.title);
  });

  test("create reponse without question", async () => {
    const testReponse = { title: "Intitule de reponse" }
    const res = await request
      .set(agentHeader)
      .post(`/annonces/${annonceId}/question/0`)
      .set("Content-Type", "multipart/form-data")
      .field("title", testReponse.title)
    expect(res.statusCode).toEqual(200);
    expect(res.text).toEqual("");
  });
});

describe("without authentication", () => {
  const request = supertest.agent(app);

  test("get annonces as user (not published)", async () => {
    const res = await request.get("/annonces");
    expect(res.statusCode).toEqual(200);
    expect(res.text).not.toContain('"title": "annonce3"');
  });
  
  test("get annonce as user (not published)", async () => {
    const res = await request
    .get(`/annonces/${annonceId}`);
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain("");
  });

  test("create annonce without permission", async () => {
    const nInsert = 0;
    const res = await request
      .post(`/annonces`)
      .set({ "Content-Type": "multipart/form-data" })
      .field("title", testInsertion[nInsert].title)
      .field("publication_status", testInsertion[nInsert].publication_status)
      .field("type", testInsertion[nInsert].type)
      .field("status", testInsertion[nInsert].status)
      .field("description", testInsertion[nInsert].description)
      .field("price", testInsertion[nInsert].price)
      .field("date", testInsertion[nInsert].date)
      .field("photos", []);
    expect(res.statusCode).toEqual(401);
  });

  test("update annonce without permission", async () => {
    const nUpdate = 1;
    const res = await request
      .put(`/annonces/${annonceId}`)
      .set("Content-Type", "multipart/form-data")
      .field("title", testInsertion[nUpdate].title)
      .field("publication_status", testInsertion[nUpdate].publication_status)
      .field("type", testInsertion[nUpdate].type)
      .field("status", testInsertion[nUpdate].status)
      .field("description", testInsertion[nUpdate].description)
      .field("price", testInsertion[nUpdate].price)
      .field("date", testInsertion[nUpdate].date)
      .field("photos", []);
    expect(res.statusCode).toEqual(401);
  });

  test("delete annonce without permission", async () => {
    const res = await request.delete(`/annonces/${annonceId}`);
    expect(res.statusCode).toEqual(401);
  });

  test("create question without permission", async () => {
    const res = await request
      .post(`/annonces/${annonceId}/question`)
      .set("Content-Type", "multipart/form-data")
      .field("title", testQuestion.title);
    expect(res.statusCode).toEqual(401);
  });

  test("create reponse without permission", async () => {
    const { annonceId: _id } = await Annonce.findOne({ title: 'annonce1' });
    const res = await request
      .post(`/annonces/${annonceId}/question/0`)
      .set("Content-Type", "multipart/form-data")
      .field("title", testQuestion.title);
    expect(res.statusCode).toEqual(401);
  });
})
