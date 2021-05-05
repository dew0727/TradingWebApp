const axios = require("axios");
const { encrypt, decrypt } = require("./crypto");

// define constants
const TOKEN = "twpAuthToken";
const ROLE = "twpRole";
const REMEMBER_ME = "twpEnableRememberMe";

const saveCredential = ({ usr, pwd }) => {
  localStorage.setItem("temp-2", encrypt("const error", usr));
  localStorage.setItem("temp-1", encrypt("const error", pwd));
};

const getCredential = () => {
  if (rememberState()) {
    return {
      user: decrypt("const error", localStorage.getItem("temp-2")),
      pwd: decrypt("const error", localStorage.getItem("temp-1")),
    };
  }

  return { user: "", pwd: "" };
};

const rememberState = () => {
  const state = localStorage.getItem(REMEMBER_ME);
  return state === "true";
};

const setRememberState = (checked) => {
  localStorage.setItem(REMEMBER_ME, checked);
};

const saveAuth = (token, role) => {
  localStorage.setItem(TOKEN, token);
  localStorage.setItem(ROLE, role);
};

const removeAuth = () => {
  localStorage.removeItem(TOKEN);
  localStorage.removeItem(ROLE);
  localStorage.removeItem("temp-2")
  localStorage.removeItem("temp-1")
};

const getAuth = () => {
  return {
    token: localStorage.getItem(TOKEN),
    role: localStorage.getItem(ROLE),
  };
};

const authenticate = (res) => {
  console.log("Auth Result: ", res);
  if (res.auth !== undefined && res.auth === true) {
    saveAuth(res.token, res.role);
    return true;
  } else {
    removeAuth();
    return false;
  }
};

const apiCall = (url, payload, method, callback) => {
  if (url !== "/api/login")
    payload = { ...payload, ...getAuth() };
    
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

const Logout = () => {
  apiCall("/api/logout", {}, "POST", (res) => {
    if (res.success === true) {
      console.log(res);
    }
  });

  if (!rememberState()) removeAuth();
  window.location.href = "/";
};

export {
  apiCall,
  saveAuth,
  authenticate,
  Logout,
  getAuth,
  removeAuth,
  rememberState,
  setRememberState,
  saveCredential,
  getCredential,
};
