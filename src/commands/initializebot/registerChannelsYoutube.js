const { EmbedBuilder } = require("discord.js");
const onYoutubeChannelSchema = require('../../models/onYoutubeChannelSchema');
const { client } = require("../../Client");
const { Logger, botEvent, warn, error } = require('../../logger');
const { checkingComandChannelBlocked, checkingComandExecuntionModerador } = require("../../utils/checkingComandsExecution");

async function registerChannelsYoutube(interaction) {
    if (!interaction.isCommand()) return;

    const { commandName, options } = interaction;

    const authorizedExecutionComand = await checkingComandChannelBlocked(interaction);
    if (!authorizedExecutionComand) return;

    const authorizedExecutionComandModerador = await checkingComandExecuntionModerador(interaction);
    if (!authorizedExecutionComandModerador) return;

    // Obter o nome do canal primeiro
    const NameChannel = options.getString('channel');



    try {

        // verifica se o canal já existe no banco de dados
        const existingChannel = await onYoutubeChannelSchema.findOne({ name: NameChannel });
        if (existingChannel) {
            warn(`O canal ${NameChannel} já está cadastrado no banco de dados.`);

            const embed = new EmbedBuilder()
                .setColor('Red')
                .setAuthor({
                    name: client.user.username,
                    iconURL: client.user.displayAvatarURL({ dynamic: true }),
                })
                .setTitle('Canal já cadastrado')
                .setDescription(`O canal ${NameChannel} já está cadastrado no banco de dados.`)
                .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
                .setTimestamp()
                .setFooter({ text: `Por: ${client.user.tag}`, iconURL: client.user.displayAvatarURL({ dynamic: true }) });
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }

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

        Logger.info(`Canal cadastrado com sucesso: ${NameChannel}`);
    } catch (error) {
        Logger.error('Erro ao cadastrar o canal', error);
        const logChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_ERRO_BOT);
        await logChannel.send(`Erro ao cadastrar o canal ${error}`);
    }
}

module.exports = { registerChannelsYoutube };