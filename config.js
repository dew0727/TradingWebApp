const SOCKET_PORT = 4001;
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
}

// registered users
const USERS = {
    'testuser0523@proton.com': 'test',
    'testuser1': 'testpass123',
    'testuser2': 'testpass123',
    'testuser3': 'testpass123',
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
