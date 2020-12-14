const USERS = require("./config").USERS;

const authenticate = (username, password) => {
    if (USERS[username] !== undefined) {
      if (USERS[username] == password) return true;
    }

    return false;
};

module.exports = {
  authenticate,
};
