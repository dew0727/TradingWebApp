import socketIOClient from "socket.io-client";
import { SOCKET_ENDPOINT, EVENTS } from "./config-client";
import { Account, Rate, parseRateMsg, parseRatePiece } from "./utils/datatypes";

const createSocket = (parseData) => {
    const sockClient = socketIOClient(SOCKET_ENDPOINT);

  sockClient.on(EVENTS.ON_RATE, (msg) => {
    // var acc = parseRateMsg(msg);
    parseData(EVENTS.ON_RATE, msg);
  });

  sockClient.on(EVENTS.ON_ACCOUNT, (msg) => {
    parseData(EVENTS.ON_ACCOUNT, msg);
  })

  sockClient.on(EVENTS.ON_POSLIST, (msg) => {
    parseData(EVENTS.ON_POSLIST, msg);
  })

  sockClient.on(EVENTS.ON_ORDERLIST, (msg) => {
    parseData(EVENTS.ON_ORDERLIST, msg);
  })
};

export default createSocket;
