const axios = require("axios");

const saveAuth = (user, password, token) => {
  localStorage.setItem("username", user);
  localStorage.setItem("password", password);
  localStorage.setItem("authToken", token);
};

const removeAuth = () => {
  localStorage.removeItem("username");
  localStorage.removeItem("password");
  localStorage.removeItem("authToken");
};

const authenticate = (res) => {
  console.log("authenticate: " + res.auth);
  if (res.auth !== undefined && res.auth === true) {
    saveAuth(res.user, res.pass, res.token);
    return true;
  } else {
    removeAuth();
    return false;
  }
};

const apiCall = (url, payload, method, callback) => {
  axios
    .post(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
    .then((res) => {
      console.log("response: ", res.data);
      callback(res.data);
    })
    .catch((err) => {
      console.log("API failed " + err);
    });
};

export { apiCall, saveAuth, authenticate };
