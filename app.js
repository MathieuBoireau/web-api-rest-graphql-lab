"use strict";

const path = require("path");
const multer = require("multer");
const passport = require("passport");
const GitlabStrategy = require("passport-gitlab2").Strategy;
const jwt = require("jsonwebtoken");

const { graphqlHTTP } = require("express-graphql");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const fs = require('fs');

const oas3Tools = require("oas3-tools");
const { gitlab, jwtSecret } = require("./oauth2");

if (process.env.JEST_WORKER_ID === undefined) {
  require('./db/db'); // mongodb connection
}
const User = require("./db/schema/user");
const { expressjwt } = require('express-jwt');

// swaggerRouter configuration
/**
 * @type { import('oas3-tools/dist/middleware/oas3.options').Oas3AppOptions } options
 */
var options = {
  routing: {
    controllers: path.join(__dirname, "./controllers"),
  },
  openApiValidator: {
    fileUploader: { storage: multer.memoryStorage() },
    validateRequests: false,
  },
};

const expressAppConfig = oas3Tools.expressAppConfig(
  path.join(__dirname, "api/openapi.yaml"),
  options
);
const app = expressAppConfig.getApp();

// GitLab OAuth 2.0 provider
passport.use(
  new GitlabStrategy(
    {
      clientID: gitlab.clientId,
      clientSecret: gitlab.clientSecret,
      callbackURL: 'http://localhost:8080/login',
      baseURL: "https://www-apps.univ-lehavre.fr/forge/",
    },
    async function (accessToken, refreshToken, profile, cb) {
      let user = await User.findOne(profile.email); // db link
      if (!user) {
        const { email, displayName } = profile;
        user = await User.create({ email, displayName, permission: "user" });
        console.log("Created new user " + user.displayName);
      }
      const token = jwt.sign({ user }, jwtSecret, { expiresIn: "2h" });
      return cb(null, token);
    }
  )
);
passport.serializeUser(function (token, cb) {
  return cb(null, token);
});
passport.deserializeUser(function (token, cb) {
  return cb(null, token);
});

app.use(passport.initialize());
app.use(
  "/login",
  passport.authenticate("gitlab", { session: false }),
  function (req, res, next) {
    res.json({ token: req.user }); // send jwt
    const { user } = jwt.decode(req.user);
    console.log("connected: " + user.displayName);
  }
);
app.use(
  expressjwt({
    secret: jwtSecret,
    algorithms: ["HS256"],
    credentialsRequired: false,
  })
);

var typeDefs = fs.readFileSync("./graphql/types.graphql", "utf8");
var resolvers = require('./graphql/resolvers');
const schema = makeExecutableSchema({ typeDefs, resolvers });

app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    // rootValue,
    graphiql: { headerEditorEnabled: true },
  })
);

// https://github.com/bug-hunters/oas3-tools/issues/41
function oas3fix() {
  const stack = app._router.stack;
  const addedMiddlewares = 4;
  const lastEntries = stack.splice(app._router.stack.length - addedMiddlewares);
  const firstEntries = stack.splice(0, 5); // Arbitary number 5, adding our middleware after the first 5
  app._router.stack = [...firstEntries, ...lastEntries, ...stack];
}
oas3fix();

module.exports = app;
