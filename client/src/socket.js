import socketIOClient from "socket.io-client";
import { SOCKET_ENDPOINT, EVENTS } from "./config-client";
import { Account, Rate, parseRateMsg, parseRatePiece } from "./utils/datatypes";

const createSocket = (parseData) => {
  console.log("parseData", parseData);
  const sockClient = socketIOClient(SOCKET_ENDPOINT);

  sockClient.on(EVENTS.ON_RATE, (msg) => {
    var acc = parseRateMsg(msg);
    parseData(EVENTS.ON_RATE, {
      rateInfo: acc.getRateInfo(),
      symbols: acc.symbols,
    });
  });
};

export default createSocket;
