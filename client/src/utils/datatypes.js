class Rate {
  constructor(symbol, ask, bid) {
    this.symbol = symbol;
    this.ask = ask;
    this.bid = bid;
  }
}

class Account {
  constructor(accountName) {
    this.lastPingTime = Date.now();
    this.broker = "";
    this.accountNum = 0;
    this.accName = accountName;
    this.symbols = [];
    this.rates = {};
    this.balance = 0;
    this.equity = 0;
    this.profit = 0;
    this.defaultLots = 1;
    this.basketOnOff = false;
  }

  updateRate = (rate) => {
    if (rate.symbol in this.symbols) {
    } else {
        this.symbols.push(rate.symbol);
    }
    this.rates[rate.symbol] = rate;
  };

  getRateInfo = () => {
    var obj = {};
    obj[this.accName] = this.rates;
    return obj;
  };
}

const parseRateMsg = (msg) => {
  var parseData = msg.split("@");
  const accName = parseData[0];
  parseData = parseData[1].split(";");

  var account = new Account(accName);

  parseData.forEach((element) => {
    var rate = parseRatePiece(element);
    account.updateRate(rate);
  });

  return account;
};

const parseRatePiece = (msg) => {
  var vals = msg.split(",");
  var rate = {symbol: vals[0], bid: vals[1], ask: vals[2]};
  return rate;
};

export { Rate, Account, parseRateMsg, parseRatePiece };
