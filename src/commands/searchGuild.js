const { EmbedBuilder } = require("discord.js");
const { client } = require("../Client");
const { info, erro } = require('../logger');
const blockedChannels = require('../config/blockedChannels.json').blockedChannels;

const searchGuild = async (interaction) => {
    if (!interaction.isCommand()) return;
    const { commandName, channelId } = interaction;

    if (commandName === 'server') {
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

        } catch (error) {
            erro.error(`Erro ao consultar informações do servidor: ${error}`);
            await interaction.reply({ content: "Erro ao consultar informações do servidor.", ephemeral: true });
        }
    }
};

module.exports = { searchGuild };