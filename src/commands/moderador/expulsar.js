const { EmbedBuilder } = require('discord.js');
const { client } = require("../../Client");
const { info, erro } = require('../../logger');
const { getApiUrl } = require('../../api');
const blockedChannels = require('../../config/blockedChannels.json').blockedChannels;

const expulsar = async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName, channelId, options, member: executor } = interaction;

    if (commandName === 'expulsar') {
        await interaction.deferReply({ ephemeral: true }); // Prolonga o tempo de resposta

        const user = options.getUser('usuario');

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

        if (!user) {
            await interaction.editReply({ content: 'Usuário inválido!' });
            return;
        }

        try {
            const targetMember = await interaction.guild.members.fetch(user.id);
            const botMember = interaction.guild.members.me;

            if (!botMember.permissions.has('KICK_MEMBERS') || !targetMember.kickable) {
                await interaction.editReply({ content: `Não posso expulsar o usuário ${user.tag}.` });
                return;
            }

            try {
                await user.send("Você foi expulso do servidor.");
            } catch (dmError) {
                console.error(`Não foi possível enviar mensagem direta para ${user.tag}:`, dmError.message);
            }

            await targetMember.kick("Para dúvidas, fale com o dono do servidor.");

            const payload = {
                username: user.tag,
                avatarUrl: user.displayAvatarURL({ dynamic: true }),
                infraction: 'expulsion',
                reason: `Expulso por do servidor ${interaction.guild.name}.`,
                moderator: executor.user.tag,
            };

            try {
                const api = getApiUrl();
                await api.post(`/users/${user.tag}`, payload, { headers: { 'Content-Type': 'application/json' }, timeout: 5000 });
                info.info(`Infração registrada no backend para o usuário ${user.tag}.`);
            } catch (backendError) {
                erro.error(`Erro ao registrar infração no backend: ${backendError.message}`);
            }

            await interaction.editReply({ content: `Usuário ${user.tag} foi expulso com sucesso!` });
        } catch (error) {
            erro.error(error);
            await interaction.editReply({ content: 'Não foi possível expulsar o usuário.' });
        }
    }
};

module.exports = { expulsar };
