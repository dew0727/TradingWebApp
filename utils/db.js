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

const AddAccount = (account) => {

  var bExists = accounts.find(x => x.name === account.name ? true : false);

  if (bExists) {
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

const DeleteAccount = (broker, number) => {
  accounts = accounts.filter(acc => acc.broker !== broker && acc.number != number);

  SaveAccountsData();
}

const GetAccounts = () => {
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
      
      if (x.time - curTime >= 30 * 1000) {
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
  console.log(data);
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
  GetAccount,
  DeleteAccount,
  UpdateAccountStatus,  
  GetAccountStatus,
  SetPriceFeed,
  GetPriceFeed,
}
