const { EmbedBuilder } = require('discord.js');
const { client } = require("../../Client");
const { info, erro } = require('../../logger');
const { default: axios } = require('axios');
const blockedChannels = require('../../config/blockedChannels.json').blockedChannels;

const timeout = async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName, options, channelId, member } = interaction;

    if (commandName === 'timeout') {
        const user = options.getUser('usuario');
        const guildMember = interaction.guild.members.cache.get(user.id);

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

        if (!guildMember) {
            await interaction.reply({ content: 'Usuário não encontrado no servidor.', ephemeral: true });
            return;
        }

        const serverUrl = 'https://jonalandia-server.vercel.app/users';
        const payload = {
            username: user.tag,
            avatarUrl: user.displayAvatarURL({ dynamic: true }),
            accountCreatedDate: user.createdAt,
            joinedServerDate: guildMember.joinedAt,
            infraction: 'timeouts',
            reason: `O usuário ${user.tag} recebeu um timeout de 3 minutos.`,
            moderator: member.user.tag,
        };
    
        try {
            await axios.post(`${serverUrl}/${user.tag}`, payload, {
                headers: { 'Content-Type': 'application/json' },
            });
            info.info(`Infração registrada no backend para o usuário ${user.tag}.`);
        } catch (backendError) {
            erro.error(`Erro ao enviar dados para o backend: ${backendError.message}`);
        }

        try {
            await guildMember.timeout(3 * 60 * 1000, 'Timeout de 3 minutos aplicado pelo bot');
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('Timeout aplicado')
                .setDescription(`O usuário ${user.tag} recebeu um timeout de 3 minutos.`)
                .setTimestamp()
                .setFooter({ text: `Por: ${client.user.tag}`, iconURL: client.user.displayAvatarURL({ dynamic: true }) });

            await interaction.reply({ embeds: [embed] });

            const discordChannel2 = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT)
            discordChannel2.send(`O usuário ${user.tag} recebeu um timeout de 3 minutos.`);

        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Não foi possível aplicar o timeout no usuário.', ephemeral: true });
        }
    }
};

module.exports = { timeout };
