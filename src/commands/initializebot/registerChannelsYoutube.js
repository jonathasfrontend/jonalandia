const { EmbedBuilder } = require("discord.js");
const onYoutubeChannelSchema = require('../../models/onYoutubeChannelSchema');
const { client } = require("../../Client");
const { erro, info } = require('../../Logger');
const { checkingComandChannelBlocked, checkingComandExecuntionModerador } = require("../../utils/checkingComandsExecution");

async function registerChannelsYoutube(interaction) {
    if (!interaction.isCommand()) return;

    const { commandName, options } = interaction;

    const authorizedExecutionComand = await checkingComandChannelBlocked(interaction);
    if (!authorizedExecutionComand) return;
    
    const authorizedExecutionComandModerador = await checkingComandExecuntionModerador(interaction);
    if (!authorizedExecutionComandModerador) return;

    try {
        if (commandName === 'registerchannelsyoutube') {

            const NameChannel = options.getString('channel');

            const newStreamer = {
                name: NameChannel,
            }

            await onYoutubeChannelSchema.create(newStreamer);

            const embed = new EmbedBuilder()
                .setColor('#ffffff')
                .setAuthor({
                    name: client.user.username,
                    iconURL: client.user.displayAvatarURL({ dynamic: true }),
                })
                .setTitle('Canal cadastrado com sucesso.')
                .setDescription(`Canal: ${NameChannel}`)
                .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
                .setTimestamp()
                .setFooter({ text: `Por: ${client.user.tag}`, iconURL: client.user.displayAvatarURL({ dynamic: true }) });
            await interaction.reply({ embeds: [embed], ephemeral: true });

            const logChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT);
            await logChannel.send(`Canal cadastrado com sucesso: ${NameChannel}`);

            info.info(`Canal cadastrado com sucesso: ${NameChannel}`);
        }
    } catch (error) {
        erro.error('Erro ao cadastrar o canal', error);
        const logChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_ERRO_BOT);
        await logChannel.send(`Erro ao cadastrar o canal ${error}`);
    }
}

module.exports = { registerChannelsYoutube };