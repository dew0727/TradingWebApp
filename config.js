const SOCKET_PORT = 4001;
const RABBITMQ_HOST = "localhost";
const RABBITMQ_USERNAME = "webview";
const RABBITMQ_PASSWORD = "webview";
const EXCHANGE_NAME = "System.String, mscorlib";

// event names
const EVENTS = {
    ON_CONNECTION: 'connection',
    ON_DISCONNECT: 'disconnect',
    ON_SET_PARAM: 'FAT_PARAM_V2C',
    ON_GET_PARAM: 'FAT_PARAM_C2V',
    ON_VARIABEL: 'FAT_VARIABLE',
    ON_POSITIONS: 'FAT_POSITIONS',
    ON_POSHISTORY: 'FAT_POSHISTORY',
    ON_LOG: 'FAT_LOG',
    ON_ACCOUNT: 'FAT_ACCOUNT',
    ON_PRICE_TICK: 'FAT_PRICE_TICK',
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
