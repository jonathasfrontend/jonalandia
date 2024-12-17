const Premio = require('../../models/onPremioSorteioSchema');
const { EmbedBuilder } = require("discord.js");
const { client } = require("../../Client");
const { erro, info } = require('../../Logger');
const blockedChannels = require('../../config/blockedChannels.json').blockedChannels;

async function premioSorteio(interaction){
    if (!interaction.isCommand()) return;
 
    const { commandName, member, channelId } = interaction;
    
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
        if (commandName === 'premiosorteio'){
            const premio = interaction.options.getString('premio');
            const dono = interaction.user.username;
    
            const novoPremio = new Premio({
                premio,
                dono,
            });
    
            await novoPremio.save();
    
            const embed = await new EmbedBuilder()
                .setColor("#00FF00")
                .setTitle(' 🎁 Prêmio cadastrado com sucesso!')
                .setAuthor({
                    name: client.user.username,
                    iconURL: client.user.displayAvatarURL({ dynamic: true }),
                })
                .setDescription(' O prêmio foi registrado com sucesso.')
                .setThumbnail(`${client.user.displayAvatarURL({ dynamic: true })}`)
                .setTimestamp()
                .setFooter({ text: `Por: ${client.user.tag}`, iconURL: `${client.user.displayAvatarURL({ dynamic: true })}` });
    
            await interaction.reply({ embeds: [embed], ephemeral: true });

            const logChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT);
            await logChannel.send(`Prêmio cadastrado com sucesso.`);
            
            info.info('Prêmio cadastrado com sucesso.');
        }
    } catch (error) {
        erro.error('Erro ao cadastrar o premio', error);
        const logChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_ERRO_BOT);
        await logChannel.send(`Erro ao cadastrar o premio ${error}`);
    }
}

module.exports = { premioSorteio };