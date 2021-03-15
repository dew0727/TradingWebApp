const fs = require("fs");

const DB_PATH_ACCOUNT = "./db/accounts.json";
const DB_PATH_PRICE_FEED = "./db/priceFeed.json";
const DB_PATH_USERS = "./db/users.json";

let accounts = [];
let accountStatus = [];
let priceFeed = "";
let users = {};

const Init = () => {
  LoadAccountsData();
  LoadPriceFeed();
  LoadUsersData();

  if (accounts.Length == 0) accountStatus = [];
  else {
    accountStatus = accounts.map((x) => {
      return {
        name: x.name,
        status: false,
        time: Date.now(),
      };
    });
  }

  console.log("accounts", accounts);
  console.log("status", accountStatus);
};

const UpdateAccount = (account) => {
  if (accounts.length < 1) LoadAccountsData();
  const prev = accounts.find((x) => x.name === account.name);

  if (prev) {
    prev.basket = account.basket;
    prev.default = account.default;

    accounts = accounts.map((acc) => {
      return acc.name === account.name ? prev : acc;
    });

    SaveAccountsData();

    return {
      success: true,
      error: "Account updated.",
    };
  }

  return {
    success: false,
    error: `Account doesn't exists with name ${account.name}.`,
  };
};

const AddAccount = (account) => {
  var prev = accounts.find((x) => (x.name === account.name ? true : false));

  if (prev) {
    return {
      success: false,
      error: "Account with same broker and number already exists.",
    };
  }
  accounts.push(account);

  SaveAccountsData();

  return {
    success: true,
    error: "",
  };
};

const DeleteAccount = (accountName) => {
  accounts = accounts.filter((acc) => acc.name !== accountName);

  SaveAccountsData();
};

const GetAccounts = () => {
  if (accounts === undefined || accounts.length < 1) {
    LoadAccountsData();
  }

  return accounts;
};

const GetAccount = (accName) => {
  return accounts.find((acc) => acc.name === accName);
};

const LoadAccountsData = () => {
  if (!fs.existsSync(DB_PATH_ACCOUNT)) {
    accounts = [];
    return;
  }
  const sData = fs.readFileSync(DB_PATH_ACCOUNT);
  if (sData.toString() === "") return [];
  accounts = JSON.parse(sData);
};

const SaveAccountsData = () => {
  fs.writeFileSync(DB_PATH_ACCOUNT, JSON.stringify(accounts));
};

const GetAccountStatus = (accName) => {
  const accStatus = accountStatus.find((acc) => acc.name === accName);
  return accStatus ? accStatus.status : false;
};

const UpdateAccountStatus = (name, status) => {
  accountStatus = accountStatus.map((x) => {
    var curTime = Date.now();
    if (x.name === name) {
      return {
        ...x,
        status,
        time: curTime,
      };
    } else {
      if (curTime - x.time >= 30 * 1000) {
        return {
          ...x,
          status: false,
        };
      } else {
        return x;
      }
    }
  });
};

const SetPriceFeed = (feed) => {
  priceFeed = feed;
  var data = { feed };
  data = JSON.stringify(data);
  fs.writeFileSync(DB_PATH_PRICE_FEED, data);
};

const LoadPriceFeed = () => {
  if (!fs.existsSync(DB_PATH_PRICE_FEED)) {
    priceFeed = "";
    return;
  }
  var data = fs.readFileSync(DB_PATH_PRICE_FEED);
  if (data.toString() === "{}" || data.toString() == "") return "";
  data = JSON.parse(data);
  priceFeed = data.feed;
};

const GetPriceFeed = () => {
  return priceFeed;
};

/**
 * User managment
 */
const LoadUsersData = () => {
  console.log("Loading user data from file");
  if (!fs.existsSync(DB_PATH_USERS)) {
    console.log("no user data file");
    users = [];
    return;
  }

  const sData = fs.readFileSync(DB_PATH_USERS);
  if (sData.toString() === "") {
    users = [];
    return [];
  }
  users = JSON.parse(sData);
};

const SaveUsersData = () => {
  fs.writeFileSync(DB_PATH_USERS, JSON.stringify(users));
};

const SetAuthToken = (username, authToken) => {
  if (!authToken) return null;

  users.forEach((user) => {
    if (user.email === username) {
      user.token = authToken;
      console.log("Save token for user", user.email, authToken);
      SaveUsersData();
    }
  });

  return authToken;
};

const GetAuthToken = ({ username, password, token }) => {
  console.log("Authenticating start with ", username, password, token);
  let result = {};

  if (token !== undefined) {
    console.log("Authenticating with token: " + token);
    users.forEach((user) => {
      if (user.token == token)
        Object.assign(result, { email: user.email, token, role: user.role });
    });
  } else {
    console.log("Authenticating with email and password", username, password);
    if (username !== undefined && password !== undefined) {
      users.forEach((user) => {
        if (user.email.toString() == username.toString()) {
          Object.assign(result, { email: user.email, token, role: user.role });
        }
      });
    }
  }

  return result;
};

module.exports = {
  Init,
  AddAccount,
  GetAccounts,
  UpdateAccount,
  GetAccount,
  DeleteAccount,
  UpdateAccountStatus,
  GetAccountStatus,
  SetPriceFeed,
  GetPriceFeed,
  SetAuthToken,
  GetAuthToken,
};
