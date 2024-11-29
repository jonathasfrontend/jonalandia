const Users = require('../../models/infracoesUsersSchema');
const { EmbedBuilder } = require('discord.js');
const { client } = require("../../Client");
const { info, erro } = require('../../Logger');
const blockedChannels = require('../../config/blockedChannels.json').blockedChannels;

async function searchUserDB(interaction) {
    if (!interaction.isCommand()) return;

    const { commandName, member, options, channelId } = interaction;

    if (blockedChannels.includes(channelId)) {
        const embed = new EmbedBuilder()
            .setColor('Red')
            .setAuthor({
                name: client.user.username,
                iconURL: client.user.displayAvatarURL({ dynamic: true }),
            })
            .setTitle("Este comando não pode ser usado neste canal")
            .setDescription('Vá ao canal <#1253377239370698873> para executar os comandos')
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

    try {
        if (commandName === 'infouser'){
            await interaction.deferReply({ ephemeral: true });

            const user = options.getUser('usuario');

            const userData = await Users.findOne( { username: user.tag } );

            if (!userData) {
                return interaction.editReply({
                    content: `❌ Usuário **${user.username}** não encontrado no banco de dados.`,
                });
            }

            const embed = new EmbedBuilder()
                .setTitle(`Informações do Usuário: ${userData.username}`)
                .setThumbnail(userData.avatarUrl)
                .setColor('#3498db')
                .addFields(
                    {
                        name: 'Infrações',
                        value: `
                        🗣️ Linguagem Inapropriada: ${userData.infractions.inappropriateLanguage}
                        ⏳ Timeouts: ${userData.infractions.timeouts}
                        🚪 Expulsões de Canal de Voz: ${userData.infractions.voiceChannelKicks}
                        🚪 Expulsões do Servidor: ${userData.infractions.expulsion}
                        ⛔ Bans: ${userData.infractions.bans}
                        🔓 Unbans: ${userData.infractions.unbans}
                        💬 Flood Timeouts: ${userData.infractions.floodTimeouts}
                        📂 Arquivos Bloqueados: ${userData.infractions.blockedFiles}
                        🔗 Links Postados: ${userData.infractions.serverLinksPosted}`,
                        inline: false,
                    },
                    {
                        name: 'Conta Criada em',
                        value: new Date(userData.accountCreatedDate).toLocaleDateString(),
                        inline: true,
                    },
                    {
                        name: 'Entrou no Servidor em',
                        value: new Date(userData.joinedServerDate).toLocaleDateString(),
                        inline: true,
                    }
                )
                .setFooter({
                    text: 'Informações atualizadas em tempo real',
                    iconURL: userData.avatarUrl,
                });

            if (userData.logs && userData.logs.length > 0) {
                const logs = userData.logs
                .map(
                    (log) =>
                        `**[${log.type}]** ${log.reason} (por ${log.moderator} em ${new Date(
                        log.date
                    ).toLocaleDateString()})`
                )
                    .join('\n');
                    embed.addFields([{ name: '📜 Logs de Moderação', value: logs }]);
            } else {
                embed.addFields([{ name: '📜 Logs de Moderação', value: 'Nenhum log encontrado.' }]);
            }

            await interaction.editReply({ embeds: [embed] })
            
            const logChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT);
            await logChannel.send(`Informações do usuário ${userData.username} consultadas com sucesso.`);

            info.info(`Informações do usuário ${userData.username} consultadas com sucesso.`);
        } 
    } catch (error) {
        erro.error('Erro ao buscar informações do usuário:', error);
        const logChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_ERRO_BOT);
        await logChannel.send(`Erro ao buscar informações do usuário: ${error}`);
    }
}

module.exports = { searchUserDB };
