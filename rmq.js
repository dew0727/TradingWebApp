// queue options
const queueOptions = {
  exclusive: false,
  durable: false,
  expires: 600000,
};

const subscribeChannel = (io, channel, topic, username, exchange) => {
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
            //console.log(" %s : %s", topic, msg.content.toString());
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
  subscribeChannel,
};
