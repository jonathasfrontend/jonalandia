const { EmbedBuilder } = require('discord.js');
const { getApiUrl } = require('../../api');

async function searchUserDB(interaction) {
    let user;
    try {
        user = interaction.options.getUser('usuario');
        if (!user) {
            return interaction.reply({
                content: '❌ Você precisa mencionar um usuário válido!',
                ephemeral: true
            });
        }

        const username = user.username;

        const api = getApiUrl();
        await interaction.deferReply({ ephemeral: true });

        const response = await api.get(`/users/${username}`);
        const userData = response.data;

        const embed = new EmbedBuilder()
            .setTitle(`Informações do Usuário: ${userData.username}`)
            .setThumbnail(userData.avatarUrl)
            .setColor('#3498db')
            .addFields(
                { name: 'Infrações', value: `
                🗣️ Linguagem Inapropriada: ${userData.infractions.inappropriateLanguage}
                ⏳ Timeouts: ${userData.infractions.timeouts}
                🚪 Expulsões de Canal de Voz: ${userData.infractions.voiceChannelKicks}
                ⛔ Bans: ${userData.infractions.bans}
                🔓 Unbans: ${userData.infractions.unbans}
                💬 Flood Timeouts: ${userData.infractions.floodTimeouts}
                📂 Arquivos Bloqueados: ${userData.infractions.blockedFiles}
                🔗 Links Postados: ${userData.infractions.serverLinksPosted}`, inline: false },
                { name: 'Conta Criada em', value: new Date(userData.accountCreatedDate).toLocaleDateString(), inline: true },
                { name: 'Entrou no Servidor em', value: new Date(userData.joinedServerDate).toLocaleDateString(), inline: true }
            )
            .setFooter({ text: 'Informações atualizadas em tempo real', iconURL: userData.avatarUrl });

        if (userData.logs && userData.logs.length > 0) {
            const logs = userData.logs.map(log =>
                `**[${log.type}]** ${log.reason} (por ${log.moderator} em ${new Date(log.date).toLocaleDateString()})`
            ).join('\n');

            embed.addFields([{ name: '📜 Logs de Moderação', value: logs }]);
        } else {
            embed.addFields([{ name: '📜 Logs de Moderação', value: 'Nenhum log encontrado.' }]);
        }

        await interaction.editReply({ embeds: [embed] });

    } catch (error) {
        if (error.response && error.response.status === 404) {
            await interaction.editReply({
                content: `❌ Usuário ${user ? `**${user.username}** ` : ''}não encontrado.`,
                ephemeral: true
            });
        } else {
            console.error(error);
            await interaction.editReply({
                content: '❌ Ocorreu um erro ao buscar as informações do usuário. Tente novamente mais tarde.',
                ephemeral: true
            });
        }
    }
}

module.exports = { searchUserDB };
