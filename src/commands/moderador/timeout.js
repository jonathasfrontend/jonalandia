const { EmbedBuilder } = require('discord.js');
const { client } = require("../../Client");
const { info, erro } = require('../../Logger');
const Users = require('../../models/infracoesUsersSchema');
const blockedChannels = require('../../config/blockedChannels.json').blockedChannels;

async function timeout(interaction) {
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
        if (commandName === 'timeout') {
            await interaction.deferReply({ ephemeral: true });
    
            const user = options.getUser('usuario');
            const guildMember = interaction.guild.members.cache.get(user.id);
    
            if (!guildMember) {
                await interaction.editReply({ content: 'Usuário não encontrado no servidor.', ephemeral: true });
                return;
            }
    
            const reason = `O usuário ${user.tag} recebeu um timeout de 3 minutos.`;
            const type = 'timeouts';

            let userData = await Users.findOne({ username: user.tag });

            if (!userData) {
                userData = new Users({
                    userId: user.id,
                    username: user.tag,
                    avatarUrl: user.displayAvatarURL({ dynamic: true }),
                    accountCreatedDate: user.createdAt,
                    joinedServerDate: guildMember.joinedAt,
                    infractions: { timeouts: 1 },
                    logs: [{
                        type,
                        reason,
                        date: new Date(),
                        moderator: member.user.tag,
                    }]
                });
            } else {
                userData.infractions.timeouts = (userData.infractions.timeouts || 0) + 1;
                userData.logs.push({
                    type,
                    reason,
                    date: new Date(),
                    moderator: member.user.tag,
                });
            }

            await userData.save();
            
            await guildMember.timeout(3 * 60 * 1000, 'Timeout de 3 minutos aplicado pelo bot');
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('Timeout aplicado')
                .setDescription(`O usuário ${user.tag} recebeu um timeout de 3 minutos.`)
                .setTimestamp()
                .setFooter({ text: `Por: ${client.user.tag}`, iconURL: client.user.displayAvatarURL({ dynamic: true }) });

            await interaction.editReply({ embeds: [embed] });

            const logChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT);
            await logChannel.send(`Timeout aplicado com sucesso no usuário ${user.tag}.`);

            info.info(`Timeout aplicado com sucesso no usuário ${user.tag}.`);
        } 
    } catch (error) {
        erro.error('Erro ao aplicar timeout:', error);
        const logChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_ERRO_BOT);
        await logChannel.send(`Erro ao aplicar timeout: ${error}`);
    }
};

module.exports = { timeout };
