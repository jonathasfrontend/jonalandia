const { PresenceUpdateStatus } = require('discord.js');
const { client } = require('../Client');
function Status (){    
    client.user.setPresence({
        activities: [
            {
                name: ' | Jonalandia The Games',
                status: PresenceUpdateStatus.Online,
                url: 'https://github.com/jonathasfrontend',

            }
        ]
    });
}
module.exports = { Status }