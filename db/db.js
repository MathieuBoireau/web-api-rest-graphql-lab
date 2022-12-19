const mongoose = require("mongoose");

function connect() {
  mongoose
    .connect("mongodb://localhost:27017/Annonces", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      family: 4, // use IPv4
    })
    .catch((err) => console.log("CONNECT", err));

  return mongoose;
}

module.exports = connect();
