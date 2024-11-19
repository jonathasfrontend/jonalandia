const { EmbedBuilder } = require('discord.js');
const { client } = require('../../Client');
const { info, erro } = require('../../logger');
const { getApiUrl } = require('../../api');
const blockedChannels = require('../../config/blockedChannels.json').blockedChannels;

const unbanUser = async (interaction) => {
    if (!interaction.isCommand()) return;
    const { commandName, channelId, options, member } = interaction;

    if (blockedChannels.includes(channelId)) {
        const embed = new EmbedBuilder()
            .setColor('Red')
            .setAuthor({
                name: client.user.username,
                iconURL: client.user.displayAvatarURL({ dynamic: true }),
            })
            .setTitle("Este comando não pode ser usado neste canal")
            .setDescription('Vá ao canal <#1254199140796207165> para executar os comandos')
            .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
            .setTimestamp()
            .setFooter({ text: `Por: ${client.user.tag}`, iconURL: client.user.displayAvatarURL({ dynamic: true }) });
        await interaction.reply({ embeds: [embed], ephemeral: true });
        return;
    }

    if (!member.roles.cache.has(process.env.CARGO_MODERADOR)) {
        const embed = new EmbedBuilder()
            .setColor('Red')
            .setAuthor({
                name: client.user.username,
                iconURL: client.user.displayAvatarURL({ dynamic: true }),
            })
            .setDescription('Você não tem permissão para usar este comando.')
            .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
            .setTimestamp()
            .setFooter({ text: `Por: ${client.user.tag}`, iconURL: client.user.displayAvatarURL({ dynamic: true }) });
        await interaction.reply({ embeds: [embed], ephemeral: true });
        return;
    }

    const userToUnban = options.getUser('usuario'); // Verifica se o usuário foi passado no comando
    const reason = 'Parabéns! Você foi desbanido do servidor';

    if (!userToUnban) {
        const embed = new EmbedBuilder()
            .setColor('Red')
            .setDescription('Usuário não encontrado. Por favor, selecione um usuário válido.');
        await interaction.reply({ embeds: [embed], ephemeral: true });
        return;
    }

    try {
        const banList = await interaction.guild.bans.fetch();
        const isBanned = banList.has(userToUnban.id);

        if (!isBanned) {
            const embed = new EmbedBuilder()
                .setColor('Yellow')
                .setDescription('Este usuário não está banido.');
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }

        // Desbanir o usuário
        await interaction.guild.members.unban(userToUnban.id, reason);

        // Tentar enviar mensagem privada ao usuário
        try {
            await userToUnban.send(reason);
        } catch (err) {
            erro.error(`Não foi possível enviar mensagem privada para o usuário ${userToUnban.tag}`);
        }

        // Registrar no backend
        const payload = {
            username: userToUnban.tag,
            avatarUrl: userToUnban.displayAvatarURL({ dynamic: true }),
            accountCreatedDate: userToUnban.createdAt,
            joinedServerDate: member.joinedAt,
            infraction: 'unbans',
            reason: `${userToUnban.tag} foi desbanido do servidor.`,
            moderator: member.user.tag,
        };

        const api = getApiUrl();
        await api.post(`/users/${userToUnban.tag}`, payload, {
            headers: { 'Content-Type': 'application/json' },
        });

        // Mensagem de sucesso no canal
        const embed = new EmbedBuilder()
            .setColor('Green')
            .setDescription(`${userToUnban.tag} foi desbanido com sucesso!`);
        await interaction.reply({ embeds: [embed] });

        // Log no canal de logs
        const logChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT);
        if (logChannel) {
            await logChannel.send(`${userToUnban.tag} foi desbanido com sucesso!`);
        }
    } catch (error) {
        erro.error(`Erro ao desbanir usuário: ${error.message}`);
        const embed = new EmbedBuilder()
            .setColor('Red')
            .setDescription('Houve um erro ao tentar desbanir o usuário.');
        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};

module.exports = { unbanUser };
