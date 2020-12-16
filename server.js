const express = require("express");
const bodyParser = require("body-parser");
const http = require("http");
const config = require("./config");
const socketIO = require("socket.io");
const rmq = require("./rmq");
const auth = require("./auth");

// set config
const port = config.SOCKET_PORT || 4001;
const app = express();
app.use(bodyParser.json());

// server instance
const server = http.createServer(app);

const io = socketIO(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Initialize rabbitmq client with socket.
rmq.Init(io);

const EVENTS = config.EVENTS;

io.on(EVENTS.ON_CONNECTION, (socket) => {
  console.log("Socket User connected");
  socket.on(EVENTS.ON_DISCONNECT, () => {
    console.log("Socket User Disconnected");
  });
});

// http login
app.post("/api/login", (req, res) => {
  var data = req.body.body;
  console.log("user authentication request " + data);
  data = JSON.parse(data);
  const result = auth.authenticate(data.username, data.password);
  console.log("auth result: " + result);

  if (result == true) {
    subscribeForUser(data.username);
  }

  res.json({
    auth: result,
    token: "true",
    user: data.username,
    pass: data.password,
  });
});

server.listen(port, () => console.log(`Listening on port ${port}`));

const subscribeForUser = (user) => {
  rmq.subscribeChannel(EVENTS.ON_PRICE_TICK, user);
};
