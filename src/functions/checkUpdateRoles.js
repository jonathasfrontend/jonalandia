const cron = require('node-cron');
const { logger, botEvent, databaseEvent } = require('../logger');
const { client } = require("../Client");

function UpdateRoles() {
    const context = { module: 'ROLES' };
    
    logger.info('Iniciando atualização automática de cargos', context);

    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    const cargoRecemChegado = process.env.CARGO_RECEM_CHEGADO;
    const cargoMembroPlus = process.env.CARGO_MEMBRO_PLUS;

    if (!guild) {
        logger.error('Guild não encontrada para atualização de cargos', context);
        botEvent('ROLE_UPDATE_GUILD_NOT_FOUND', 'Guild não encontrada');
        return;
    }

    try {
        logger.debug(`Buscando membros do servidor ${guild.name} para atualização de cargos`, context);

        guild.members.fetch().then(members => {
            logger.info(`Verificando ${members.size} membros para atualização de cargos`, {
                ...context,
                guild: guild.name,
                memberCount: members.size
            });

            let promotedCount = 0;
            let checkedCount = 0;

            members.forEach(member => {
                if (member.user.bot) return; // Pular bots

                const recemChegadoRole = member.roles.cache.has(cargoRecemChegado);
                checkedCount++;

                const memberContext = {
                    ...context,
                    user: member.user.tag,
                    guild: guild.name
                };

                if (recemChegadoRole) {
                    const joinedAt = member.joinedAt;
                    const now = new Date();
                    const oneMonthAgo = new Date(now);
                    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

                    logger.debug(`Verificando elegibilidade para ${member.user.tag} (entrou em ${joinedAt.toLocaleDateString()})`, memberContext);

                    if (joinedAt <= oneMonthAgo) {
                        logger.info(`Promovendo ${member.user.tag} para Membro Plus após um mês no servidor`, memberContext);

                        try {
                            member.roles.add(cargoMembroPlus);
                            promotedCount++;

                            logger.info(`Cargo "Membro Plus" adicionado para ${member.user.tag}`, memberContext);
                            botEvent('MEMBER_PROMOTED', `${member.user.tag} promovido para Membro Plus`);

                            // Enviar DM de parabéns
                            member.send(`Parabéns, você ${member.user.tag} recebeu o cargo de Membro Plus após um mês no servidor Jonalandia!`)
                                .then(() => {
                                    logger.debug(`DM de promoção enviada para ${member.user.tag}`, memberContext);
                                    botEvent('PROMOTION_DM_SENT', `DM enviada para ${member.user.tag}`);
                                })
                                .catch(error => {
                                    logger.warn(`Erro ao enviar DM de promoção para ${member.user.tag}`, memberContext, error);
                                    botEvent('PROMOTION_DM_FAILED', `Falha ao enviar DM para ${member.user.tag}: ${error.message}`);
                                });

                            // Log no canal
                            const discordChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_INFO_BOT);
                            if (discordChannel) {
                                try {
                                    discordChannel.send(`Cargo "Membro Plus" adicionado ao membro ${member.user.tag} após um mês.`);
                                    logger.debug('Log de promoção enviado para canal', memberContext);
                                } catch (logError) {
                                    logger.warn('Erro ao enviar log para canal', memberContext, logError);
                                }
                            } else {
                                logger.warn('Canal de logs não encontrado', memberContext);
                            }

                        } catch (error) {
                            logger.error(`Erro ao atualizar cargos para ${member.user.tag}`, memberContext, error);
                            botEvent('ROLE_UPDATE_FAILED', `Erro ao promover ${member.user.tag}: ${error.message}`);

                            const discordChannel = client.channels.cache.get(process.env.CHANNEL_ID_LOGS_ERRO_BOT);
                            if (discordChannel) {
                                try {
                                    discordChannel.send(`Erro ao atualizar cargos para o membro ${member.user.tag}`);
                                } catch (logError) {
                                    logger.error('Erro ao enviar log de erro', memberContext, logError);
                                }
                            }
                        }
                    } else {
                        logger.debug(`${member.user.tag} ainda não completou um mês (entrou em ${joinedAt.toLocaleDateString()})`, memberContext);
                    }
                } else {
                    logger.silly(`${member.user.tag} não possui cargo de recém-chegado`, memberContext);
                }
            });

            logger.info(`Atualização de cargos concluída`, {
                ...context,
                guild: guild.name,
                membersChecked: checkedCount,
                membersPromoted: promotedCount
            });

            botEvent('ROLE_UPDATE_COMPLETED', `Verificados: ${checkedCount}, Promovidos: ${promotedCount}`);

        }).catch(error => {
            logger.error('Erro ao buscar membros para atualização de cargos', context, error);
            botEvent('ROLE_UPDATE_FETCH_ERROR', `Erro ao buscar membros: ${error.message}`);
        });

    } catch (error) {
        logger.error('Erro na atualização automática de cargos', context, error);
        botEvent('ROLE_UPDATE_ERROR', `Erro na atualização: ${error.message}`);
    }
}

// Agendar a função para rodar a cada mes
function checkUpdateRoles() {
    const context = { module: 'ROLES' };
    
    try {
        cron.schedule('0 0 1 * *', () => { // Executa no dia 1º de cada mês às 00:00
            logger.info('Executando verificação automática de atualização de cargos', context);
            botEvent('ROLE_UPDATE_SCHEDULED', 'Verificação automática de cargos executada');
            UpdateRoles();
        });

        logger.info('Agendador de atualização de cargos configurado com sucesso (mensalmente no dia 1º às 00:00)', context);
        botEvent('ROLE_UPDATE_SCHEDULER_CONFIGURED', 'Agendador configurado para executar mensalmente no dia 1º às 00:00');

    } catch (error) {
        logger.error('Erro ao configurar agendador de atualização de cargos', context, error);
    }
}

module.exports = { checkUpdateRoles };
