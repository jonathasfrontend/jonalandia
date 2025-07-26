const { Collection, italic } = require('discord.js');
const { EmbedBuilder } = require("discord.js");
const { client } = require("../../Client");
const { logger, securityEvent, databaseEvent } = require('../../logger');
const { saveUserInfractions } = require('../../utils/saveUserInfractions');
const members = new Collection();

async function antiFloodChat(message) {
    if (!message.inGuild()) return;
    if (message.author.bot) return;
    if (message.author.id === message.guild.ownerId) return;

    const { author, channel, member } = message;
    const context = {
        module: 'SECURITY',
        user: author.tag,
        guild: message.guild?.name
    };

    if (member && member.roles.cache.has(process.env.CARGO_MODERADOR)) return;

    const count = members.get(author.id);
    if (!count) {
        members.set(author.id, 1);
        logger.silly(`Primeira mensagem registrada para ${author.tag}`, context);
        return;
    }

    const newCount = count + 1;
    members.set(author.id, newCount);

    logger.debug(`Contador de mensagens para ${author.tag}: ${newCount}`, context);

    if (newCount >= 5) {
        members.delete(author.id);

        logger.warn(`Flood detectado para usuário ${author.tag} - aplicando timeout`, context);
        securityEvent('ANTI_FLOOD_TRIGGERED', author, message.guild, `${newCount} mensagens rapidamente`);

        const reason = ` O usuário ${author} levou timeout por flood de mensagens!`;
        const type = 'floodTimeouts';

        try {
            // Salvar infração
            await saveUserInfractions(
                author.id,
                author.tag,
                author.displayAvatarURL({ dynamic: true }),
                author.createdAt,
                member.joinedAt,
                type,
                reason,
                client.user.tag
            );
            databaseEvent('INSERT', 'UserInfractions', true, `Flood timeout para ${author.tag}`);

        } catch (dbError) {
            logger.error('Erro ao salvar dados do flood timeout', context, dbError);
            databaseEvent('INSERT/UPDATE', 'Database', false, dbError.message);
        }

        try {
            // Aplicar timeout
            await member?.timeout(60_000, "Flood de mensagens");
            logger.info(`Timeout aplicado para ${author.tag} por flood de mensagens`, context);

        } catch (timeoutError) {
            logger.error(`Erro ao aplicar timeout para ${author.tag}`, context, timeoutError);
            securityEvent('TIMEOUT_FAILED', author, message.guild, timeoutError.message);
        }

        const embed = new EmbedBuilder()
            .setColor('Red')
            .setAuthor({
                name: client.user.username,
                iconURL: client.user.displayAvatarURL({ dynamic: true }),
            })
            .setDescription(`${author} evite o flood de mensagens por favor! > leia as regras para evitar punições severas ${italic('Você poderá enviar mensagens novamente em breve...')}`)
            .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: `Envio de mensegens simultaneas monitorado por: ${client.user.tag}`, iconURL: `${client.user.displayAvatarURL({ dynamic: true })}` });

        try {
            await message.reply({ content: `||${author}||`, embeds: [embed], ephemeral: true });
            logger.debug('Embed de aviso enviado para usuário', context);
        } catch (replyError) {
            logger.error('Erro ao enviar embed de aviso', context, replyError);
        }

        // Enviar log para canal
        const discordChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT);
        if (discordChannel) {
            try {
                await discordChannel.send(`${author} levou timeout por flood de mensagem!`);
                logger.debug('Log enviado para canal de logs', context);
            } catch (logError) {
                logger.error('Erro ao enviar log para canal', context, logError);
            }
        } else {
            logger.warn('Canal de logs não encontrado', context);
        }

        // Deletar mensagem após timeout
        setTimeout(async () => {
            try {
                await message.delete();
                logger.debug(`Mensagem de flood deletada para ${author.tag}`, context);
            } catch (deleteError) {
                logger.warn(`Erro ao deletar mensagem de flood para ${author.tag}`, context, deleteError);
            }
        }, 60_000);
        
        return;
    }

    // Decrementar contador após 6 segundos
    setTimeout(() => {
        const currCount = members.get(author.id);
        if (!currCount) return;
        
        const newCount = currCount - 1;
        if (newCount <= 0) {
            members.delete(author.id);
            logger.silly(`Contador resetado para ${author.tag}`, context);
        } else {
            members.set(author.id, newCount);
            logger.silly(`Contador decrementado para ${author.tag}: ${newCount}`, context);
        }
    }, 6000);
}

module.exports = { antiFloodChat };
