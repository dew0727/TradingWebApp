const express = require("express");
const bodyParser = require("body-parser");
const http = require("http");
const config = require("./config");
const socketIO = require("socket.io");
const rmq = require("./utils/rmq");
const { authenticate } = require("./auth");
const db = require("./utils/db");
const path = require("path");

// set config
const port = process.env.SOCKET_PORT || 3000;
const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "/client/build")));
app.get("/*", function (req, res) {
  res.sendFile(path.join(__dirname, "/client/build", "index.html"));
});

// initialized database
db.Init();

// server instance
const server = http.createServer(app);

const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Initialize rabbitmq client with socket.
require("./utils/socket").socket.setIo(io);

const EVENTS = config.EVENTS;

io.on(EVENTS.ON_CONNECTION, (socket) => {
  console.log(new Date().toLocaleString(), "Socket User connected");
  socket.on(EVENTS.ON_DISCONNECT, () => {
    console.log(new Date().toLocaleString(), "Socket User Disconnected");
  });
});

// http login
app.post("/api/login", (req, res) => {
  var data = req.body.body;
  data = JSON.parse(data);

  console.log(new Date().toLocaleString(), "Request to login with ", data);

  const result = authenticate(data);

  console.log("Auth Result:", result);
  if (result.success === true) {
    console.log("Subscribing with user ", result.email);
    subscribeForUser(result.email);
  }

  console.log(new Date().toLocaleString(), "pricefeed", db.GetPriceFeed());

  res.json({
    auth: result.success,
    token: result.token,
    role: result.role,
  });
});

app.post("/api/logout", (req, res) => {
  var data = req.body.body;
  data = JSON.parse(data);
  console.log(new Date().toLocaleString(), "user logout request " + data);
  const result = authenticate(data);

  if (result.success === true) {
    console.log("Un-subscribing with user ", result.email);
    unsubscribeForUser(result.email);
    res.json({
      success: true,
      token: result.token,
      role: result.role,
    });  
  } else {
    res.json({
      success: false
    })
  }
});

app.post("/api/add-account", (req, res) => {
  var data = req.body.body;

  console.log(new Date().toLocaleString(), "add account data: ", data);
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

  const account = {
    name: data.broker + data.number,
    basket: data.basket ? data.basket : false,
    default: data.default ? data.default : 1,
    ...data,
  };

  const { success, error } = db.UpdateAccount(account);
  console.log(
    new Date().toLocaleString(),
    "updated account data: ",
    db.GetAccount(account.name)
  );
  res.json({
    success,
    error,
  });
});

app.post("/api/delete-account", (req, res) => {
  var data = req.body.body;
  console.log(new Date().toLocaleString(), "delete account data: ", data);

  data = JSON.parse(data);

  db.DeleteAccount(data);

  res.json({
    success: true,
    error: "",
  });
});

app.post("/api/order-request", (req, res) => {
  var data = req.body.body;

  console.log(new Date().toLocaleString(), "request order: ", data);

  data = JSON.parse(data);

  const accName = data.Account;
  const accounts = db.GetAccounts();
  let orderMsg = "";

  switch (data.Mode) {
    case "ORDER_OPEN":
      if (accName === "Basket" || accName === "All") {
        accounts.forEach((acc) => {
          if (db.GetAccountStatus(acc.name)) {
            if ((accName === "All" || acc.basket) && acc.default > 0) {
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

    case "ORDER_DELETE_ALL":
      if (data.Symbol === "ALL") {
        accounts.forEach((acc) => {
          if (
            db.GetAccountStatus(acc.name) &&
            (acc.basket || accName === "All")
          ) {
            orderMsg = `${acc.name}@${data.Mode},${data.Symbol}`;
            rmq.publishMessage(EVENTS.ON_ORDER_REQUEST, orderMsg);
          }
        });
      } else {
        if (accName === "Basket" || accName === "All") {
          accounts.forEach((acc) => {
            if (
              db.GetAccountStatus(acc.name) &&
              (acc.basket || accName === "All")
            ) {
              orderMsg = `${acc.name}@${data.Mode},${data.Symbol}`;
              rmq.publishMessage(EVENTS.ON_ORDER_REQUEST, orderMsg);
            }
          });
        } else {
          if (db.GetAccountStatus(accName)) {
            orderMsg = `${accName}@${data.Mode},${data.Symbol}`;
            rmq.publishMessage(EVENTS.ON_ORDER_REQUEST, orderMsg);
          }
        }
      }
      break;

    case "ORDER_CLOSE_ALL":
      if (data.Symbol === "ALL") {
        accounts.forEach((acc) => {
          if (
            db.GetAccountStatus(acc.name) &&
            (acc.basket || accName === "All")
          ) {
            orderMsg = `${acc.name}@${data.Mode},${data.Symbol}`;
            rmq.publishMessage(EVENTS.ON_ORDER_REQUEST, orderMsg);
          }
        });
      } else {
        if (accName === "Basket" || accName === "All") {
          accounts.forEach((acc) => {
            if (
              db.GetAccountStatus(acc.name) &&
              (acc.basket || accName === "All")
            ) {
              orderMsg = `${acc.name}@${data.Mode},${data.Symbol}`;
              rmq.publishMessage(EVENTS.ON_ORDER_REQUEST, orderMsg);
            }
          });
        } else {
          if (db.GetAccountStatus(accName)) {
            orderMsg = `${accName}@${data.Mode},${data.Symbol}`;
            rmq.publishMessage(EVENTS.ON_ORDER_REQUEST, orderMsg);
          }
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
  console.log(new Date().toLocaleString(), feed);

  db.SetPriceFeed(feed);
  console.log(new Date().toLocaleString(), "Price-feed: ", db.GetPriceFeed());
  res.json({
    success: true,
  });
});

server.listen(port, () =>
  console.log(new Date().toLocaleString(), `Listening on port ${port}`)
);

const subscribeForUser = (user) => {
  rmq.subscribeChannel(EVENTS.ON_PRICE_TICK, user);
  rmq.subscribeChannel(EVENTS.ON_ACCOUNT, user);
  rmq.subscribeChannel(EVENTS.ON_POSLIST, user);
  rmq.subscribeChannel(EVENTS.ON_ORDERLIST, user);
  rmq.subscribeChannel(EVENTS.ON_ORDER_RESPONSE, user);
  rmq.subscribeChannel(EVENTS.ON_RATE, user);
};

const unsubscribeForUser = (user) => {
  console.log(new Date().toLocaleString(), "unsbscribing user: ", user);
  rmq.unsubscribeQueue(EVENTS.ON_PRICE_TICK, user);
  rmq.unsubscribeQueue(EVENTS.ON_ACCOUNT, user);
  rmq.unsubscribeQueue(EVENTS.ON_POSLIST, user);
  rmq.unsubscribeQueue(EVENTS.ON_ORDERLIST, user);
  rmq.unsubscribeQueue(EVENTS.ON_ORDER_RESPONSE, user);
  rmq.unsubscribeQueue(EVENTS.ON_RATE, user);
};
