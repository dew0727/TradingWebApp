const express = require("express");
const bodyParser = require("body-parser");
const http = require("http");
const config = require("./config");
const socketIO = require("socket.io");
const rmq = require("./utils/rmq");
const auth = require("./auth");
const db = require("./utils/db");

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
  var time = Date.now();
  var data = req.body.body;
  console.log("user authentication request " + data);
  data = JSON.parse(data);
  const result = auth.authenticate(data.username, data.password);
  console.log("auth result: " + result);

  if (result == true) {
    subscribeForUser(data.username);
    db.Init();
  }
  
  res.json({
    auth: result,
    token: "true",
    user: data.username,
    pass: data.password,
  });
});


app.post("/api/add-account", (req, res) => {
  var data = req.body.body;
  console.log("add account data: ") + data;

  data = JSON.parse(data);
  var account = {
    name: data.broker + data.number,
    busket: data.busket == undefined ? false : data.busket,
    default: data.default == undefined ? 1 : data.default,
    ...data
  }

  const {success, error} = db.AddAccount(account);

  res.json({
    success,
    error
  })
});

app.post("/api/order-request", (req, res) => {
  var data = req.body.body;
  console.log("order request data: " + data);

  var sReq = "GPM2192267@ORDER_OPEN,EURUSD,BUY,0.3,1.23,0,0,MARKET";
  publishMessage(config.EVENTS.ON_ORDER_REQUEST, sReq);

  res.json({
    success: true
  })
})

app.post("/api/price-feed", (req, res) => {
  var feed = req.body.body.accountname;

  db.SetPriceFeed(feed);

  res.json({
    success: true
  })
})



server.listen(port, () => console.log(`Listening on port ${port}`));

const subscribeForUser = (user) => {
  rmq.subscribeChannel(EVENTS.ON_PRICE_TICK, user);
  rmq.subscribeChannel(EVENTS.ON_ACCOUNT, user);
  rmq.subscribeChannel(EVENTS.ON_POSLIST, user);
  rmq.subscribeChannel(EVENTS.ON_ORDERLIST, user);
  rmq.subscribeChannel(EVENTS.ON_ORDER_RESPONSE, user);
  rmq.subscribeChannel(EVENTS.ON_RATE, user);
};
