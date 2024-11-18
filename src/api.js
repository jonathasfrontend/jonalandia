const axios = require('axios');

function getApiUrl() {
    const api = axios.create({
        baseURL: 'https://jonalandia-server.vercel.app',
    });

    return api;
}

module.exports = { getApiUrl };