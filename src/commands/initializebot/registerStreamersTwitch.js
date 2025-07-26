const { EmbedBuilder } = require("discord.js");
const onTwitchStreamersSchema = require('../../models/onTwitchStreamersSchema');
const { client } = require("../../Client");
const { Logger, error, botEvent, warn } = require('../../logger');
const { checkingComandChannelBlocked, checkingComandExecuntionModerador } = require("../../utils/checkingComandsExecution");

async function registerStreamersTwitch(interaction) {
    if (!interaction.isCommand()) return;

    const { commandName, options } = interaction;

    const authorizedExecutionComand = await checkingComandChannelBlocked(interaction);
    if (!authorizedExecutionComand) return;

    const authorizedExecutionComandModerador = await checkingComandExecuntionModerador(interaction);
    if (!authorizedExecutionComandModerador) return;

    try {

        // verifica se o streamer já existe no banco de dados
        const existingStreamer = await onTwitchStreamersSchema.findOne({ name: options.getString('streamer') });
        if (existingStreamer) {
            warn(`O streamer ${existingStreamer.name} já está cadastrado no banco de dados.`);
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setAuthor({
                    name: client.user.username,
                    iconURL: client.user.displayAvatarURL({ dynamic: true }),
                })
                .setTitle('Streamer já cadastrado')
                .setDescription(`O streamer ${existingStreamer.name} já está cadastrado no banco de dados.`)
                .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
                .setTimestamp()
                .setFooter({ text: `Por: ${client.user.tag}`, iconURL: client.user.displayAvatarURL({ dynamic: true }) });
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }

        const NameStreamer = options.getString('streamer');

        const newStreamer = {
            name: NameStreamer,
        }

        await onTwitchStreamersSchema.create(newStreamer);

        const embed = new EmbedBuilder()
            .setColor('#ffffff')
            .setAuthor({
                name: client.user.username,
                iconURL: client.user.displayAvatarURL({ dynamic: true }),
            })
            .setTitle('Streamer cadastrado com sucesso.')
            .setDescription(`Streamer: ${NameStreamer}`)
            .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
            .setTimestamp()
            .setFooter({ text: `Por: ${client.user.tag}`, iconURL: client.user.displayAvatarURL({ dynamic: true }) });
        await interaction.reply({ embeds: [embed], ephemeral: true });

        const logChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT);
        await logChannel.send(`Streamer cadastrado com sucesso: ${NameStreamer}`);

        Logger.info(`Streamer cadastrado com sucesso: ${NameStreamer}`);
    } catch (error) {
        Logger.error('Erro ao cadastrar o streamer', error);
        const logChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_ERRO_BOT);
        await logChannel.send(`Erro ao cadastrar o streamer ${error}`);
    }
}

module.exports = { registerStreamersTwitch };