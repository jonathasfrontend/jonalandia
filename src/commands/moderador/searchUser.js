const { EmbedBuilder } = require('discord.js');
const RankingUser = require('../../models/rankingUserSechema');
const InfractionUser = require('../../models/infracoesUsersSchema');
const { client } = require("../../Client");
const { erro, info } = require('../../Logger');
const blockedChannels = require('../../config/blockedChannels.json').blockedChannels;

async function perfilInfoUser(interaction) {
    const { commandName, channelId, options, guild } = interaction;

    if (!interaction.isCommand()) return;

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

    try {
        if (commandName === 'infouser') {
            await interaction.deferReply();

            const userOption = options.getUser('usuario');
            const userId = userOption.id;
            const user = await client.users.fetch(userId);
            const member = await guild.members.fetch(userId);

            // Buscar dados de ranking e infrações no banco
            const rankingData = await RankingUser.findOne({ username: user.tag });
            const infractionData = await InfractionUser.findOne({ username: user.tag });

            if (!rankingData && !infractionData) {
                return interaction.editReply({
                    content: `❌ Nenhum dado encontrado para o usuário **${user.tag}** no banco de dados.`,
                    ephemeral: true,
                });
            }

            // Função para formatar duração
            const formatDuration = (ms) => {
                const seconds = Math.floor(ms / 1000);
                const minutes = Math.floor(seconds / 60);
                const hours = Math.floor(minutes / 60);
                const days = Math.floor(hours / 24);
                const months = Math.floor(days / 30);
                const years = Math.floor(days / 365);

                if (years > 0) return `${years} anos`;
                if (months > 0) return `${months} meses`;
                if (days > 0) return `${days} dias`;
                if (hours > 0) return `${hours} horas`;
                if (minutes > 0) return `${minutes} minutos`;
                return `${seconds} segundos`;
            };

            const now = new Date();
            const accountCreation = user.createdAt;
            const serverJoin = member.joinedAt;
            const creationDiff = formatDuration(now - accountCreation);
            const joinDiff = formatDuration(now - serverJoin);

            // Criar embed com dados combinados
            const embed = new EmbedBuilder()
                .setColor('#FFFFFF')
                .setTitle(`Perfil Completo de ${user.tag}`)
                .setThumbnail(user.displayAvatarURL({ dynamic: true }))
                .addFields(
                    { name: '👤 Nome', value: `**${user.tag}**`, inline: true },
                    { name: '🆔 ID', value: `**${user.id}**`, inline: true },
                    { name: '👤 Menção', value: `<@${user.id}>`, inline: true },
                    { name: '✅ Conta Criada', value: `${accountCreation.toLocaleDateString('pt-BR', { month: 'long', day: 'numeric', year: 'numeric' })} (há ${creationDiff})`, inline: false },
                    { name: '🟦 Entrou no Servidor', value: `${serverJoin.toLocaleDateString('pt-BR', { month: 'long', day: 'numeric', year: 'numeric' })} (há ${joinDiff})`, inline: false }
                );

            if (rankingData) {
                embed.addFields(
                    { name: '⭐ XP', value: `**${rankingData.xp.toLocaleString('pt-BR')}**`, inline: true },
                    { name: '💵 Jonacoins', value: `**${rankingData.coins.toLocaleString('pt-BR')}**`, inline: true },
                    { name: '💎 Gemas', value: `**${rankingData.gems.toLocaleString('pt-BR')}**`, inline: true}
                );
                if (rankingData.avatarUrl) {
                    embed.setImage(rankingData.avatarUrl);
                }
            }

            if (infractionData) {
                embed.addFields(
                    {
                        name: 'Infrações',
                        value: `
                        🗣️ Linguagem Inapropriada: ${infractionData.infractions.inappropriateLanguage}
                        ⏳ Timeouts: ${infractionData.infractions.timeouts}
                        🚪 Expulsões de Canal de Voz: ${infractionData.infractions.voiceChannelKicks}
                        🚪 Expulsões do Servidor: ${infractionData.infractions.expulsion}
                        ⛔ Bans: ${infractionData.infractions.bans}
                        🔓 Unbans: ${infractionData.infractions.unbans}
                        💬 Flood Timeouts: ${infractionData.infractions.floodTimeouts}
                        📂 Arquivos Bloqueados: ${infractionData.infractions.blockedFiles}
                        🔗 Links Postados: ${infractionData.infractions.serverLinksPosted}`,
                        inline: false,
                    }
                );

                if (infractionData.logs && infractionData.logs.length > 0) {
                    const logs = infractionData.logs
                        .map(
                            (log) => `**[${log.type}]** ${log.reason} (por ${log.moderator} em ${new Date(log.date).toLocaleDateString()})`
                        )
                        .join('\n');
                    embed.addFields([{ name: '📜 Logs de Moderação', value: logs }]);
                } else {
                    embed.addFields([{ name: '📜 Logs de Moderação', value: 'Nenhum log encontrado.' }]);
                }
            }

            await interaction.editReply({ embeds: [embed] });

            const logChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT);
            await logChannel.send(`Comando de perfil executado para ${user.tag} por ${interaction.user.tag} no servidor ${interaction.guild.name}`);
            info.info(`Comando de perfil executado com sucesso para ${user.tag}`);
        }
    } catch (error) {
        erro.error('Erro ao executar o comando de perfil', error);
        const logChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_ERRO_BOT);
        await logChannel.send(`Erro ao executar o comando de perfil: ${error.message}`);
    }
}

module.exports = { perfilInfoUser };
