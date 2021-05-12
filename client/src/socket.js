import socketIOClient from "socket.io-client";
import { SOCKET_ENDPOINT, EVENTS } from "./config-client";

const createSocket = (parseData, token) => {
  const sockClient = socketIOClient(SOCKET_ENDPOINT, {
    auth: {
      token: token,
    },
  });

  sockClient.on("connect_error", (err) => {
    console.log(err.message);

    if (err.message === "Failed authentication") {
      window.location.href = "/";
    }
  });

  sockClient.on(EVENTS.ON_RATE, (msg) => {
    // var acc = parseRateMsg(msg);
    parseData(EVENTS.ON_RATE, msg);
  });

  sockClient.on(EVENTS.ON_ACCOUNT, (msg) => {
    parseData(EVENTS.ON_ACCOUNT, msg);
  });

  sockClient.on(EVENTS.ON_POSLIST, (msg) => {
    parseData(EVENTS.ON_POSLIST, msg);
  });

  sockClient.on(EVENTS.ON_ORDERLIST, (msg) => {
    parseData(EVENTS.ON_ORDERLIST, msg);
  });

  sockClient.on(EVENTS.ON_ORDER_RESPONSE, (msg) => {
    parseData(EVENTS.ON_ORDER_RESPONSE, msg);
  });

  sockClient.on(EVENTS.ON_STATUS, (msg) => {
    parseData(EVENTS.ON_STATUS, msg);
  });

  sockClient.on(EVENTS.ON_USER_SETTINGS, (msg) => {
    parseData(EVENTS.ON_USER_SETTINGS, msg);
  });

  sockClient.on(EVENTS.ON_USER_LOGIN, (msg) => {
    parseData(EVENTS.ON_USER_LOGIN, msg);
  });
};

export default createSocket;
