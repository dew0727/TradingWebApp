const express = require("express");
const bodyParser = require('body-parser');
const http = require("http");
const config = require("./config");
const socketIO = require("socket.io");
const amqp = require("amqplib/callback_api");
const rmq = require('./rmq');
const auth = require('./auth');

// set config
const port = config.SOCKET_PORT || 4001;
const rabbitmqHost = config.RABBITMQ_HOST;
const exchange = config.EXCHANGE_NAME;
const userName = config.RABBITMQ_USERNAME;
const password = config.RABBITMQ_PASSWORD;

const app = express();
app.use(bodyParser.json());

// server instance
const server = http.createServer(app);

const io = socketIO(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// queue options
const queueOptions = {
  exclusive: false,
  durable: false,
  expires: 600000,
};

const EVENTS = config.EVENTS;

io.on(EVENTS.ON_CONNECTION, (socket) => {
  console.log("Socket User connected");

  socket.on(EVENTS.ON_DISCONNECT, () => {
    console.log("Socket User Disconnected");
  });
});

// Receive messages from rabbitmq
amqp.connect(
  `amqp://${userName}:${password}@${rabbitmqHost}`,
  (error0, connection) => {
    if (error0) {
      console.log(0);
      throw error0;
    }
    connection.createChannel((error1, channel) => {
      if (error1) {
        throw error1;
      }

      channel.assertExchange(exchange, "topic", {
        durable: true,
      });

      rmq.subscribeChannel(io, channel, EVENTS.ON_PRICE_TICK, userName, exchange);
      //rmq.subscribeChannel(io,channel, EVENTS.ON_SET_PARAM, userName, exchange);
      //rmq.subscribeChannel(io,channel, EVENTS.ON_GET_PARAM, userName, exchange);
      //rmq.subscribeChannel(io,channel, EVENTS.ON_VARIABEL, userName, exchange);
      //rmq.subscribeChannel(io,channel, EVENTS.ON_POSITIONS, userName, exchange);
      //rmq.subscribeChannel(io,channel, EVENTS.ON_POSHISTORY, userName, exchange);
      //rmq.subscribeChannel(io,channel, EVENTS.ON_LOG, userName, exchange);
      //rmq.subscribeChannel(io,channel, EVENTS.ON_ACCOUNT, userName, exchange);
      //rmq.subscribeChannel(io,channel, EVENTS.ON_PRICE_TICK, userName, exchange);
    });
  }
);

// http login
app.post('/api/login', (req, res) => {
  const result = auth.authenticate(req.body.body);
  console.log("auth result: " + result);
  res.json({auth: result});
});

server.listen(port, () => console.log(`Listening on port ${port}`));