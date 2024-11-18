const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { client } = require('../../Client');
const { info, erro } = require('../../logger');
const blockedChannels = require('../../config/blockedChannels.json').blockedChannels;
const axios = require('axios');

const banUser = async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName, channelId, options, member: executor } = interaction;

    if (commandName === 'banir') {
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
            await interaction.reply({ embeds: [embed], ephemeral: true });
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
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }

        if (!userToBan) {
            await interaction.reply({ content: 'Usuário inválido ou não encontrado.', ephemeral: true });
            return;
        }

        try {
            const memberToBan = await interaction.guild.members.fetch(userToBan.id);

            const botMember = interaction.guild.members.me;
            if (!botMember.permissions.has(PermissionsBitField.Flags.BanMembers)) {
                await interaction.reply({ content: 'O bot não possui permissão para banir membros.', ephemeral: true });
                return;
            }

            if (!memberToBan.bannable) {
                await interaction.reply({ content: `Não posso banir o usuário ${userToBan.tag}.`, ephemeral: true });
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

            const serverUrl = 'https://jonalandia-server.vercel.app/users';
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
                await axios.post(`${serverUrl}/${userToBan.tag}`, payload, {
                    headers: { 'Content-Type': 'application/json' },
                });
                info.info(`Infração registrada no backend para o usuário ${userToBan.tag}.`);
            } catch (backendError) {
                erro.error(`Erro ao enviar dados para o backend: ${backendError.message}`);
            }

            const embed = new EmbedBuilder()
                .setColor('Red')
                .setTitle('Usuário Banido')
                .setDescription(`O usuário ${userToBan.tag} foi banido com sucesso.`)
                .setTimestamp()
                .setFooter({ text: `Ação realizada por ${executor.user.tag}` });

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            erro.error(error);
            console.error(error);
            await interaction.reply({ content: 'Ocorreu um erro ao tentar banir o usuário.', ephemeral: true });
        }
    }
};

module.exports = { banUser };
