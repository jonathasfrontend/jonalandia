const { EmbedBuilder } = require('discord.js');
const User = require('../models/rankingUserSechema');
const { client } = require("../Client");
const { erro, info } = require('../Logger');
const blockedChannels = require('../config/blockedChannels.json').blockedChannels;

async function Perfil(interaction){

    const { commandName, channelId, options } = interaction;

    if (!interaction.isCommand()) return;

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
        if (commandName === 'perfil') {
            const userId = options.getUser('usuario');
            const userData = await User.findOne({ username: userId.username });

            if (!userData) {
                return interaction.reply({ content: 'Você ainda não um perfil.', ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle(`Perfil de ${userData.username}`)
                .addFields(
                { name: 'XP', value: `${userData.xp}`, inline: true },
                { name: 'Moedas', value: `${userData.coins}`, inline: true },
                { name: 'Gemas', value: `${userData.gems}`, inline: true }
                )
                .setThumbnail(userData.avatarUrl)
                .setFooter({ text: 'Continue participando para ganhar mais pontos!' });

            interaction.reply({ embeds: [embed] });
        }
    } catch (error) {

    }
}

module.exports = { Perfil };