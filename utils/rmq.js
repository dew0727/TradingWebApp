const amqp = require("amqplib/callback_api");
const { socket }  = require("./socket");
const { EVENTS } = require("../config");
const config = require("../config");
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

const publishMessage = (topic, sMsg) =>{
  channel.publish(exchange, topic, Buffer.from('"' + sMsg + '"'),
    {
      deliveryMode: 2,
      type: exchange,
    });
  
  console.log(sMsg);
}

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

      console.log(
        " [*] Waiting for messages in %s. To exit press CTRL+C",
        q.queue
      );

      channel.bindQueue(q.queue, exchange, topic);

      channel.consume(
        q.queue,
        (msg) => {
          if (msg.content) {
            var str = msg.content.toString().replace('\"', '');
            str = str.replace('\"', '');
            //console.log(topic, str);
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
  switch(topic)
  {
    case EVENTS.ON_RATE:
      socket.emit(topic, msg);
      break;
    default:
      break;
  }
}

module.exports = {
  subscribeChannel,
  publishMessage
};
