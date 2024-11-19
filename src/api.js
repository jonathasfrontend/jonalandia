const axios = require('axios');
const { info, erro } = require('./logger');

function getApiUrl() {
    const api = axios.create({
        baseURL: process.env.URL_CONECTION_API_MODERATION_USER,
    });

    return api;
}

async function testApiConnection() {
    const api = getApiUrl();

    try {
        // Testa a conexão com uma chamada simples à API
        const response = await api.get('/');
        info.info('Conexão com a API bem-sucedida:', response.statusText);
    } catch (error) {
        // Verifica o tipo de erro e exibe uma mensagem apropriada
        if (error.code === 'ECONNABORTED') {
            erro.error('Erro: Tempo de conexão excedido. Verifique a disponibilidade da API.');
        } else if (error.response) {
            // Erros relacionados à resposta HTTP (4xx, 5xx)
            erro.error(`Erro na API: ${error.response.status} - ${error.response.statusText}`);
        } else if (error.request) {
            // Erros relacionados à ausência de resposta
            erro.error('Erro: A API não respondeu. Verifique sua conexão com a internet ou a URL da API.');
        } else {
            // Outros erros
            erro.error('Erro inesperado ao conectar com a API:', error.message);
        }
    }
}

// module.exports = { getApiUrl };
module.exports = { getApiUrl, testApiConnection };
