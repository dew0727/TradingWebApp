const amqp = require("amqplib/callback_api");
const config = require("./config");
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
var io = null;

const Init = (_io) => {
  io = _io;
}

// Receive messages from rabbitmq
amqp.connect(
  `amqp://${userName}:${password}@${rabbitmqHost}`,
  (error0, connection) => {
    if (error0) {
      console.log(0);
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
  channel = chan
};

const subscribeChannel = (topic, username) => {
  if (io == null || channel == null) return;

  channel.assertQueue(
    "System.String, mscorlib_" + topic + username,
    //+ parseInt(Math.random() * 10000, 10).toString()
    queueOptions,
    (error2, q) => {
      if (error2) {
        throw error2;
      }

      console.log(
        " [*] Waiting for messages in %s. To exit press CTRL+C",
        q.queue
      );

      channel.bindQueue(q.queue, exchange, topic);

      channel.consume(
        q.queue,
        (msg) => {
          if (msg.content) {
            if (io != null && io != undefined)
                io.emit(topic, msg.content.toString());
          }
        },
        {
          noAck: true,
        }
      );
    }
  );
};

module.exports = {
  Init,
  subscribeChannel,
};
