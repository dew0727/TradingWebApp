const crypto = require('crypto');
const db = require("./utils/db");

const generateAuthToken = () => {
  return crypto.randomBytes(30).toString('hex');
}

const authenticate = ( { username, password, token }) => {

  const auth = db.GetAuthToken({ username, password, token});

  console.log("Authenticate Result: ", auth);

  // if authenticate failed
  if (!auth.email)
    return { success: false, token}

  // if the user new login with password, then it should be stored token
  if (!token) {
    const authToken = generateAuthToken();
    console.log("Generated new token ", authToken);
    db.SetAuthToken(username, authToken);
    return { success: true, ...auth, token: authToken }  
  }

  return {success: true, ...auth}
};

module.exports = {
  authenticate,
  generateAuthToken,
};
