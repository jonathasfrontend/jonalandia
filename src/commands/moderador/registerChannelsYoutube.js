const { EmbedBuilder } = require("discord.js");
const onYoutubeChannelSchema = require('../../models/onYoutubeChannelSchema');
const { client } = require("../../Client");
const { erro, info } = require('../../Logger');
const blockedChannels = require('../../config/blockedChannels.json').blockedChannels;

async function registerChannelsYoutube(interaction){
    if (!interaction.isCommand()) return;
 
    const { commandName, member, channelId, options } = interaction;
    
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
        if (commandName === 'registerchannelsyoutube'){

            const NameChannel = options.getString('channel');

            const newStreamer = {
                name: NameChannel,
            }

            await onYoutubeChannelSchema.create(newStreamer);

            const embed = new EmbedBuilder()
                .setColor('#ffffff')
                .setAuthor({
                    name: client.user.username,
                    iconURL: client.user.displayAvatarURL({ dynamic: true }),
                })
                .setTitle('Canal cadastrado com sucesso.')
                .setDescription(`Canal: ${NameChannel}`)
                .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
                .setTimestamp()
                .setFooter({ text: `Por: ${client.user.tag}`, iconURL: client.user.displayAvatarURL({ dynamic: true }) });
            await interaction.reply({ embeds: [embed], ephemeral: true });

            const logChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT);
            await logChannel.send(`Canal cadastrado com sucesso: ${NameChannel}`);

            info.info(`Canal cadastrado com sucesso: ${NameChannel}`);
        }
    } catch (error) {
        erro.error('Erro ao cadastrar o canal', error);
        const logChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_ERRO_BOT);
        await logChannel.send(`Erro ao cadastrar o canal ${error}`);
    }
}

module.exports = { registerChannelsYoutube };