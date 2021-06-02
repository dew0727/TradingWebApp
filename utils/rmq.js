const amqp = require("amqplib/callback_api");
var cron = require("node-cron");
const { socket } = require("./socket");
const { EVENTS } = require("../config");
const config = require("../config");
const db = require("./db");
const mainLogger = require("./logger").mainLogger;

const rabbitmqHost = config.RABBITMQ_HOST;
const exchange = config.EXCHANGE_NAME;
const userName = config.RABBITMQ_USERNAME;
const password = config.RABBITMQ_PASSWORD;

// queue options
const queueOptions = {
  exclusive: false,
  durable: false,
  expires: 600000,
};

var channel = null;

// Receive messages from rabbitmq
amqp.connect(
  `amqp://${userName}:${password}@${rabbitmqHost}`,
  (error0, connection) => {
    if (error0) {
      throw error0;
    }

    connection.createChannel((error1, chan) => {
      if (error1) {
        throw error1;
      }

      chan.assertExchange(exchange, "topic", {
        durable: true,
      });

      whenConnected(chan);
    });
  }
);

const whenConnected = (chan) => {
  channel = chan;
  subscribeForUser(userName);
};

const publishMessage = (topic, sMsg) => {
  mainLogger.info(`publish msg:  ${topic}, ${sMsg}`);
  channel.publish(exchange, topic, Buffer.from('"' + sMsg + '"'), {
    deliveryMode: 2,
    type: exchange,
  });

  mainLogger.info(sMsg);
};

const unsubscribeQueue = (topic, username) => {
  const queue = "System.String, mscorlib_" + topic + username;
  mainLogger.info(`deleteing queue: ${queue}`);
  channel.deleteQueue(queue, (err, ok) => {
    mainLogger.info(err, ok);
    if (ok) mainLogger.info("Deleted queue named ", queue);
  });
};

const subscribeChannel = (topic, username) => {
  if (channel == null) return;

  channel.assertQueue(
    "System.String, mscorlib_" + topic + username,
    //+ parseInt(Math.random() * 10000, 10).toString()
    queueOptions,
    (error2, q) => {
      if (error2) {
        throw error2;
      }

      mainLogger.info(`creating message queue ${q.queue}`);

      channel.bindQueue(q.queue, exchange, topic);

      channel.consume(
        q.queue,
        (msg) => {
          if (msg && msg.content) {
            var str = msg.content.toString().replace('"', "");
            str = str.replace('"', "");
            //mainLogger.info( topic, str);
            processMessage(topic, str);
          }
        },
        {
          noAck: true,
        }
      );
    }
  );
};

const processMessage = (topic, msg) => {
  switch (topic) {
    case EVENTS.ON_RATE:
      var accName = msg.split("@")[0];
      var priceFeed = db.GetPriceFeed();
      if (priceFeed === "") {
        var accounts = db.GetAccounts();
        if (accounts.length > 0) {
          priceFeed = accounts[0].name;
          db.SetPriceFeed(priceFeed);
        }
      }

      if (accName !== priceFeed) return;

      var rates = {};
      var rateMsgs = msg.split("@")[1].split(";");
      for (var i = 0; i < rateMsgs.length; i++) {
        var rateItems = rateMsgs[i].split(",");

        var symbol = rateItems[0];
        var bid = Number.parseFloat(rateItems[1]);
        var ask = Number.parseFloat(rateItems[2]);
        var time = rateItems[3];

        var rate = {
          symbol,
          bid,
          ask,
          time,
        };

        rates = {
          [symbol]: rate,
          ...rates,
        };
      }

      socket.emit(topic, JSON.stringify(rates));
      break;
    case EVENTS.ON_ACCOUNT:
      var accName = msg.split("@")[0];

      var accounts = db.GetAccounts();
      if (!accounts.some((acc) => acc.name === accName)) return;

      db.UpdateAccountStatus(accName, true);
      var items = msg.split("@")[1].split(",");

      const account = db.GetAccount(accName);
      if (account === undefined) return;

      var statusAll = db.GetAccountStatusAll();

      var balance = items[1];
      var margin = Number.parseFloat(items[2]);
      var equity = Number.parseFloat(items[3]);
      var profit = (equity - balance).toFixed(2);
      var accountInfo = {
        key: accName,
        name: accName,
        alias: account.alias,
        currency: items[0],
        balance,
        margin,
        profit,
        equity,
        basket: account.basket ? account.basket : false,
        default: account.default ? account.default : 1,
        maxSize: account.maxSize || 0,
        orderDelay: account.orderDelay || 0,
        master: account.master,
        status: {
          status: db.GetAccountStatus(accName),
          time: Date.now(),
        },
      };
      socket.emit(topic, JSON.stringify(accountInfo));
      socket.emit(EVENTS.ON_STATUS, JSON.stringify(statusAll));
      break;
    case EVENTS.ON_POSLIST:
      var accName = msg.split("@")[0];
      var sContent = msg.split("@")[1];

      var accounts = db.GetAccounts();
      const posAcc = accounts.find((acc) => acc.name === accName);
      if (!posAcc) return;

      if (sContent === "") {
        var data = { account: accName, positions: [] };
        socket.emit(topic, JSON.stringify(data));
        return;
      }

      var items = sContent.split(";");

      var positions = [];

      for (var i = 0; i < items.length; i++) {
        var posItems = items[i].split(",");

        var symbol = posItems[0];
        var lots = Number.parseFloat(posItems[1]);
        var open_price = Number.parseFloat(posItems[2]).toFixed(5);
        var swap = Number.parseFloat(posItems[3]);
        var profit = Number.parseFloat(posItems[4]);
        var total_profit = profit + swap;
        var posCount = Number.parseFloat(posItems[5]);
        var current_price = Number.parseFloat(posItems[6]);

        var position = {
          symbol,
          lots,
          open_price,
          current_price,
          profit,
          swap,
          total_profit: total_profit.toFixed(0),
          account: accName,
          alias: posAcc.alias || "",
        };

        positions.push(position);
      }

      // total_profit = total_profit.toFixed(2);
      // positions = positions.map((pos) => {
      //   pos.total_profit = total_profit;
      //   return pos;
      // });

      var data = { account: accName, positions };
      socket.emit(topic, JSON.stringify(data));

      break;
    case EVENTS.ON_ORDERLIST:
      var accName = msg.split("@")[0];
      var sContent = msg.split("@")[1];

      var accounts = db.GetAccounts();
      const orderAcc = accounts.find((acc) => acc.name === accName);
      if (!orderAcc) return;

      if (sContent === "") {
        var data = {
          account: accName,
          orders: [],
        };
        socket.emit(topic, JSON.stringify(data));
        return;
      }

      var items = sContent.split(";");

      var orders = [];
      for (var i = 0; i < items.length; i++) {
        var orderItems = items[i].split(",");

        var ticket = orderItems[0];
        var symbol = orderItems[1];
        var command = orderItems[2];
        var lots = Number.parseFloat(orderItems[3]);
        var open_price = Number.parseFloat(orderItems[4]);

        var order = {
          ticket,
          symbol,
          lots,
          open_price,
          command,
          account: accName,
          alias: orderAcc.alias,
        };

        orders.push(order);

        var data = {
          account: accName,
          orders,
        };
        socket.emit(topic, JSON.stringify(data));
      }

      break;
    case EVENTS.ON_ORDER_RESPONSE:
      var accName = msg.split("@")[0];
      var sRsp = msg.split("@")[1];

      const respAcc = db.GetAccount(accName);
      if (!respAcc) return;
      if (sRsp !== "") {
        var response = {
          account: accName,
          alias: respAcc.alias || "",
          success: sRsp.split(",")[0].toUpperCase() === "TRUE",
          message: sRsp.split(",")[1],
        };
        mainLogger.info(topic + ", " + JSON.stringify(response));
        socket.emit(topic, JSON.stringify(response));
      }
      break;
    case EVENTS.ON_ORDER_COMPLETE: {
      db.RemoveOrderedAccount(msg);
      mainLogger.info(`${topic}, ${msg}`);
      console.log(`${topic}, ${msg}`);
      if (db.GetOrderQueueCount() === 0) {
        mainLogger.info("order queue is empty now, notification to clients");
        console.info("order queue is empty now, notification to clients");
        socket.emit(EVENTS.ON_ORDER_COMPLETE, "IDLE");
      }
      break;
    }

    default:
      break;
  }
};

cron.schedule(`*/${config.ORDER_STATUS_CHECK_CYCLE} * * * * *`, function () {
  checkOrderStatus();
});

let isStarted = false;
let startTime;
let endTime;

const checkOrderStatus = () => {
  const orderCount = db.GetOrderQueueCount();
  if (orderCount === 0) {
    if (isStarted) {
      mainLogger.info("order queue is empty now, notification to clients");
      console.info("order queue is empty now, notification to clients");
      socket.emit(EVENTS.ON_ORDER_COMPLETE, "IDLE");
    }
    isStarted = false;
  } else {
    if (!isStarted) {
      console.log("Order started");
      isStarted = true;
      startTime = Date.now();
    } else {
      endTime = Date.now();
      const stamps = endTime - startTime;
      console.log("Delayed time " + stamps);
      if (stamps >= config.ORDER_WAITING_LIMIT_TIME) {
        isStarted = false;
        console.log("Time Over");
        db.InitOrderQueue();
        mainLogger.info("Forcely initialized order queue");
        console.log("Forcely initialized order queue");
        socket.emit(EVENTS.ON_ORDER_COMPLETE, "IDLE");
      }
    }
  }
};

const subscribeForUser = (user) => {
  mainLogger.info(`sbscribing user: ${user}`);
  subscribeChannel(EVENTS.ON_PRICE_TICK, user);
  subscribeChannel(EVENTS.ON_ACCOUNT, user);
  subscribeChannel(EVENTS.ON_POSLIST, user);
  subscribeChannel(EVENTS.ON_ORDERLIST, user);
  subscribeChannel(EVENTS.ON_ORDER_RESPONSE, user);
  subscribeChannel(EVENTS.ON_RATE, user);
  subscribeChannel(EVENTS.ON_ORDER_COMPLETE, user);
};

const unsubscribeForUser = (user) => {
  mainLogger.info(`unsbscribing user: ${user}`);
  unsubscribeQueue(EVENTS.ON_PRICE_TICK, user);
  unsubscribeQueue(EVENTS.ON_ACCOUNT, user);
  unsubscribeQueue(EVENTS.ON_POSLIST, user);
  unsubscribeQueue(EVENTS.ON_ORDERLIST, user);
  unsubscribeQueue(EVENTS.ON_ORDER_RESPONSE, user);
  unsubscribeQueue(EVENTS.ON_RATE, user);
  unsubscribeQueue(EVENTS.ON_ORDER_COMPLETE, user);
};

module.exports = {
  subscribeForUser,
  unsubscribeForUser,
  unsubscribeQueue,
  subscribeChannel,
  publishMessage,
};
