const { EmbedBuilder } = require('discord.js');
const ChannelModel = require('../../models/onAddChannelSchema');
const { client } = require('../../Client');
const { logger } = require('../../logger');
const { checkingComandChannelBlocked, checkingComandExecuntionModerador } = require("../../utils/checkingComandsExecution");

async function removeChannels(interaction) {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    const authorizedExecutionComand = await checkingComandChannelBlocked(interaction);
    if (!authorizedExecutionComand) return;

    const authorizedExecutionComandModerador = await checkingComandExecuntionModerador(interaction);
    if (!authorizedExecutionComandModerador) return;

    try {
        if (commandName === 'removechannels') {
            await interaction.deferReply({ ephemeral: true });

            const selectedChannel = interaction.options.getChannel('channel');
            if (!selectedChannel) {
                logger.warn(`Tentativa de remover canal inválido: ${selectedChannel ? selectedChannel.id : 'Nenhum canal selecionado'}`);
                return interaction.editReply("Por favor, selecione um canal válido para remover.");
            }

            const removedChannel = await ChannelModel.findOneAndDelete({ channelId: selectedChannel.id });

            if (!removedChannel) {
                logger.warn(`Tentativa de remover canal não registrado: ${selectedChannel.id}`);
                return interaction.editReply("O canal selecionado não está registrado no banco de dados ou foi removido!");
            }

            const embed = new EmbedBuilder()
                .setColor('Red')
                .setTitle('Canal Removido')
                .setDescription(`O canal **${selectedChannel.name}** foi removido do banco de dados.`)
                .setTimestamp()
                .setFooter({ text: `Ação realizada por ${interaction.user.tag}` });

            await interaction.editReply({ embeds: [embed] });

            const logChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT);
            await logChannel.send(`O canal ${selectedChannel.name} foi removido do banco de dados.`);

            logger.info(`O canal ${selectedChannel.name} foi removido do banco de dados.`);
        }
    } catch (error) {
        logger.error(`erro ao remover o canal do bd.`, error);

        const logChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_ERRO_BOT);
        await logChannel.send(`erro ao remover o canal do bd.`, error);
    }
}

module.exports = { removeChannels };
