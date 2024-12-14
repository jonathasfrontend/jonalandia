const { EmbedBuilder } = require("discord.js");
const { client } = require("../Client");
const onNotificationBirthdaySchema = require('../models/onNotificationBirthdaySchema');
const blockedChannels = require('../config/blockedChannels.json').blockedChannels;
const { info, erro } = require('../Logger');
const { saveUpdateUserPoints } = require("../utils/saveUpdateUserPoints");

async function Birthday (interaction){
    const { commandName, channelId } = interaction;

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
    

    if (commandName === 'birthday') {

        const day = interaction.options.getInteger('dia');
        const month = interaction.options.getInteger('mes');
        const userId = interaction.user.id;
        const username = interaction.user.username;

        if (day < 1 || day > 31 || month < 1 || month > 12) {
            return interaction.reply({ content: 'Por favor, insira uma data válida.', ephemeral: true });
        }
        
        const birthday = new onNotificationBirthdaySchema({
            userId,
            name: username,
            day,
            month,
        });
        
        await birthday.save();

        await interaction.reply(`Aniversário salvo: ${day}/${month}`);
        info.info(`Aniversário salvo: ${day}/${month} para ${username}`);

        saveUpdateUserPoints(interaction.user, 10, 5, 1);

    }
}

module.exports = { Birthday };