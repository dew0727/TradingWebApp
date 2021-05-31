const express = require("express");
const http = require("http");
const config = require("./config");
const socketIO = require("socket.io");
const rmq = require("./utils/rmq");
const { authenticate } = require("./auth");
const db = require("./utils/db");
const path = require("path");
const { socket } = require("./utils/socket");
const mainLogger = require("./utils/logger").mainLogger;

// set config
const port = process.env.SOCKET_PORT || 3010;
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "/client/build")));
app.get("/*", function (req, res) {
  res.sendFile(path.join(__dirname, "/client/build", "index.html"));
});

const ipLogger = (req, res, next) => {
  try {
    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    var data = req.body.body;
    data = JSON.parse(data);

    if (!data.login) {
      
      const result = authenticate(data);
      mainLogger.info(
        ` >>> CLIENT_REQUEST: ${ip}, ${req.url}, ${data.role}, ${result.email}, ${req.body.body}`
      );
    } else {
      mainLogger.info(
        ` >>> CLIENT_REQUEST: ${ip}, ${req.url}, ${req.body.body}`
      );
    }
  } catch (error) {
    mainLogger.info(`request error: ${error}`);
  } finally {
    next();
  }
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
    mainLogger.info("invlaid socket");
    next(new Error("Failed authentication"));
  }
});

// Initialize rabbitmq client with socket.
socket.setIo(io);

const EVENTS = config.EVENTS;

io.on(EVENTS.ON_CONNECTION, (socket) => {
  mainLogger.info("Socket User connected");
  socket.on(EVENTS.ON_DISCONNECT, () => {
    mainLogger.info("Socket User Disconnected");
  });
});

// http login
app.post("/api/login", (req, res) => {
  var data = req.body.body;
  data = JSON.parse(data);
  const result = authenticate(data);

  mainLogger.info(`Auth Result: ${JSON.stringify(result)}`);
  if (result.success === true) {
    mainLogger.info(`Subscribing with user  ${result.email}`);
    socket.emit(EVENTS.ON_USER_LOGIN, JSON.stringify({ email: result.email }));
  }

  res.json({
    auth: result.success,
    token: result.token,
    role: result.role,
  });
});

app.post("/api/logout", (req, res) => {
  var data = req.body.body;
  data = JSON.parse(data);
  const result = authenticate(data);

  if (result.success === true) {
    mainLogger.info(`Logged out:  ${result.email}`);
    res.json({
      success: true,
      token: result.token,
      role: result.role,
    });
  } else {
    mainLogger.info(`Logged out Failed:  ${result.email}`);
    res.json({
      success: false,
    });
  }
});

app.post("/api/add-account", (req, res) => {
  var data = req.body.body;
  if (port !== 3000) return
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
  if (port !== 3000) return
  var data = req.body.body;
  data = JSON.parse(data);
  var isMaster = data.role === "master" ? true : false;

  if (isMaster) {
    mainLogger.info("Master can't chenge the global settings");
    return;
  }

  const auth = db.GetAuthToken({ token: data.token });
  if (auth.email) {
    if (data.settings) {
      const globals = db.SetGlobalSettings(data.settings);
      socket.emit(EVENTS.ON_GLOBAL_SETTINGS, JSON.stringify(globals));
      res.json({
        success: true,
        data: JSON.stringify(globals),
      });
    } else {
      mainLogger.info("invalid data");
      res.json({
        success: false,
        error: "invalid data",
      });
    }
  } else {
    mainLogger.info("invlaid token");
    res.json({
      success: false,
      error: "invalid token",
    });
  }
});

app.post("/api/get-global-setting", (req, res) => {
  var data = req.body.body;
  if (port !== 3000) return
  data = JSON.parse(data);

  const auth = db.GetAuthToken({ token: data.token });
  if (auth.email) {
    let globals = db.GetGlobalSettings();
    globals["feed"] = db.GetPriceFeed();
    socket.emit(EVENTS.ON_GLOBAL_SETTINGS, JSON.stringify(globals));
    res.json({
      success: true,
      data: JSON.stringify(globals),
    });
  } else {
    mainLogger.info("invlaid token");
    res.json({
      success: false,
      error: "invalid token",
    });
  }
});
//=========================

app.post("/api/update-user-setting", (req, res) => {
  var data = req.body.body;
  data = JSON.parse(data);
  var isMaster = data.role === "master" ? true : false;
  if (port !== 3000) return
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
    mainLogger.info("invlaid token");
    res.json({
      success: false,
      error: "invalid token",
    });
  }
});

app.post("/api/get-user-setting", (req, res) => {
  var data = req.body.body;
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
    mainLogger.info("invlaid token");
    res.json({
      success: false,
      error: "invalid token",
    });
  }
});

app.post("/api/update-account", (req, res) => {
  var data = req.body.body;
  data = JSON.parse(data);
  if (port !== 3000) {
    console.log('request ignoreed due to prevent testing request on live acounts')
    return
  }
  const account = {
    name: data.broker + data.number,
    basket: data.basket ? data.basket : false,
    default: data.default ? data.default : 1,
    retryCount: data.retryCount ? data.retryCount : 1,
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
  if (port !== 3000) return
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
  if (port !== 3000) {
    console.log('request ignoreed due to prevent testing request on live acounts')
    return
  }
  const accName = data.Account;
  const accounts = db.GetAccounts();
  const globalSettings = db.GetGlobalSettings();
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
              mainLogger.info(
                "Skip to trade becasue master account basket set off"
              );
              return;
            }

            if (isMaster && !acc.master) {
              mainLogger.info("Skip trader acc in case master");
              return;
            }

            orderMsg = `${acc.name}@${data.Mode},${data.Symbol},${
              data.Command
            },${data.Lots * acc.default},${data.Price},${data.SL},${data.TP},${
              data.Type
            },${globalSettings.retryCount || 1},${
              globalSettings.waitingTime || 0
            }`;

            db.RegsterOrderedAccount(acc.name)
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
            mainLogger.info(
              "Skip to trade becasue master account basket set off"
            );
            return;
          }

          if (isMaster && !acc.master) {
            mainLogger.info("Skip trader acc in case master");
            return;
          }

          if (!isMaster && acc.name !== accName && !acc.master) {
            return;
          }

          mainLogger.info(orderMsg);
          orderMsg = `${acc.name}@ORDER_DELETE,${data.Symbol},${
            globalSettings.retryCount || 1
          },${globalSettings.waitingTime || 0}`;
          db.RegsterOrderedAccount(acc.name)
          rmq.publishMessage(EVENTS.ON_ORDER_REQUEST, orderMsg);
        }
      });
      break;
    default:
      if (data.Symbol === "ALL") {
        accounts.forEach((acc) => {
          if (db.GetAccountStatus(acc.name) && acc.basket) {
            if (acc.master && !acc.basket) {
              mainLogger.info(
                "Skip to trade becasue master account basket set off"
              );
              return;
            }

            if (isMaster && !acc.master) {
              mainLogger.info("Skip trader acc in case master");
              return;
            }

            orderMsg = `${acc.name}@${data.Mode},${data.Symbol},${
              globalSettings.retryCount || 1
            },${globalSettings.waitingTime || 0}`;

            db.RegsterOrderedAccount(acc.name)
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
              mainLogger.info(
                "Skip to trade becasue master account basket set off"
              );
              return;
            }
            if (isMaster && !acc.master) {
              mainLogger.info("Skip trader acc in case master");
              return;
            }

            orderMsg = `${acc.name}@${data.Mode},${data.Symbol},${
              globalSettings.retryCount || 1
            },${globalSettings.waitingTime || 0}`;
            db.RegsterOrderedAccount(acc.name)
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
  mainLogger.info(feed);

  db.SetPriceFeed(feed);
  mainLogger.info(`Price-feed: ${JSON.stringify(db.GetPriceFeed())}`);
  socket.emit(EVENTS.ON_GLOBAL_SETTINGS, JSON.stringify({ feed: feed }));
  res.json({
    success: true,
  });
});

server.listen(port, () => mainLogger.info(`Listening on port ${port}`));
