const { EmbedBuilder } = require("discord.js");
const { client } = require("../Client");
const { info, erro } = require('../Logger');
const { saveUpdateUserPoints } = require("../utils/saveUpdateUserPoints");
const { checkingComandChannelBlocked } = require("../utils/checkingComandsExecution");

async function searchGuild(interaction) {
    if (!interaction.isCommand()) return;
    const { commandName } = interaction;

    checkingComandChannelBlocked(interaction);

    if (commandName === 'server') {

        try {
            const guild = interaction.guild;

            // Aguarde o carregamento completo do cache de membros antes de acessar guild.owner
            await guild.members.fetch();
            
            const embed = new EmbedBuilder()
                .setColor('#FFFFFF')
                .setTitle(`Informações do Servidor ${guild.name}`)
                .setAuthor({
                    name: client.user.username,
                    iconURL: client.user.displayAvatarURL({ dynamic: true }),
                })
                .addFields(
                    { name: 'ID', value: `${guild.id}`, inline: true },
                    { name: 'Criado em', value: `${guild.createdAt.toDateString()}`, inline: true },
                    { name: 'Região', value: `${guild.preferredLocale}`, inline: true },
                    { name: 'Dono', value: `<@${guild.ownerId}>`, inline: true },
                    { name: 'Total de Membros', value: `${guild.memberCount}`, inline: true },
                    { name: 'Total de Canais', value: `${guild.channels.cache.size}`, inline: true },
                    { name: 'Total de Categorias', value: `${guild.channels.cache.filter(channel => channel.type === 'GUILD_CATEGORY').size}`, inline: true },
                    { name: 'Total de Cargos', value: `${guild.roles.cache.size}`, inline: true },
                )
                .setThumbnail(guild.iconURL({ dynamic: true }))
                .setTimestamp()
                .setFooter({ text: `Por: ${client.user ? client.user.tag : "Usuário não encontrado"}`, iconURL: client.user ? client.user.displayAvatarURL({ dynamic: true }) : "" });

            await interaction.reply({ embeds: [embed] });

            saveUpdateUserPoints(interaction.user, 120, 100, 2);

            const discordChannel2 = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT)
            discordChannel2.send(`Informações do Servidor ${guild.name} consultadas por ${interaction.user.tag}`);

            info.info(`Informações do Servidor ${guild.name} consultadas com sucesso por ${interaction.user.tag}`);

        } catch (error) {
            erro.error(`Erro ao consultar informações do servidor: ${error}`);
            await interaction.reply({ content: "Erro ao consultar informações do servidor.", ephemeral: true });
        }
    }
};

module.exports = { searchGuild };