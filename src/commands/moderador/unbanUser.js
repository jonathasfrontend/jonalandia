const { EmbedBuilder } = require('discord.js');
const { client } = require('../../Client');
const { info, erro } = require('../../logger');
const { default: axios } = require('axios');
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

    const userToUnban = interaction.options.getUser('usuario');
    const reason = 'Parabéns! Você foi desbanido do servidor';

    if (!userToUnban) {
        const embed = new EmbedBuilder()
            .setColor('Red')
            .setDescription('Usuário não encontrado. Por favor, selecione um usuário válido.');
        await interaction.reply({ embeds: [embed], ephemeral: true });
        return;
    }

    try {
        // Tenta desbanir o usuário
        const banList = await interaction.guild.bans.fetch();
        const isBanned = banList.has(userToUnban.id);

        if (!isBanned) {
            const embed = new EmbedBuilder()
                .setColor('Yellow')
                .setDescription('Este usuário não está banido.');
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }

        await interaction.guild.members.unban(userToUnban.id, reason);

        // Envia uma mensagem privada ao usuário desbanido
        await userToUnban.send(reason).catch(err => {
            erro.error(`Não foi possível enviar mensagem privada para o usuário ${userToUnban.tag}`);
        });

        const serverUrl = 'https://jonalandia-server.vercel.app/users';
            const payload = {
                username: userToUnban.tag,
                avatarUrl: userToUnban.displayAvatarURL({ dynamic: true }),
                accountCreatedDate: userToUnban.createdAt,
                joinedServerDate: member.joinedAt,
                infraction: 'unbans',
                reason: `${userToUnban.tag} foi desbanido do servidor.`,
                moderator: member.user.tag,
            };
        
            try {
                await axios.post(`${serverUrl}/${userToUnban.tag}`, payload, {
                    headers: { 'Content-Type': 'application/json' },
                });
                info.info(`Infração registrada no backend para o usuário ${userToUnban.tag}.`);
            } catch (backendError) {
                erro.error(`Erro ao enviar dados para o backend: ${backendError.message}`);
            }

        const embed = new EmbedBuilder()
            .setColor('Green')
            .setDescription(`${userToUnban.tag} foi desbanido com sucesso!`);
        await interaction.reply({ embeds: [embed] });

        
        const discordChannel2 = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT)
        discordChannel2.send(`${userToUnban.tag} foi desbanido com sucesso!.`);

    } catch (error) {
        erro.error(error);
        const embed = new EmbedBuilder()
            .setColor('Red')
            .setDescription('Houve um erro ao tentar desbanir o usuário.');
        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};

module.exports = { unbanUser };
