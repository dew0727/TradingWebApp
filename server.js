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
require("./utils/socket").socket.setIo(io);

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

  console.log("pricefeed", db.GetPriceFeed());

  res.json({
    auth: result,
    token: "true",
    user: data.username,
    pass: data.password,
  });
});

app.post("/api/add-account", (req, res) => {
  var data = req.body.body;

  console.log("add account data: ", data);
  data = JSON.parse(data);
  var account = {
    name: data.broker + data.number,
    basket: data.basket == undefined ? false : data.basket,
    default: data.default == undefined ? 1 : data.default,
    ...data,
  };

  const { success, error } = db.AddAccount(account);

  res.json({
    success,
    error,
  });
});

app.post("/api/update-account", (req, res) => {
  var data = req.body.body;
  data = JSON.parse(data);
  console.log("update account data: ", data);
  const account = {
    name: data.broker + data.number,
    basket: data.basket ? data.basket : false,
    default: data.default ? data.default : 1,
    ...data,
  };

  const { success, error } = db.UpdateAccount(account);

  res.json({
    success,
    error,
  });
});

app.post("/api/delete-account", (req, res) => {
  var data = req.body.body;
  console.log("delete account data: ", data);

  data = JSON.parse(data);

  db.DeleteAccount(data);

  res.json({
    success: true,
    error: "",
  });
});

app.post("/api/order-request", (req, res) => {
  var data = req.body.body;

  console.log("request order: ", data);

  data = JSON.parse(data);

  const accName = data.Account;
  const accounts = db.GetAccounts();
  let orderMsg = "";

  switch (data.Mode) {
    case "ORDER_OPEN":
      if (accName === "Basket") {
        accounts.forEach((acc) => {
          if (db.GetAccountStatus(acc.name)) {
            if (acc.basket === true && acc.default > 0) {
              orderMsg = `${acc.name}@${data.Mode},${data.Symbol},${
                data.Command
              },${data.Lots * acc.default},${data.Price},${data.SL},${
                data.TP
              },${data.Type}`;

              rmq.publishMessage(EVENTS.ON_ORDER_REQUEST, orderMsg);
            }
          }
        });
      } else {
        const acc = accounts.find((acc) => acc.name === accName);

        if (acc === undefined) {
          res.json({
            success: false,
          });
        }

        if (db.GetAccountStatus(acc.name) && acc.default > 0) {
          orderMsg = `${acc.name}@${data.Mode},${data.Symbol},${data.Command},${
            data.Lots * acc.default
          },${data.Price},${data.SL},${data.TP},${data.Type}`;

          rmq.publishMessage(EVENTS.ON_ORDER_REQUEST, orderMsg);
        }
      }

      break;
    case "ORDER_DELETE":
      orderMsg = `${accName}@ORDER_DELETE,${data.Symbol}`;
      if (!db.GetAccountStatus(accName)) break;
      rmq.publishMessage(EVENTS.ON_ORDER_REQUEST, orderMsg);
      break;
    case "ORDER_CLOSE_ALL":
      if (data.Symbol === "ALL") {
        accounts.forEach((acc) => {
          if (db.GetAccountStatus(acc.name)) {
            orderMsg = `${acc.name}@${data.Mode},${data.Symbol}`;
            rmq.publishMessage(EVENTS.ON_ORDER_REQUEST, orderMsg);
          }
        });
      } else {
        if (accName === "Basket"){
          accounts.forEach(acc => {
            if (db.GetAccountStatus(acc.name)) {
              orderMsg = `${acc.name}@${data.Mode},${data.Symbol}`;
              rmq.publishMessage(EVENTS.ON_ORDER_REQUEST, orderMsg);                  
            }
          });
        } else {
          if (!db.GetAccountStatus(accName)) break;
          orderMsg = `${accName}@${data.Mode},${data.Symbol}`;
          rmq.publishMessage(EVENTS.ON_ORDER_REQUEST, orderMsg);  
        }
      }
      break;

    default:
  }

  res.json({
    success: true,
  });
});

app.post("/api/price-feed", (req, res) => {
  var data = req.body.body;
  data = JSON.parse(data);
  var feed = data.feed;
  console.log(feed);

  db.SetPriceFeed(feed);
  console.log("Price-feed: ", db.GetPriceFeed());
  res.json({
    success: true,
  });
});

server.listen(port, () => console.log(`Listening on port ${port}`));

const subscribeForUser = (user) => {
  rmq.subscribeChannel(EVENTS.ON_PRICE_TICK, user);
  rmq.subscribeChannel(EVENTS.ON_ACCOUNT, user);
  rmq.subscribeChannel(EVENTS.ON_POSLIST, user);
  rmq.subscribeChannel(EVENTS.ON_ORDERLIST, user);
  rmq.subscribeChannel(EVENTS.ON_ORDER_RESPONSE, user);
  rmq.subscribeChannel(EVENTS.ON_RATE, user);
};
