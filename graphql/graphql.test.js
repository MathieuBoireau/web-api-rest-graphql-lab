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
  test("query annonces", async () => {
    const res = await request
      .post("/graphql")
      .send({ query: "{ annonces{ title } }" });
    expect(res.statusCode).toEqual(200);
    expect(res.text).toEqual(
      '{"data":{"annonces":[{"title":"annonce1"},{"title":"annonce2"},{"title":"annonce3"}]}}'
    );
  });

  test("query annonce", async () => {
    const res = await request
      .post("/graphql")
      .send({ query: `{ annonce(id: "${annonceId}"){ title } }` });
    expect(res.statusCode).toEqual(200);
    expect(res.text).toEqual('{"data":{"annonce":{"title":"annonce3"}}}');
  });

  test("mutation create annonce", async () => {
    const res = await request.post("/graphql").send({
      query:
        "mutation CreateAnnonce($annonceInput: AnnonceInput){ createAnnonce(input: $annonceInput){title}}",
      variables: JSON.stringify({ annonceInput: testInsertion[0] }),
    });
    expect(res.statusCode).toEqual(200);
    expect(res.text).toEqual(
      '{"data":{"createAnnonce":{"title":"Nouvelle annonce"}}}'
    );
  });

  test("mutation update annonce", async () => {
    const res = await request.post("/graphql").send({
      query:
        "mutation UpdateAnnonce($annonceId: ID, $annonceInput: AnnonceInput){ \
					updateAnnonce(annonceId: $annonceId, input: $annonceInput){ title }}",
      variables: JSON.stringify({
        annonceId,
        annonceInput: testInsertion[1],
      }),
    });
    expect(res.statusCode).toEqual(200);
    expect(res.text).toEqual(
      '{"data":{"updateAnnonce":{"title":"Nouveau titre d\'annonce"}}}'
    );
  });

  test("mutation delete annonce", async () => {
    const res = await request.post("/graphql").send({
      query:
        "mutation DeleteAnnonce($annonceId: ID){ \
					deleteAnnonce(annonceId: $annonceId){ title }}",
      variables: JSON.stringify({ annonceId }),
    });
    expect(res.statusCode).toEqual(200);
    expect(res.text).toEqual('{"data":{"deleteAnnonce":{"title":"annonce3"}}}');
    expect(await Annonce.findById(annonceId)).toEqual(null);
  });

  test("mutation create question as agent", async () => {
    const res = await request.post("/graphql").send({
      query:
        "mutation CreateQuestion($annonceId: ID, $questionInput: QuestionReponseInput){ \
					createQuestion(annonceId: $annonceId, input: $questionInput){ questions{title, author} }}",
      variables: JSON.stringify({
        annonceId,
        questionInput: testQuestion,
      }),
    });
    expect(res.text).toEqual(
      '{\"errors\":[{\"message\":\"Unexpected error value: { message: \\\"POST /graphql/ Forbidden\\\", code: 403 }\",\"locations\":[{\"line\":1,\"column\":85}],\"path\":[\"createQuestion\"]}],\"data\":{\"createQuestion\":null}}'
    );
  });

  test("mutation create question as user", async () => {
    const user = await User.findOne({
      email: "user@mail",
    });
    const token = jwt.sign({ user }, jwtSecret);
    const res = await request
      .set({ Authorization: `Bearer ${token}` })
      .post("/graphql")
      .send({
        query:
          "mutation CreateQuestion($annonceId: ID, $questionInput: QuestionReponseInput){ \
					createQuestion(annonceId: $annonceId, input: $questionInput){ questions{title, author} }}",
        variables: JSON.stringify({
          annonceId,
          questionInput: testQuestion,
        }),
      });
    expect(res.statusCode).toEqual(200);
    expect(res.text).toEqual(
      '{"data":{"createQuestion":{"questions":[{"title":"Intitule de question","author":"User User"}]}}}'
    );
  });

  test("mutation create reponse", async () => {
    const user = await User.findOne({
      email: "user@mail",
    });
    const userToken = jwt.sign({ user }, jwtSecret);
    await request
      .set({ Authorization: `Bearer ${userToken}` })
      .post("/graphql")
      .send({
        query:
          "mutation CreateQuestion($annonceId: ID, $questionInput: QuestionReponseInput){ \
					createQuestion(annonceId: $annonceId, input: $questionInput){ questions{title, author} }}",
        variables: JSON.stringify({
          annonceId,
          questionInput: testQuestion,
        }),
      });
    const res = await request
      .set(agentHeader)
      .post("/graphql")
      .send({
        query:
          "mutation CreateReponse($annonceId: ID, $num: Int, $reponseInput: QuestionReponseInput){ \
					createReponse(annonceId: $annonceId, n: $num, input: $reponseInput){ questions{answer{title, author}} }}",
        variables: JSON.stringify({
          annonceId,
          num: 0,
          reponseInput: {
            title: "Intitule de reponse",
          },
        }),
      });
    expect(res.statusCode).toEqual(200);
    expect(res.text).toEqual(
      '{"data":{"createReponse":{"questions":[{"answer":{"title":"Intitule de reponse","author":"Agent Agent"}}]}}}'
    );
  });
});
