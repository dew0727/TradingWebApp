const axios = require("axios");

// define constants
const TOKEN = "twpAuthToken";
const ROLE = "twpRole";
const REMEMBER_ME='twpEnableRememberMe';

const rememberState = () => {
  const state =  localStorage.getItem(REMEMBER_ME)
  console.log('remember state: ', state)
  return state === 'true'
}

const setRememberState = (checked) => {
  localStorage.setItem(REMEMBER_ME, checked)
}

const saveAuth = (token, role) => {
  localStorage.setItem(TOKEN, token);
  localStorage.setItem(ROLE, role);
};

const removeAuth = () => {
  localStorage.removeItem(TOKEN);
  localStorage.removeItem(ROLE);
};

const getAuth = () => {
  return {
    token: localStorage.getItem(TOKEN),
    role: localStorage.getItem(ROLE),
  };
}

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
  payload = {...payload, ...getAuth()};
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

  if (!rememberState())
    removeAuth();
  window.location.href = "/";
};

export { apiCall, saveAuth, authenticate, Logout, getAuth, removeAuth, rememberState, setRememberState };
