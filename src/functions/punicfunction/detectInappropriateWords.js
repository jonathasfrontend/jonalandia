const { EmbedBuilder } = require('discord.js');
const { client } = require('../../Client');
const { info, erro } = require('../../logger');
const inappropriateWordsData = require('../../config/InappropriateWords.json');
const { getBlockedChannels } = require('../../utils/checkingComandsExecution');
const { saveUserInfractions } = require('../../utils/saveUserInfractions');
const { saveUpdateUserPoints } = require('../../utils/saveUpdateUserPoints');

const inappropriateWords = inappropriateWordsData.inappropriateWords;

async function detectInappropriateWords(message) {
    if (message.author.bot) return;
    
    const channelsIdBLocke = await getBlockedChannels();
    
    if (!channelsIdBLocke.includes(message.channel.id)) return;

    // Verifica cada palavra usando regex para evitar subcadeias
    const foundWord = inappropriateWords.find(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'i'); // 'i' para case-insensitive
        return regex.test(message.content);
    });

    if (foundWord) {
        try {
            await message.delete();

            const reason = `O usuário ${message.author.username} usou palavras inadequadas: ${foundWord}`;
            const type = 'inappropriateLanguage';

            saveUserInfractions(
                message.author.id,
                message.author.tag,
                message.author.displayAvatarURL({ dynamic: true }),
                message.author.createdAt,
                message.member.joinedAt,
                type,
                reason,
                client.user.tag
            )

            saveUpdateUserPoints(message.author, -200, 0, 0);

            const discordChannelDelete = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT);
            discordChannelDelete.send(`Mensagem de ${message.author.tag} deletada devido a palavras inadequadas: "${foundWord}".`);
            
            info.info(`Mensagem de ${message.author.tag} deletada devido a palavras inadequadas.`);

            const channelEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('🚫 Linguagem Inadequada Detectada')
                .setDescription(`${message.author.tag}, você usou uma linguagem inadequada e foi silenciado por **5 minutos**.`)
                .addFields(
                    { name: 'Motivo', value: 'Uso de palavras inadequadas', inline: true },
                    { name: 'Canal', value: `<#${message.channel.id}>`, inline: true },
                )
                .setFooter({ text: `Envio de palavras inapropriadas monitorado por: ${client.user.tag}`, iconURL: `${client.user.displayAvatarURL({ dynamic: true })}` })
                .setTimestamp();
            await message.channel.send({ embeds: [channelEmbed], ephemeral: true });

            const userEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('⚠️ Aviso de Silenciamento')
                .setDescription(`Você foi silenciado no servidor **${message.guild.name}** por **5 minutos** devido ao uso de palavras inadequadas.`)
                .addFields(
                    { name: 'Motivo', value: 'Uso de palavras inadequadas', inline: true },
                    { name: 'Servidor', value: message.guild.name, inline: true },
                )
                .setFooter({ text: `Envio de palavras inapropriadas monitorado por: ${client.user.tag}`, iconURL: `${client.user.displayAvatarURL({ dynamic: true })}` })
                .setTimestamp();
            await message.author.send({ embeds: [userEmbed], ephemeral: true });

            await message.member.timeout(300000, 'Uso de linguagem imprópria');

            info.info(`Timeout de 5 minutos aplicado para ${message.author.tag} por linguagem imprópria.`);

            const discordChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT);
            const logEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('🔴 Timeout Aplicado')
                .setDescription(`${message.author.tag} foi silenciado no servidor **${message.guild.name}** por **5 minutos** devido ao uso de linguagem inadequada.`)
                .addFields(
                    { name: 'Motivo', value: 'Uso de palavras inadequadas', inline: true },
                    { name: 'Canal', value: `<#${message.channel.id}>`, inline: true },
                    { name: 'Moderador', value: `${message.guild.owner?.user.tag}`, inline: true }
                )
                .setFooter({ text: `Ação registrada em ${new Date().toLocaleString()}`, iconURL: message.guild.iconURL() })
                .setTimestamp();
            await discordChannel.send({ embeds: [logEmbed], ephemeral: true });
            
        } catch (error) {
            const discordChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_ERRO_BOT);
            discordChannel.send(`Erro ao tentar deletar mensagem de ${message.author.tag} por palavras inadequadas! ${error}`);

            erro.error(`Erro ao tentar deletar mensagem de ${message.author.tag} por palavras inadequadas! ${error}`);
        }
    }
}

module.exports = { detectInappropriateWords };
