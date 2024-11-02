const blockedLinks = [
    /discord\.gg\/\w+/,                              // Links de convite do Discord
    /steamcommunity\.com\/gift-card\/pay\/\d+/,      // Links de gift card do Steam
    /(?:https?:\/\/)?(?:www\.)?facebook\.com\/\w+/,  // Links do Facebook
    /(?:https?:\/\/)?(?:www\.)?instagram\.com\/\w+/, // Links do Instagram
    /(?:https?:\/\/)?(?:www\.)?twitter\.com\/\w+/,   // Links do Twitter
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/\w+/,   // Links do YouTube
    /(?:https?:\/\/)?(?:www\.)?twitch\.tv\/\w+/,     // Links do Twitch
    /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/\w+/,    // Links do TikTok
    /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/\w+/   // Links do LinkedIn
];

module.exports = blockedLinks;
