// use with node.js: node db/setupUsers.js

const db = require("./db");
const User = require("./schema/user");

(async () => {
  await Promise.all([
    User.create({
      email: "guillaume.coufourier@etu.univ-lehavre.fr",
      displayName: "Guillaume Coufourier",
      permission: "agent",
    }),
    User.create({
      email: "mathieu.boireau@etu.univ-lehavre.fr",
      displayName: "Mathieu Boireau",
      permission: "user",
    })
  ]);
  console.log("Added 2 users");
  process.exit(0);
})();
