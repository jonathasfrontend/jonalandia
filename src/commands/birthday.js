const { EmbedBuilder } = require("discord.js");
const { client } = require("../Client");
const onNotificationBirthdaySchema = require('../models/onNotificationBirthdaySchema');
const blockedChannels = require('../config/blockedChannels');

async function Birthday (interaction){
    if (!interaction.isCommand()) return;

    const { commandName, channelId } = interaction;

    if (commandName === 'birthday') {

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


        const day = interaction.options.getInteger('dia');
        const month = interaction.options.getInteger('mes');
        const userId = interaction.user.id;
        const username = interaction.user.username;

        if (day < 1 || day > 31 || month < 1 || month > 12) {
            return interaction.reply({ content: 'Por favor, insira uma data válida.', ephemeral: true });
        }
        const birthday = await onNotificationBirthdaySchema.findOneAndUpdate(
            { userId },
            { day, month, username },
            { upsert: true, new: true }
        );

        await interaction.reply(`Aniversário salvo: ${day}/${month}`);


    }
}

module.exports = { Birthday };