const { PresenceUpdateStatus } = require('discord.js');
const { client } = require('../Client');
function status (){    
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
status()
module.exports = { status }