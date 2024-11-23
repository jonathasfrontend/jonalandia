const { EmbedBuilder } = require('discord.js');
const { client } = require('../../Client');
const { info, erro } = require('../../logger');
const Users = require('../../models/infracoesUsersSchema');
const blockedChannels = require('../../config/blockedChannels.json').blockedChannels;

const banUser = async (interaction) => {
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
        if (commandName === 'banir') {
            await interaction.deferReply({ ephemeral: true });

            const userToBan = options.getUser('usuario');
            const memberToBan = await interaction.guild.members.fetch(userToBan.id);

            try {
                await userToBan.send("Você foi banido do servidor por atitudes que contrariam as regras do servidor.");
            } catch (dmError) {
                console.error(`Não foi possível enviar mensagem direta para ${userToBan.tag}:`, dmError.message);
            }

            const reason = `O usuário ${userToBan.tag} foi banido do servidor.`;
            const type = 'bans';

            let userData = await Users.findOne({ username: userToBan.tag });

            if (!userData) {
                userData = new Users({
                    userId: userToBan.id,
                    username: userToBan.tag,
                    avatarUrl: userToBan.displayAvatarURL({ dynamic: true }),
                    accountCreatedDate: userToBan.createdAt,
                    joinedServerDate: memberToBan.joinedAt,
                    infractions: { bans: 1 },
                    logs: [{
                        type,
                        reason,
                        date: new Date(),
                        moderator: member.user.tag,
                    }]
                });
            } else {
                userData.infractions.bans = (userData.infractions.bans || 0) + 1;
                userData.logs.push({
                    type,
                    reason,
                    date: new Date(),
                    moderator: member.user.tag,
                });
            }

            await userData.save();

            await memberToBan.ban({ reason: "Para dúvidas, fale com o dono do servidor." });

            const embed = new EmbedBuilder()
                .setColor('Red')
                .setTitle('Usuário Banido')
                .setDescription(`O usuário ${userToBan.tag} foi banido com sucesso.`)
                .setTimestamp()
                .setFooter({ text: `Ação realizada por ${member.user.tag}` });

            await interaction.editReply({ embeds: [embed] });

            const logChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT);
            await logChannel.send(`O usuário ${userToBan.tag} foi banido do servidor.`);

            info.info(`O usuário ${userToBan.tag} foi banido do servidor.`);
        } 
    } catch (error) {
        erro.error('Erro ao banir usuario:', error);
        const logChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_ERRO_BOT);
        await logChannel.send(`Erro ao banir usuario: ${error}`);
    }
};

module.exports = { banUser };
