const mongoose = require("mongoose");
const { Annonce, createAnnonce } = require("./annonce");
const { createDB, closeDB } = require("../testDB");

let mongod;
beforeAll(async () => {
  mongod = await createDB();
});
afterAll(async () => {
  await closeDB(mongod);
});

const annonceUpdate = {
  title: "Titre2",
  type: "location",
  publication_status: "non publiée",
  status: "disponible",
  description: "une description...2",
  price: 20000,
  date: new Date(0),
};

describe("Annonce tests", () => {
  test("Annonce creation", async () => {
    const annonceId = (
      await createAnnonce(
        "Titre",
        "vente",
        "publiée",
        "disponible",
        "une description...",
        10000,
        Date.now()
      )
    )._id;
    const annonce = await Annonce.findById(annonceId);
    expect(annonce.title).toEqual("Titre");
  });

  test("Annonce update without photos", async () => {
    const annonceId = (
      await createAnnonce(
        "Titre",
        "vente",
        "publiée",
        "vendu",
        "une description...",
        10000,
        Date.now()
      )
    )._id;
    const annonce = await Annonce.findByIdAndUpdate(annonceId, annonceUpdate, {
      returnOriginal: false,
    });
    expect(annonce.title).toEqual("Titre2");
    expect(annonce.type).toEqual("location");
    expect(annonce.publication_status).toEqual("non publiée");
    expect(annonce.status).toEqual("disponible");
    expect(annonce.description).toEqual("une description...2");
    expect(annonce.price).toEqual(20000);
    expect(annonce.date).toEqual(new Date(0));
    expect(annonce.photos).toEqual([]);
  });

  test("Annonce update with photos", async () => {
    const annonceId = (
      await createAnnonce(
        "Titre",
        "vente",
        "publiée",
        "vendu",
        "une description...",
        10000,
        Date.now()
      )
    )._id;
    const annonce = await Annonce.findByIdAndUpdate(annonceId, annonceUpdate, {
      returnOriginal: false,
    });
    expect(annonce.title).toEqual("Titre2");
    expect(annonce.type).toEqual("location");
    expect(annonce.publication_status).toEqual("non publiée");
    expect(annonce.status).toEqual("disponible");
    expect(annonce.description).toEqual("une description...2");
    expect(annonce.price).toEqual(20000);
    expect(annonce.date).toEqual(new Date(0));
  });

  test("Delete annonce", async () => {
    const { annonceId } = await createAnnonce(
      "Titre",
      "vente",
      "publiée",
      "disponible",
      "une description...",
      10000,
      Date.now()
    );
    await Annonce.deleteOne(annonceId);
    const annonce = await Annonce.findById(annonceId);
    expect(annonce).toEqual(null);
  });

  test("Delete a non-existing annonce", async () => {
    var annonceId = mongoose.Types.ObjectId();
    await Annonce.deleteOne(annonceId);
    annonce = await Annonce.findById(annonceId);
    expect(annonce).toEqual(null);
  });
});
