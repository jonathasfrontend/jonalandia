const axios = require('axios');
const { EmbedBuilder } = require('discord.js');
const { erro } = require('../Logger');
const { saveUpdateUserPoints } = require('../utils/saveUpdateUserPoints');
const { checkingComandChannelBlocked } = require('../utils/checkingComandsExecution');

async function generatorConselho(interaction) {
    const { commandName } = interaction;

    if (!interaction.isCommand()) return;

    const authorizedExecutionComand = await checkingComandChannelBlocked(interaction);
    if (!authorizedExecutionComand) return;
    
    try {
        if (commandName === 'conselho') {
            const response = await axios.get('https://api.adviceslip.com/advice');
            const advice = response.data.slip.advice;

            const embed = new EmbedBuilder()
                .setColor('#FFFFFF')
                .setTitle('💡 Conselho do Dia')
                .setDescription(`"${advice}"`)
                .setTimestamp()
                .setFooter({
                    text: `Pedido por ${interaction.user.username}`,
                    iconURL: interaction.user.displayAvatarURL({ dynamic: true })
                });
    
            await interaction.reply({ embeds: [embed] });
        }

        saveUpdateUserPoints(interaction.user, 100, 90, 1);

    } catch (error) {
        erro.error('Erro ao buscar conselho:', error);

        const embedError = new EmbedBuilder()
            .setColor('#FF0000') 
            .setTitle('Erro ao buscar conselho')
            .setDescription('Desculpe, ocorreu um erro ao tentar buscar um conselho. Tente novamente mais tarde.')
            .setTimestamp();

        await interaction.reply({ embeds: [embedError], ephemeral: true });
    }
};

module.exports = { generatorConselho };
