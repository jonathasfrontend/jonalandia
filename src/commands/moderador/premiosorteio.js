const Premio = require('../../models/onPremioSorteioSchema');
const { EmbedBuilder } = require("discord.js");
const { client } = require("../../Client");
const { erro, info } = require('../../Logger');
const { checkingComandChannelBlocked, checkingComandExecuntionModerador } = require('../../utils/checkingComandsExecution');

async function premioSorteio(interaction) {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    checkingComandChannelBlocked(interaction);
    const isAuthorized = await checkingComandExecuntionModerador(interaction);
    if (!isAuthorized) return;

    try {
        if (commandName === 'premiosorteio') {
            const premio = interaction.options.getString('premio');
            const dono = interaction.user.username;

            const novoPremio = new Premio({
                premio,
                dono,
            });

            await novoPremio.save();

            const embed = await new EmbedBuilder()
                .setColor("#00FF00")
                .setTitle(' 🎁 Prêmio cadastrado com sucesso!')
                .setAuthor({
                    name: client.user.username,
                    iconURL: client.user.displayAvatarURL({ dynamic: true }),
                })
                .setDescription(' O prêmio foi registrado com sucesso.')
                .setThumbnail(`${client.user.displayAvatarURL({ dynamic: true })}`)
                .setTimestamp()
                .setFooter({ text: `Por: ${client.user.tag}`, iconURL: `${client.user.displayAvatarURL({ dynamic: true })}` });

            await interaction.reply({ embeds: [embed], ephemeral: true });

            const logChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT);
            await logChannel.send(`Prêmio cadastrado com sucesso.`);

            info.info('Prêmio cadastrado com sucesso.');
        }
    } catch (error) {
        erro.error('Erro ao cadastrar o premio', error);
        const logChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_ERRO_BOT);
        await logChannel.send(`Erro ao cadastrar o premio ${error}`);
    }
}

module.exports = { premioSorteio };