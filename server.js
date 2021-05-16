const express = require("express");
const bodyParser = require("body-parser");
const http = require("http");
const config = require("./config");
const socketIO = require("socket.io");
const rmq = require("./utils/rmq");
const { authenticate } = require("./auth");
const db = require("./utils/db");
const path = require("path");
const { socket } = require("./utils/socket");

// set config
const port = process.env.SOCKET_PORT || 3000;
const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "/client/build")));
app.get("/*", function (req, res) {
  res.sendFile(path.join(__dirname, "/client/build", "index.html"));
});

const ipLogger = (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  console.log("client ip address: ", ip); // ip address of the user
  next();
};

app.use(ipLogger);

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

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  const auth = db.GetAuthToken({ token });
  if (auth.email) {
    next();
  } else {
    console.log("invlaid socket");
    next(new Error("Failed authentication"));
  }
});

// Initialize rabbitmq client with socket.
socket.setIo(io);

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
    // subscribeForUser(result.email);
    socket.emit(EVENTS.ON_USER_LOGIN, JSON.stringify({ email: result.email }));
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
    // unsubscribeForUser(result.email);
    res.json({
      success: true,
      token: result.token,
      role: result.role,
    });
  } else {
    res.json({
      success: false,
    });
  }
});

app.post("/api/add-account", (req, res) => {
  var data = req.body.body;

  console.log(new Date().toLocaleString(), "add account data: ", data);
  data = JSON.parse(data);
  var account = {
    broker: data.broker,
    number: data.number,
    loginID: data.loginID,
    password: data.password,
    name: data.broker + data.number,
    basket: data.basket == undefined ? false : data.basket,
    default: data.default == undefined ? 1 : data.default,
    master: data.role === "master" ? true : false,
  };

  const { success, error } = db.AddAccount(account);

  res.json({
    success,
    error,
  });
});

/**
 * Global settings
 */
app.post("/api/update-global-setting", (req, res) => {
  var data = req.body.body;
  console.log("Update global settings: ", { data });

  data = JSON.parse(data);
  var isMaster = data.role === "master" ? true : false;

  if (isMaster) {
    console.log("Maste can't chenge the global settings");
    return;
  }

  const auth = db.GetAuthToken({ token: data.token });
  if (auth.email) {
    if (data.settings) {
      const globals = db.SetGlobalSettings(data.settings);
      socket.emit(EVENTS.ON_GLOBAL_SETTINGS, JSON.stringify(globals));
      res.json({
        success: true,
        data: JSON.stringify(globals)
      });
    } else {
      console.log("invalid data");
      res.json({
        success: false,
        error: "invalid data",
      });
    }
  } else {
    console.log("invlaid token");
    res.json({
      success: false,
      error: "invalid token",
    });
  }
});

app.post("/api/get-global-setting", (req, res) => {
  var data = req.body.body;
  console.log("get global settings: ", { data });

  data = JSON.parse(data);

  const auth = db.GetAuthToken({ token: data.token });
  if (auth.email) {
    let globals = db.GetGlobalSettings();
    globals['feed'] = db.GetPriceFeed();
    socket.emit(EVENTS.ON_GLOBAL_SETTINGS, JSON.stringify(globals));
    res.json({
      success: true,
      data: JSON.stringify(globals)
    });
  } else {
    console.log("invlaid token");
    res.json({
      success: false,
      error: "invalid token",
    });
  }
});
//=========================

app.post("/api/update-user-setting", (req, res) => {
  var data = req.body.body;
  console.log("Update user settings: ", { data });

  data = JSON.parse(data);
  var isMaster = data.role === "master" ? true : false;

  const auth = db.GetAuthToken({ token: data.token });
  if (auth.email) {
    db.SetUserSettings(auth.email, isMaster, data);
    const userSettings = db.GetUserSettings(auth.email);
    socket.emit(
      EVENTS.ON_USER_SETTINGS,
      JSON.stringify({ [auth.email]: userSettings })
    );
    res.json({
      success: true,
      data: JSON.stringify({ [auth.email]: userSettings }),
    });
  } else {
    console.log("invlaid token");
    res.json({
      success: false,
      error: "invalid token",
    });
  }
});

app.post("/api/get-user-setting", (req, res) => {
  var data = req.body.body;
  console.log("get user settings: ", { data });

  data = JSON.parse(data);

  const auth = db.GetAuthToken({ token: data.token });
  if (auth.email) {
    const userSettings = db.GetUserSettings(auth.email);
    socket.emit(
      EVENTS.ON_USER_SETTINGS,
      JSON.stringify({ [auth.email]: userSettings })
    );
    res.json({
      success: true,
      data: JSON.stringify({ [auth.email]: userSettings }),
    });
  } else {
    console.log("invlaid token");
    res.json({
      success: false,
      error: "invalid token",
    });
  }
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
  data = JSON.parse(data);
  var isMaster = data.role == "master" ? true : false;

  const accName = data.Account;
  const accounts = db.GetAccounts();
  let orderMsg = "";

  switch (data.Mode) {
    case "ORDER_OPEN":
      accounts.forEach((acc) => {
        if (db.GetAccountStatus(acc.name)) {
          if (
            (accName === "Basket" && acc.basket && acc.default > 0) ||
            acc.name === accName ||
            acc.master
          ) {
            if (acc.master && !acc.basket) {
              console.log(
                "Skip to trade becasue master account basket set off"
              );
              return;
            }

            if (isMaster && !acc.master) {
              console.log("Skip trader acc in case master");
              return;
            }

            orderMsg = `${acc.name}@${data.Mode},${data.Symbol},${
              data.Command
            },${data.Lots * acc.default},${data.Price},${data.SL},${data.TP},${
              data.Type
            }`;

            rmq.publishMessage(EVENTS.ON_ORDER_REQUEST, orderMsg);
          }
        }
      });
      break;
    case "ORDER_DELETE":
      accounts.forEach((acc) => {
        if (
          db.GetAccountStatus(acc.name) &&
          ((acc.basket && accName === "Basket") ||
            acc.name === accName ||
            acc.master)
        ) {
          if (acc.master && !acc.basket) {
            console.log("Skip to trade becasue master account basket set off");
            return;
          }

          if (isMaster && !acc.master) {
            console.log("Skip trader acc in case master");
            return;
          }

          if (!isMaster && acc.name !== accName && !acc.master) {
            return;
          }

          console.log(orderMsg);
          orderMsg = `${acc.name}@ORDER_DELETE,${data.Symbol}`;
          rmq.publishMessage(EVENTS.ON_ORDER_REQUEST, orderMsg);
        }
      });
      break;
    default:
      if (data.Symbol === "ALL") {
        accounts.forEach((acc) => {
          if (db.GetAccountStatus(acc.name) && acc.basket) {
            if (acc.master && !acc.basket) {
              console.log(
                "Skip to trade becasue master account basket set off"
              );
              return;
            }

            if (isMaster && !acc.master) {
              console.log("Skip trader acc in case master");
              return;
            }

            orderMsg = `${acc.name}@${data.Mode},${data.Symbol}`;
            rmq.publishMessage(EVENTS.ON_ORDER_REQUEST, orderMsg);
          }
        });
      } else {
        accounts.forEach((acc) => {
          if (
            db.GetAccountStatus(acc.name) &&
            ((acc.basket && accName === "Basket") ||
              acc.name === accName ||
              acc.master)
          ) {
            if (acc.master && !acc.basket) {
              console.log(
                "Skip to trade becasue master account basket set off"
              );
              return;
            }
            if (isMaster && !acc.master) {
              console.log("Skip trader acc in case master");
              return;
            }

            orderMsg = `${acc.name}@${data.Mode},${data.Symbol}`;
            rmq.publishMessage(EVENTS.ON_ORDER_REQUEST, orderMsg);
          }
        });
      }
      break;
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
  socket.emit(EVENTS.ON_GLOBAL_SETTINGS, JSON.stringify({feed: feed}));
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

subscribeForUser(config.RABBITMQ_USERNAME);