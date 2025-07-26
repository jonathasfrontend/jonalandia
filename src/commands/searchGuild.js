const { EmbedBuilder } = require("discord.js"); 
const { client } = require("../Client");
const { Logger } = require('../logger');
const { checkingComandChannelBlocked } = require("../utils/checkingComandsExecution");

async function searchGuild(interaction) {
    if (!interaction.isCommand()) return;
    const { commandName } = interaction;

    const authorizedExecutionComand = await checkingComandChannelBlocked(interaction);
    if (!authorizedExecutionComand) return;

    try {
        if (commandName === 'server') {
            const guild = interaction.guild;

            await guild.members.fetch();

            const user = await client.users.fetch(guild.ownerId);
            const member = await guild.members.fetch(guild.ownerId);

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
            const serverCreated = guild.createdAt;
            const creationDiff = formatDuration(now - serverCreated);

            const bannerURL = guild.bannerURL({ size: 1024, format: 'png', dynamic: true });

            const quantidadCanaisTexto = guild.channels.cache.filter(channel => channel.type === 0).size;
            const quantidadCanaisVoz = guild.channels.cache.filter(channel => channel.type === 2).size;

            const embed = new EmbedBuilder()
                .setColor('#FFFFFF')
                .setTitle(`${guild.name}`)
                .setAuthor({
                    name: client.user.username,
                    iconURL: client.user.displayAvatarURL({ dynamic: true }),
                })
                .addFields(
                    { name: '🆔 ID', value: '```'+`${guild.id}`+'```', inline: true },
                    { name: `📁 Canais: ${guild.channels.cache.size}`, value: `#️⃣ Texto: ${quantidadCanaisTexto}\n 🔊 Voz: ${quantidadCanaisVoz}\n 🎭 Cargos: ${guild.roles.cache.size}`, inline: true },
                    { name: '👥 Usuários', value: '```cmd\n'+`${guild.memberCount} Membros`+'```', inline: true },
                    { name: '📅 Criado em', value: `${guild.createdAt.toLocaleDateString('pt-BR', { month: 'long', day: 'numeric', year: 'numeric' })} (há ${creationDiff})`, inline: true },
                    { name: '👑 Dono', value: `<@${guild.ownerId}>\n`+'`'+`${guild.ownerId}`+'`', inline: true },
                )
                .setThumbnail(guild.iconURL({ dynamic: true }))
                .setImage(bannerURL || guild.iconURL({ dynamic: true }))
                .setTimestamp()
                .setFooter({ 
                    text: `Por: ${client.user ? client.user.tag : "Usuário não encontrado"}`, 
                    iconURL: client.user ? client.user.displayAvatarURL({ dynamic: true }) : "" 
                });

            await interaction.reply({ embeds: [embed] });

            const discordChannel2 = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT)
            discordChannel2.send(`Informações do Servidor ${guild.name} consultadas por ${interaction.user.tag}`);

            Logger.info(`Informações do Servidor ${guild.name} consultadas com sucesso por ${interaction.user.tag}`);
        }
    } catch (error) {
        Logger.error(`Erro ao consultar informações do servidor: ${error}`);
        await interaction.reply({ content: "Erro ao consultar informações do servidor.", ephemeral: true });
    }
};

module.exports = { searchGuild };