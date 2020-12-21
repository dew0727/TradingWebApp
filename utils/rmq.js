const amqp = require("amqplib/callback_api");
const { socket }  = require("./socket");
const { EVENTS } = require("../config");
const config = require("../config");
const db = require("./db");

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
  console.log("publish msg", topic, sMsg);
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
      var accName = msg.split('@')[0];
      if (accName !== db.GetPriceFeed())
        return;
      
      var rates = {};
      var rateMsgs = msg.split('@')[1].split(';');
      for (var i = 0; i < rateMsgs.length; i++){
        var rateItems = rateMsgs[i].split(',');

        var symbol = rateItems[0];
        var bid = Number.parseFloat(rateItems[1]);
        var ask = Number.parseFloat(rateItems[2]);
        var time = rateItems[3];

        var rate = {
          symbol,
          bid,
          ask,
          time
        }

        rates = {
          [symbol]: rate,
          ...rates,
        };
      }
      
      socket.emit(topic, JSON.stringify(rates));
      break;
    case EVENTS.ON_ACCOUNT:
      console.log(topic, msg);
      var accName = msg.split('@')[0];

      var accounts = db.GetAccounts();
      if (!accounts.some(acc => acc.name === accName))
      return;
      
      db.UpdateAccountStatus(accName, true);
      var items = msg.split('@')[1].split(',');
      
      var account = db.GetAccount(accName);    
      if (account === undefined)
      return;
      
      var status = db.GetAccountStatus(accName);
      
      var balance = items[1];
      var margin = Number.parseFloat(items[2]);
      var equity = Number.parseFloat(items[3]);
      var profit = (equity - balance).toFixed(2);
      var accountInfo = {
        key: accName,
        name: accName,
        currency: items[0],
        balance,
        margin,
        profit,
        equity,
        basket: account.basket ? account.basket : false,
        default: account.default ? account.default : 1,
        time: Date.now()
      }
      
      socket.emit(topic, JSON.stringify(accountInfo));      
      break;
    case EVENTS.ON_POSLIST:
      console.log(topic, msg);
      var accName = msg.split('@')[0];
      var sContent = msg.split('@')[1];

      if (sContent === "") {
        var data = { account: accName, positions: [] };
        socket.emit(topic, JSON.stringify(data));
        return;
      }
        
      var items = sContent.split(';');

      var positions = [];
      var total_profit = 0;
      for (var i = 0; i < items.length; i++) {
        var posItems = items[i].split(',');
        
        var symbol = posItems[0];
        var lots = Number.parseFloat(posItems[1]);
        var open_price = Number.parseFloat(posItems[2]).toFixed(5);        
        var swap = Number.parseFloat(posItems[3]);
        var profit = Number.parseFloat(posItems[4]);
        total_profit += profit;
        var posCount = Number.parseFloat(posItems[5]);
        var current_price = Number.parseFloat(posItems[6]);
          
        var position = {
          symbol,
          lots,
          open_price,
          current_price,
          profit,
          swap,
          total_profit: 0,
          account: accName
        };

        positions.push(position);
      
      }
      
      total_profit = total_profit.toFixed(2);
      positions = positions.map(pos => {
        pos.total_profit = total_profit
        return pos;
      })
      
      var data = { account: accName, positions };
      socket.emit(topic, JSON.stringify(data));
      
      break;
    case EVENTS.ON_ORDERLIST:
      console.log(topic, msg);
      var accName = msg.split('@')[0];
      var sContent = msg.split('@')[1];
      if (sContent === "") {
        var data = {
          account: accName,
          orders: [],
        }
        socket.emit(topic, JSON.stringify(data));
        return;
      }
        
      var items = sContent.split(';');
      
      var orders = [];
      for (var i = 0; i < items.length; i++) {        
        var orderItems = items[i].split(',');

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
        };

        orders.push(order);

        var data = {
          account: accName,
          orders,
        }
        socket.emit(topic, JSON.stringify(data));
      }
      
      break;
    case EVENTS.ON_ORDER_RESPONSE:
      console.log(topic, msg);
      var accName = msg.split('@')[0];
      var sRsp = msg.split('@')[1];
      
      if (sRsp !== "") {
        var response = {
          account: accName,
          success: sRsp.split(',')[0] === "True",
          message: sRsp.split(',')[1],
        };
        socket.emit(topic, JSON.stringify(response));
      }

    default:
      break;
  }
}

module.exports = {
  subscribeChannel,
  publishMessage
};
