const fs = require("fs");
const { ApolloServer } = require("apollo-server-express");
const bodyParser = require("body-parser");
const cors = require("cors");
const express = require("express");
const expressJwt = require("express-jwt");
const jwt = require("jsonwebtoken");
const http = require("http");
const db = require("./db");

const port = 9001;
const jwtSecret = Buffer.from("xkMBdsE+P6242Z2dPV3RD91BPbLIko7t", "base64");

const app = express();
app.use(
  cors(),
  bodyParser.json(),
  expressJwt({
    credentialsRequired: false,
    secret: jwtSecret,
  })
);

const typeDefs = fs.readFileSync("./schema.graphql", { encoding: "utf8" });
const resolvers = require("./resolvers");

function context({ req, connection }) {
  let userId = null;

  if (req && req.user) {
    userId = req.user.sub;
  }
  if (connection) {
  
    const conn = connection || { context: { accessToken: null } };
    if (!conn.context.accessToken) return {};
    const token = connection.context.accessToken;
    const decoded = jwt.verify(token, jwtSecret);
    if (decoded) userId = decoded.sub;
    //connection.context.accessToken;
  }

  return {
    userId,
  };
}

const apolloServer = new ApolloServer({ typeDefs, resolvers, context });
apolloServer.applyMiddleware({ app, path: "/graphql" });

app.post("/login", (req, res) => {
  const { name, password } = req.body;
  const user = db.users.get(name);
  if (!(user && user.password === password)) {
    res.sendStatus(401);
    return;
  }
  const token = jwt.sign({ sub: user.id }, jwtSecret);
  res.send({ token });
});
const httpServer = http.createServer(app);
apolloServer.installSubscriptionHandlers(httpServer); //apollo-express-server way of enabling ws to be used for graphQl on the
//similar to var io = require('socket.io')(httpServer);  or const wss = new WebSocket.Server({ httpServer }); Using apollo-server dont need this check docs
httpServer.listen(port, () => console.log(`Server started on port ${port}`));
