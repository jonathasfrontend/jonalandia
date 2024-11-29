const { EmbedBuilder } = require('discord.js');
const { client } = require("../../Client");
const { info, erro } = require('../../Logger');
const { saveUserInfractions } = require('../../utils/saveUserInfractions');
const blockedChannels = require('../../config/blockedChannels.json').blockedChannels;

async function expulsar(interaction) {
    if (!interaction.isCommand()) return;

    const { commandName, options, channelId, member } = interaction;

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
        await interaction.editReply({ embeds: [embed], ephemeral: true });
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
            await interaction.editReply({ embeds: [embed], ephemeral: true });
        return;
    }

    try {
        if (commandName === 'expulsar') {
            await interaction.deferReply({ ephemeral: true });
            
            const userToKick = options.getUser('usuario');
            const targetMember = await interaction.guild.members.fetch(userToKick.id);

            try {
                await userToKick.send("Você foi expulso do servidor Jonalandia.");
            } catch (dmError) {
                console.error(`Não foi possível enviar mensagem direta para ${userToKick.tag}:`, dmError.message);
            }

            const reason = `O usuário ${userToKick.tag} foi expulso do servidor.`;
            const type = 'expulsion';

            saveUserInfractions(
                userToKick.id,
                userToKick.tag,
                userToKick.displayAvatarURL({ dynamic: true }),
                userToKick.createdAt,
                targetMember.joinedAt,
                type,
                reason,
                client.user.tag
            )

            await targetMember.kick("Para dúvidas, fale com o dono do servidor.");

            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('Expulsão aplicada')
                .setDescription(`O usuário ${userToKick.tag} foi expulso do servidor.`)
                .setTimestamp()
                .setFooter({ text: `Por: ${client.user.tag}`, iconURL: client.user.displayAvatarURL({ dynamic: true }) });

            await interaction.editReply({ embeds: [embed] });

            const logChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT);
            await logChannel.send(`Expulsão aplicada com sucesso no usuário ${userToKick.tag}.`);

            info.info(`Expulsão aplicada com sucesso no usuário ${userToKick.tag}.`);
        } 
    } catch (error) {
        erro.error('Erro ao aplicar a expulsão:', error);
        const logChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_ERRO_BOT);
        await logChannel.send(`Erro ao aplicar a expulsão: ${error}`);
    }
};

module.exports = { expulsar };
