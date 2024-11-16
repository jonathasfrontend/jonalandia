const { EmbedBuilder } = require('discord.js');
const { client } = require("../../Client");
const { erro } = require('../../logger');
const blockedChannels = require('../../config/blockedChannels.json').blockedChannels;

const expulsar = async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName, channelId, options, member: executor } = interaction;

    if (commandName === 'expulsar') {
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

        // Verificar se o usuário é válido
        if (!user) {
            await interaction.reply({ content: 'Usuário inválido!', ephemeral: true });
            return;
        }

        try {
            const targetMember = await interaction.guild.members.fetch(user.id);

            const botMember = interaction.guild.members.me;
            if (!botMember.permissions.has('KICK_MEMBERS')) {
                await interaction.reply({ content: 'O bot não possui permissão para expulsar membros.', ephemeral: true });
                return;
            }

            // Verificar se o bot pode interagir com o membro
            if (!targetMember.kickable) {
                await interaction.reply({ content: `Não posso expulsar o usuário ${user.tag}.`, ephemeral: true });
                return;
            }

            // Tentar enviar mensagem privada para o usuário
            try {
                await user.send("Você foi expulso do servidor por atitudes que contrariam as regras do servidor.");
            } catch (dmError) {
                console.error(`Não foi possível enviar mensagem direta para ${user.tag}:`, dmError.message);
            }

            // Registrar no canal de logs
            const logsChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT);
            if (logsChannel) {
                await logsChannel.send(`O usuário ${user.tag} foi expulso por ${executor.user.tag}.`);
            }

            // Expulsar o usuário
            await targetMember.kick("Para dúvidas, fale com o dono do servidor.");
            await interaction.reply({ content: `Usuário ${user.tag} foi expulso com sucesso!`, ephemeral: true });
        } catch (error) {
            erro.error(error);
            console.error(error);
            await interaction.reply({ content: 'Não foi possível expulsar o usuário.', ephemeral: true });
        }
    }
};

module.exports = { expulsar };
