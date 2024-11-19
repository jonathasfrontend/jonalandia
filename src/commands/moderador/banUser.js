const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { client } = require('../../Client');
const { info, erro } = require('../../logger');
const { getApiUrl } = require('../../api');
const blockedChannels = require('../../config/blockedChannels.json').blockedChannels;

const banUser = async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName, channelId, options, member: executor } = interaction;

    if (commandName === 'banir') {
        await interaction.deferReply({ ephemeral: true }); // Adiciona defer para evitar expiração

        const userToBan = options.getUser('usuario');

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
            await interaction.editReply({ embeds: [embed] });
            return;
        }

        if (!executor.roles.cache.has(process.env.CARGO_MODERADOR)) {
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
            await interaction.editReply({ embeds: [embed] });
            return;
        }

        if (!userToBan) {
            await interaction.editReply({ content: 'Usuário inválido ou não encontrado.' });
            return;
        }

        try {
            const memberToBan = await interaction.guild.members.fetch(userToBan.id);

            const botMember = interaction.guild.members.me;
            if (!botMember.permissions.has(PermissionsBitField.Flags.BanMembers)) {
                await interaction.editReply({ content: 'O bot não possui permissão para banir membros.' });
                return;
            }

            if (!memberToBan.bannable) {
                await interaction.editReply({ content: `Não posso banir o usuário ${userToBan.tag}.` });
                return;
            }

            try {
                await userToBan.send("Você foi banido do servidor por atitudes que contrariam as regras do servidor.");
            } catch (dmError) {
                console.error(`Não foi possível enviar mensagem direta para ${userToBan.tag}:`, dmError.message);
            }

            const logsChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT);
            if (logsChannel) {
                await logsChannel.send(`O usuário ${userToBan.tag} foi banido por ${executor.user.tag}.`);
            }

            await memberToBan.ban({ reason: "Para dúvidas, fale com o dono do servidor." });

            const payload = {
                username: userToBan.tag,
                avatarUrl: userToBan.displayAvatarURL({ dynamic: true }),
                accountCreatedDate: userToBan.createdAt,
                joinedServerDate: memberToBan.joinedAt,
                infraction: 'bans',
                reason: `O usuário ${userToBan.tag} foi banido do servidor.`,
                moderator: executor.user.tag,
            };
        
            try {
                const api = getApiUrl();
                await api.post(`/users/${userToBan.tag}`, payload, {
                    headers: { 'Content-Type': 'application/json' },
                });
                info.info(`Infração registrada no backend para o usuário ${userToBan.tag}.`);
            } catch (backendError) {
                erro.error(`Erro ao registrar infração no backend para o usuário ${userToBan.tag} - ${backendError.message}`);            
            }

            const embed = new EmbedBuilder()
                .setColor('Red')
                .setTitle('Usuário Banido')
                .setDescription(`O usuário ${userToBan.tag} foi banido com sucesso.`)
                .setTimestamp()
                .setFooter({ text: `Ação realizada por ${executor.user.tag}` });

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            erro.error(error);
            console.error(error);
            await interaction.editReply({ content: 'Ocorreu um erro ao tentar banir o usuário.' });
        }
    }
};

module.exports = { banUser };
