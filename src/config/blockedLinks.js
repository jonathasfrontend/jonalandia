// Expressões regulares para bloqueio
const blockedLinks = [
    /discord\.gg\/\w+/,            // Convites de servidores Discord
    /steamcommunity\.com\/gift-card\/pay\/\d+/  // Links do Steam
];

module.exports = blockedLinks;
