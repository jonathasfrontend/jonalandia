const axios = require('axios');

function getApiUrl() {
    const api = axios.create({
        baseURL: process.env.URL_CONECTION_API_MODERATION_USER,
    });

    return api;
}

module.exports = { getApiUrl };