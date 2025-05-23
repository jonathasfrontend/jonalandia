const { EmbedBuilder } = require('discord.js');
const User = require('../models/onPerfilUserSechema');
const { client } = require("../Client");
const { erro, info } = require('../logger');
const { checkingComandChannelBlocked } = require('../utils/checkingComandsExecution');

async function Perfil(interaction) {
    const { commandName, options } = interaction;

    if (!interaction.isCommand()) return;

    const authorizedExecutionComand = await checkingComandChannelBlocked(interaction);
    if (!authorizedExecutionComand) return;

    try {
        if (commandName === 'perfil') {
            const userOption = options.getUser('usuario');
            const userData = await User.findOne({ username: userOption.username });

            if (!userData) {
                return interaction.reply({ content: 'Este Usuario ainda não possui um perfil.', ephemeral: true });
            }

            const guildOwnerId = interaction.guild.ownerId;
            if (userOption.id === guildOwnerId) {
                if (interaction.user.id !== guildOwnerId) {
                    return interaction.reply({ content: 'Você não tem permissão para ver o perfil do dono do servidor.', ephemeral: true });
                }
            }

            // Dados adicionais do usuário
            const userId = userOption.id;
            const user = await client.users.fetch(userId);
            const member = await interaction.guild.members.fetch(userId);

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

            const embed = new EmbedBuilder()
                .setColor('#FFFFFF')
                .setTitle(`Perfil de ${userData.username}`)
                .setThumbnail(user.displayAvatarURL({ dynamic: true }))
                .addFields(
                    { name: '👤 Nome', value: `${user.tag}`, inline: true },
                    { name: '🆔 ID', value: `${user.id}`, inline: true },
                    { name: '👤 Menção', value: `<@${user.id}>`, inline: true },
                    { name: '✅ Conta Criada', value: `${accountCreation.toLocaleDateString('pt-BR', { month: 'long', day: 'numeric', year: 'numeric' })} (há ${creationDiff})`, inline: false },
                    { name: '🟦 Entrou no Servidor', value: `${serverJoin.toLocaleDateString('pt-BR', { month: 'long', day: 'numeric', year: 'numeric' })} (há ${joinDiff})`, inline: false },
                    { name: '⭐ XP', value: `${userData.xp.toLocaleString('pt-BR')}`, inline: true },
                    { name: '💵 Jonacoins', value: `${userData.coins.toLocaleString('pt-BR')}`, inline: true },
                    { name: '💎 Gemas', value: `${userData.gems.toLocaleString('pt-BR')}`, inline: true }                    
                )
                .setImage(userData.bannerUrl || null) // Banner opcional
                .setFooter({ text: 'Continue participando para ganhar mais pontos!', iconURL: client.user.displayAvatarURL({ dynamic: true }) });

            await interaction.reply({ embeds: [embed] });

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

module.exports = { Perfil };