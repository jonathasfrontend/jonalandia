const { EmbedBuilder } = require('discord.js');
const { client } = require('../../Client');
const { info, erro } = require('../../Logger');
const { saveUserInfractions } = require('../../utils/saveUserInfractions');
const blockedChannels = require('../../config/blockedChannels.json').blockedChannels;

async function banUser(interaction) {
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
            
            saveUserInfractions(
                userToBan.id,
                userToBan.tag,
                userToBan.displayAvatarURL({ dynamic: true }),
                userToBan.createdAt,
                memberToBan.joinedAt,
                type,
                reason,
                member.user.tag
            )

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
