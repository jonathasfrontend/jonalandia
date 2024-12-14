const { EmbedBuilder } = require('discord.js');
const { client } = require("../Client");
const blockedChannels = require('../config/blockedChannels.json').blockedChannels;

const axios = require('axios');
const { saveUpdateUserPoints } = require('../utils/saveUpdateUserPoints');

async function generatorMemes(interaction) {
    if (!interaction.isCommand()) return;
    
    const { commandName, channelId } = interaction;

    if (blockedChannels.includes(channelId)) {
        const embed = new EmbedBuilder()
            .setColor('Red')
            .setAuthor({
                name: client.user.username,
                iconURL: client.user.displayAvatarURL({ dynamic: true }),
            })
            .setTitle("Este comando não pode ser usado neste canal")
            .setDescription('Vá ao canal <#1253377239370698873> para executar os comandos')
            .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
            .setTimestamp()
            .setFooter({ text: `Por: ${client.user.tag}`, iconURL: client.user.displayAvatarURL({ dynamic: true }) });
        await interaction.reply({ embeds: [embed], ephemeral: true });
        return;
    }
    try {
        const response = await axios.get("https://api.apileague.com/retrieve-random-meme?keywords=rocket", {
            headers: { 'x-api-key': "512024cecc9e49cc8a798ed85d833b1f" }
        });

        if (commandName === 'memes') {
            const memeData = await response.data;
    
            if (memeData) {
                const memeEmbed = new EmbedBuilder()
                    .setColor('#FFFFFF')
                    .setTitle(memeData.description)
                    .setImage(memeData.url)
                    .setFooter({ text: 'Aqui está seu meme!' });
    
                await interaction.reply({ embeds: [memeEmbed] });
            } else {
                await interaction.reply('Ocorreu um erro ao buscar o meme. Tente novamente mais tarde.');
            }
        }

        saveUpdateUserPoints(interaction.user, 100, 90, 1);

    } catch (error) {
        console.error('Erro ao obter meme:', error.message);
        return null;
    }
}

module.exports = { generatorMemes };