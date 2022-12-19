const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const User = require("./schema/user");

module.exports.createDB = async () => {
  await mongoose.connection.close();
  const mongod = await MongoMemoryServer.create();
  const url = mongod.getUri();
  mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  await Promise.all([
    User.create({
      email: "agent@mail",
      displayName: "Agent Agent",
      permission: "agent",
    }),
    User.create({
      email: "user@mail",
      displayName: "User User",
      permission: "user",
    }),
  ]);
  return mongod;
};

module.exports.clearDB = () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    collection.deleteMany();
  }
};

module.exports.closeDB = async (mongod) => {
  this.clearDB();
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
};
