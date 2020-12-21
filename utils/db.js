const fs = require('fs');

const DB_PATH_ACCOUNT = "./db/accounts.json";
const DB_PATH_PRICE_FEED = "./db/priceFeed.json";

let accounts = [] ;
let accountStatus = [];
let priceFeed = "";

const Init = () => {
  LoadAccountsData();
  LoadPriceFeed();

  if (accounts.Length == 0)
    accountStatus = [];
  else {
    accountStatus = accounts.map(x => {
      return {
        name: x.name,
        status: false,
        time: Date.now()
      }
    })
  }

  console.log("accounts", accounts);
  console.log("status", accountStatus);
}

const UpdateAccount = (account) => {
  if (accounts.length < 1) LoadAccountsData();
  const prev = accounts.find(x => x.name === account.name);

  if (prev) {
    prev.basket = account.basket;
    prev.default = account.default;
  
    accounts = accounts.map((acc) => {
      return acc.name === account.name ? prev : acc
    });

    SaveAccountsData();

    return {
      success: true,
      error: "Account updated."
    }
  }

  return {
    success: false,
    error: `Account doesn't exists with name ${account.name}.`
  }
}

const AddAccount = (account) => {

  var prev = accounts.find(x => x.name === account.name ? true : false);

  if (prev) {
    return {
      success: false,
      error: "Account with same broker and number already exists."
    }
  }
  accounts.push(account);

  SaveAccountsData();

  return {
    success: true,
    error: ""
  }
}

const DeleteAccount = (accountName) => {
  accounts = accounts.filter(acc => acc.name !== accountName);

  SaveAccountsData();
}

const GetAccounts = () => {
  if (accounts === undefined || typeof accounts !== Array || accounts.length < 1)
    LoadAccountsData();
    
  return accounts;
}

const GetAccount = (accName) => {
  return accounts.find(acc => acc.name === accName);
}

const LoadAccountsData = () => {
 
  // fs.exists(DB_PATH, (bExist) => {
  //   if (!bExist) {
  //     accounts = [];
  //   }
  // });

  const sData = fs.readFileSync(DB_PATH_ACCOUNT);
  if (sData === "")
    return [];
  accounts = JSON.parse(sData);
}

const SaveAccountsData = () => {
  fs.writeFileSync(DB_PATH_ACCOUNT, JSON.stringify(accounts));
}


const GetAccountStatus = (accName) => {
  console.log("account status: ", accountStatus, accName);
  return accountStatus.find(acc => acc.name ===accName).status;
}

const UpdateAccountStatus = (name, status) => {
  accountStatus = accountStatus.map(x => {
    
    var curTime = Date.now();
    if (x.name === name) {
      return {
        ...x,
        status,
        time: curTime
      }    
    } else {
      if (curTime - x.time >= 30 * 1000) {
        return {
          ...x,
          status: false,
        }
      } else {
        return x;
      }
    }
  });
}

const SetPriceFeed = (feed) => {
  priceFeed = feed;
  var data = { feed };
  data = JSON.stringify(data);
  fs.writeFileSync(DB_PATH_PRICE_FEED, data);
}

const LoadPriceFeed = () => {
  var data = fs.readFileSync(DB_PATH_PRICE_FEED);
  if (data === "{}")
    return "";
  data = JSON.parse(data);  
  priceFeed = data.feed;  
}

const GetPriceFeed = () => {
  return priceFeed;
}

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
}
