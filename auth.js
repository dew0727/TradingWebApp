const USERS = require("./config").USERS;

const authenticate = (data) => {
    console.log("user authentication request " + data);
    data = JSON.parse(data);
    const username = data.username;
    const password = data.password;
    if (USERS[username] !== undefined) {
      if (USERS[username] == password) return true;
    }

    return false;
};

module.exports = {
  authenticate,
};
