const axios = require('axios');
const { EmbedBuilder } = require('discord.js');
const blockedChannels = require('../config/blockedChannels.json').blockedChannels;

async function generatorConselho(interaction) {
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
    
    try {
        if (commandName === 'conselho') {
            const response = await axios.get('https://api.adviceslip.com/advice');
            const advice = response.data.slip.advice;

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('💡 Conselho do Dia')
                .setDescription(`"${advice}"`)
                .setTimestamp()
                .setFooter({
                    text: `Pedido por ${interaction.user.username}`,
                    iconURL: interaction.user.displayAvatarURL({ dynamic: true })
                });
    
            await interaction.reply({ embeds: [embed] });
        }


    } catch (error) {
        console.error('Erro ao buscar conselho:', error);

        const embedError = new EmbedBuilder()
            .setColor('#FF0000') 
            .setTitle('Erro ao buscar conselho')
            .setDescription('Desculpe, ocorreu um erro ao tentar buscar um conselho. Tente novamente mais tarde.')
            .setTimestamp();

        await interaction.reply({ embeds: [embedError], ephemeral: true });
    }
};

module.exports = { generatorConselho };
