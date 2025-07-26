const { logger, commandExecuted, databaseEvent } = require('../logger');
const { EmbedBuilder } = require('discord.js');
const { client } = require("../Client");
const Sorteio = require('../models/onSorteioSchema');
const { checkingComandChannelBlocked } = require('../utils/checkingComandsExecution');

async function sorteioUser(interaction) {
    const { commandName } = interaction;
    const context = {
        module: 'COMMAND',
        command: 'sorteio',
        user: interaction.user.tag,
        guild: interaction.guild?.name
    };

    if (!interaction.isCommand()) return;

    logger.debug('Iniciando comando sorteio', context);

    const authorizedExecutionComand = await checkingComandChannelBlocked(interaction);
    if (!authorizedExecutionComand) {
        logger.warn('Comando sorteio bloqueado - canal não autorizado', context);
        return;
    }

    try {
        if (commandName === 'sorteio') {
            const usuarioId = interaction.options.getUser('usuario').id;
            const nomeUsuario = interaction.options.getUser('usuario').username;
            const targetUser = interaction.options.getUser('usuario');

            logger.debug(`Tentativa de cadastro no sorteio para usuário: ${nomeUsuario}`, context);

            const usuarioExistente = await Sorteio.findOne({ usuarioId });
            databaseEvent('SELECT', 'Sorteio', true, `Verificando usuário existente: ${nomeUsuario}`);

            if (usuarioExistente) {
                logger.info(`Usuário ${nomeUsuario} já cadastrado no sorteio`, context);

                const embedJaCadastrado = new EmbedBuilder()
                    .setColor('Yellow')
                    .setAuthor({
                        name: client.user.username,
                        iconURL: client.user.displayAvatarURL({ dynamic: true }),
                    })
                    .setTitle(`${nomeUsuario} já está cadastrado no sorteio!`)
                    .setDescription('Você já está participando do sorteio.')
                    .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
                    .setTimestamp()
                    .setFooter({ text: `Por: ${client.user.tag}`, iconURL: client.user.displayAvatarURL({ dynamic: true }) });

                await interaction.reply({ embeds: [embedJaCadastrado], ephemeral: true });
                commandExecuted('sorteio', interaction.user, interaction.guild, true);

            } else {
                const novoSorteio = new Sorteio({
                    usuarioId,
                    nomeUsuario,
                });

                await novoSorteio.save();
                databaseEvent('INSERT', 'Sorteio', true, `Usuário ${nomeUsuario} cadastrado`);

                logger.info(`Usuário ${nomeUsuario} cadastrado no sorteio com sucesso`, context);

                const embedCadastrado = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setAuthor({
                        name: client.user.username,
                        iconURL: client.user.displayAvatarURL({ dynamic: true }),
                    })
                    .setTitle(`${nomeUsuario} foi cadastrado no sorteio!`)
                    .setDescription('Agora este usuário está participando do sorteio.')
                    .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
                    .setTimestamp()
                    .setFooter({ text: `Por: ${client.user.tag}`, iconURL: client.user.displayAvatarURL({ dynamic: true }) });

                await interaction.reply({ embeds: [embedCadastrado], ephemeral: true });

                const logChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT);
                if (logChannel) {
                    await logChannel.send(`Usuário ${nomeUsuario} cadastrado no sorteio.`);
                    logger.debug('Mensagem de log enviada para canal de logs', context);
                } else {
                    logger.warn('Canal de logs não encontrado', context);
                }

                commandExecuted('sorteio', interaction.user, interaction.guild, true);
            }
        }
    } catch (error) {
        logger.error('Erro ao processar o comando de sorteio', context, error);
        databaseEvent('INSERT/SELECT', 'Sorteio', false, error.message);
        commandExecuted('sorteio', interaction.user, interaction.guild, false);

        const logChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_ERRO_BOT);
        if (logChannel) {
            try {
                await logChannel.send(`Erro ao processar o comando de sorteio: ${error.message}`);
            } catch (logError) {
                logger.error('Erro ao enviar mensagem para canal de erro', context, logError);
            }
        }

        if (!interaction.replied) {
            try {
                await interaction.reply({ content: 'Ocorreu um erro ao processar o sorteio. Tente novamente.', ephemeral: true });
            } catch (replyError) {
                logger.error('Erro ao responder interação após falha', context, replyError);
            }
        }
    }
}

module.exports = { sorteioUser };
