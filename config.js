const SOCKET_PORT = 3000;
const RABBITMQ_HOST = "localhost";
const RABBITMQ_USERNAME = "localhost";
const RABBITMQ_PASSWORD = "localhost";
const EXCHANGE_NAME = "System.String, mscorlib";

// event names
const EVENTS = {
    ON_CONNECTION: 'connection',
    ON_DISCONNECT: 'disconnect',
    ON_RATE: 'RATE',
    ON_POSLIST: 'POSLIST',
    ON_ORDERLIST: 'ORDERLIST',
    ON_ACCOUNT: 'ACCOUNT',
    ON_PRICE_TICK: 'FAT_PRICE_TICK',
    ON_ORDER_RESPONSE: 'ORDER_RESPONSE',
    ON_ORDER_REQUEST: 'ORDER_REQUEST',
    ON_LOG: 'FAT_LOG',
    ON_STATUS: 'ACCOUNT_STATUS',
    ON_USER_SETTINGS: 'USER_SETTINGS',
    ON_USER_LOGIN: 'USER_LOGIN',
    ON_GLOBAL_SETTINGS: 'GLOBAL_SETTINGS',

    ON_ORDER_COMPLETE: 'ORDER_COMPLETE_STATUS',
}

// registered users
const USERS = {
    'admin': 'pass',
}

module.exports = {
    SOCKET_PORT,
    RABBITMQ_HOST,
    RABBITMQ_USERNAME,
    RABBITMQ_PASSWORD,
    EXCHANGE_NAME,
    EVENTS,
    USERS,
};
