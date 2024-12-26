const { EmbedBuilder } = require('discord.js');
const { client } = require('../../Client');
const { info, erro } = require('../../Logger');
const { saveUserInfractions } = require('../../utils/saveUserInfractions');
const { checkingComandChannelBlocked, checkingComandExecuntionModerador } = require('../../utils/checkingComandsExecution');

async function unbanUser(interaction) {
    if (!interaction.isCommand()) return;

    const { commandName, options, member } = interaction;

    const authorizedExecutionComand = await checkingComandChannelBlocked(interaction);
    if (!authorizedExecutionComand) return;
    const authorizedExecutionComandModerador = await checkingComandExecuntionModerador(interaction);
    if (!authorizedExecutionComandModerador) return;

    try {
        if (commandName === 'desbanir') {
            const userToUnban = options.getUser('usuario');

            const banList = await interaction.guild.bans.fetch();
            const isBanned = banList.has(userToUnban.id);

            if (!isBanned) {
                const embed = new EmbedBuilder()
                    .setColor('Yellow')
                    .setDescription('Este usuário não está banido.');
                await interaction.reply({ embeds: [embed], ephemeral: true });
                return;
            }

            const reason = 'Você foi desbanido do servidor';

            await interaction.guild.members.unban(userToUnban.id, reason);

            try {
                await userToUnban.send(reason);
            } catch (err) {
                erro.error(`Não foi possível enviar mensagem privada para o usuário ${userToUnban.tag}`);
            }

            const type = 'unbans';

            saveUserInfractions(
                userToUnban.id,
                userToUnban.tag,
                userToUnban.displayAvatarURL({ dynamic: true }),
                userToUnban.createdAt,
                userToUnban.joinedAt,
                type,
                reason,
                member.user.tag
            )

            const embed = new EmbedBuilder()
                .setColor('Green')
                .setDescription(`${userToUnban.tag} foi desbanido com sucesso!`);
            await interaction.reply({ embeds: [embed], ephemeral: true });

            const logChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT);
            await logChannel.send(`${userToUnban.tag} foi desbanido com sucesso!`);

            info.info(`${userToUnban.tag} foi desbanido com sucesso!`);
        }
    } catch (error) {
        erro.error('Erro ao desbanir o usuário:', error);
        const logChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_ERRO_BOT);
        await logChannel.send(`Erro ao desbanir o usuário: ${error}`);
    }
};
module.exports = { unbanUser };
