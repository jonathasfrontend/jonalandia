const { EmbedBuilder } = require('discord.js');
const { client } = require("../Client");
const { Logger, botEvent } = require('../logger');
const Sorteio = require('../models/onSorteioSchema')
const Premio = require('../models/onPremioSorteioSchema');
const { checkingComandChannelBlocked } = require('../utils/checkingComandsExecution');

async function infoSorteio(interaction) {
    const { commandName } = interaction;

    if (!interaction.isCommand()) return;

    const authorizedExecutionComand = await checkingComandChannelBlocked(interaction);
    if (!authorizedExecutionComand) return;
    
    try {
        if (commandName === 'infosorteio') {
            const participantes = await Sorteio.find({});
            const premio = await  Premio.findOne({});

            if (!participantes.length) {
                return interaction.reply({
                    content: 'Nenhum participante encontrado no sorteio.',
                    ephemeral: true,
                });
                Logger.error('Nenhum participante encontrado no sorteio');
            }

            if (!premio) {
                return interaction.reply({
                    content: 'Nenhuma informação de prêmio encontrada.',
                    ephemeral: true,
                });
                Logger.error('Nenhuma informação de prêmio encontrada');
            }

            // Criação do embed
            const embed = new EmbedBuilder()
                .setTitle('🎉 Informações do Sorteio 🎉')
                .setColor('#FFD700')
                .addFields(
                    {
                        name: '🎁 Prêmio',
                        value: `${premio.premio || 'Prêmio não especificado'}`,
                        inline: true,
                    },
                    {
                        name: '👑 Organizador',
                        value: `${premio.dono || 'Desconhecido'}`,
                        inline: true,
                    },
                    {
                        name: '👥 Participantes',
                        value: participantes.map((p) => `- ${p.nomeUsuario}`).join('\n'),
                    }
                )
                .setFooter({ text: 'Boa sorte a todos!', iconURL: interaction.client.user.displayAvatarURL() })
                .setTimestamp();
            await interaction.reply({ embeds: [embed] });

            const logChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT);
            await logChannel.send(`Informações do sorteio enviadas com sucesso.`);
            botEvent('INFO_SORTEIO', 'Informações do sorteio enviadas com sucesso');
        }
    } catch (error) {
        Logger.error('Erro ao pesquisar as informações do sorteio', error);
        const logChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_ERRO_BOT);
        await logChannel.send(`Erro ao pesquisar as informações do sorteio ${error.message}`);
    }
}

module.exports = { infoSorteio };
