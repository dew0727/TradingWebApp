const axios = require('axios');

const apiCall = (url, payload, method, callback) => {
    axios.post(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    }).then(res => {
        return callback(res.data);
    }).catch(err => {
        console.log('API failed ' + err);
        callback(err);
    })
}

export { apiCall }