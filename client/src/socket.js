import socketIOClient from "socket.io-client";
import { SOCKET_ENDPOINT, EVENTS } from "./config-client";

const createSocket = (parseData) => {
  const sockClient = socketIOClient(SOCKET_ENDPOINT);

  sockClient.on(EVENTS.ON_PRICE_TICK, (msg) => parseData(msg));
};

const processMsgTickPrice = (msg) => {
  console.log("Tick Price: " + msg);
};

export default createSocket;
