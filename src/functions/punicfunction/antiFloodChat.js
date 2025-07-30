const { Collection, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { client } = require("../../Client");
const { logger, securityEvent, databaseEvent } = require('../../logger');
const { saveUserInfractions } = require('../../utils/saveUserInfractions');

/**
 * Configurações do sistema Anti-Flood
 * IMPORTANTE: Ajuste estes valores conforme necessário para seu servidor
 */
const CONFIG = {
    // Limite de mensagens permitidas no período de tempo
    MAX_MESSAGES: 3,
    
    // Período de tempo em milissegundos (padrão: 10 segundos)
    TIME_WINDOW: 10000,
    
    // Duração do timeout em milissegundos (padrão: 5 minutos)
    TIMEOUT_DURATION: 5 * 60 * 1000,
    
    // Tempo para decrementar mensagens antigas (padrão: 2 segundos)
    DECAY_TIME: 2000,
    
    // Número de avisos antes do timeout
    MAX_WARNINGS: 2,
    
    // Cooldown entre avisos (em milissegundos)
    WARNING_COOLDOWN: 30000
};

/**
 * Armazenamento temporário de dados dos usuários
 */
class UserFloodData {
    constructor() {
        // Armazena timestamps das mensagens por usuário
        this.userMessages = new Collection();
        
        // Armazena avisos dados aos usuários
        this.userWarnings = new Collection();
        
        // Armazena cooldowns de avisos
        this.warningCooldowns = new Collection();
    }

    /**
     * Adiciona uma nova mensagem para o usuário
     * @param {string} userId - ID do usuário
     * @param {number} timestamp - Timestamp da mensagem
     */
    addMessage(userId, timestamp = Date.now()) {
        if (!this.userMessages.has(userId)) {
            this.userMessages.set(userId, []);
        }
        
        const messages = this.userMessages.get(userId);
        messages.push(timestamp);
        
        // Remove mensagens antigas (fora da janela de tempo)
        const cutoff = timestamp - CONFIG.TIME_WINDOW;
        const recentMessages = messages.filter(msgTime => msgTime > cutoff);
        
        this.userMessages.set(userId, recentMessages);
        
        return recentMessages.length;
    }

    /**
     * Obtém o número de mensagens recentes do usuário
     * @param {string} userId - ID do usuário
     * @returns {number} Número de mensagens na janela de tempo
     */
    getRecentMessageCount(userId) {
        const messages = this.userMessages.get(userId);
        if (!messages) return 0;
        
        const cutoff = Date.now() - CONFIG.TIME_WINDOW;
        return messages.filter(msgTime => msgTime > cutoff).length;
    }

    /**
     * Adiciona um aviso ao usuário
     * @param {string} userId - ID do usuário
     */
    addWarning(userId) {
        const warnings = this.userWarnings.get(userId) || 0;
        this.userWarnings.set(userId, warnings + 1);
        return warnings + 1;
    }

    /**
     * Obtém o número de avisos do usuário
     * @param {string} userId - ID do usuário
     * @returns {number} Número de avisos
     */
    getWarnings(userId) {
        return this.userWarnings.get(userId) || 0;
    }

    /**
     * Verifica se o usuário está em cooldown de aviso
     * @param {string} userId - ID do usuário
     * @returns {boolean} True se estiver em cooldown
     */
    isInWarningCooldown(userId) {
        const cooldownEnd = this.warningCooldowns.get(userId);
        if (!cooldownEnd) return false;
        
        if (Date.now() > cooldownEnd) {
            this.warningCooldowns.delete(userId);
            return false;
        }
        
        return true;
    }

    /**
     * Define cooldown de aviso para o usuário
     * @param {string} userId - ID do usuário
     */
    setWarningCooldown(userId) {
        this.warningCooldowns.set(userId, Date.now() + CONFIG.WARNING_COOLDOWN);
    }

    /**
     * Limpa todos os dados do usuário
     * @param {string} userId - ID do usuário
     */
    clearUser(userId) {
        this.userMessages.delete(userId);
        this.userWarnings.delete(userId);
        this.warningCooldowns.delete(userId);
    }

    /**
     * Limpeza automática de dados antigos (executar periodicamente)
     */
    cleanup() {
        const now = Date.now();
        const cutoff = now - (CONFIG.TIME_WINDOW * 2); // Manter dados por 2x a janela de tempo
        
        // Limpar mensagens antigas
        for (const [userId, messages] of this.userMessages.entries()) {
            const recentMessages = messages.filter(msgTime => msgTime > cutoff);
            if (recentMessages.length === 0) {
                this.userMessages.delete(userId);
            } else {
                this.userMessages.set(userId, recentMessages);
            }
        }
        
        // Limpar avisos antigos (após 1 hora)
        const warningCutoff = now - (60 * 60 * 1000);
        for (const [userId, timestamp] of this.warningCooldowns.entries()) {
            if (timestamp < warningCutoff) {
                this.userWarnings.delete(userId);
                this.warningCooldowns.delete(userId);
            }
        }
    }
}

// Instância global dos dados de flood
const floodData = new UserFloodData();

// Limpeza automática a cada 5 minutos
setInterval(() => {
    floodData.cleanup();
}, 5 * 60 * 1000);

/**
 * Verifica se o usuário tem permissões especiais (imune ao anti-flood)
 * @param {GuildMember} member - Membro do servidor
 * @returns {boolean} True se for imune
 */
function isUserImmune(member) {
    if (!member) return false;
    
    // Dono do servidor é imune
    if (member.id === member.guild.ownerId) return true;
    
    // Administradores são imunes
    if (member.permissions.has(PermissionFlagsBits.Administrator)) return true;
    
    // Moderadores são imunes (ajuste o ID do cargo conforme necessário)
    if (process.env.CARGO_MODERADOR && member.roles.cache.has(process.env.CARGO_MODERADOR)) return true;
    
    return false;
}

/**
 * Cria embed de aviso para flood
 * @param {User} user - Usuário que fez flood
 * @param {number} warnings - Número de avisos
 * @returns {EmbedBuilder} Embed de aviso
 */
function createWarningEmbed(user, warnings) {
    const remainingWarnings = CONFIG.MAX_WARNINGS - warnings;
    
    return new EmbedBuilder()
        .setColor('#FFA500')
        .setTitle('⚠️ Aviso - Flood Detectado')
        .setDescription(
            `${user}, você está enviando mensagens muito rapidamente!\n\n` +
            `**Avisos:** ${warnings}/${CONFIG.MAX_WARNINGS}\n` +
            `**Restam:** ${remainingWarnings} aviso(s) antes do timeout\n\n` +
            `Por favor, diminua a velocidade das suas mensagens.`
        )
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .setFooter({ 
            text: `Sistema Anti-Flood • ${client.user.tag}`, 
            iconURL: client.user.displayAvatarURL({ dynamic: true }) 
        })
        .setTimestamp();
}

/**
 * Cria embed de timeout por flood
 * @param {User} user - Usuário que levou timeout
 * @returns {EmbedBuilder} Embed de timeout
 */
function createTimeoutEmbed(user) {
    const timeoutMinutes = Math.floor(CONFIG.TIMEOUT_DURATION / 60000);
    
    return new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('🔇 Timeout Aplicado - Flood de Mensagens')
        .setDescription(
            `${user} foi temporariamente silenciado por **${timeoutMinutes} minutos** ` +
            `devido ao flood de mensagens.\n\n` +
            `**Motivo:** Excesso de mensagens em pouco tempo\n` +
            `**Duração:** ${timeoutMinutes} minutos\n\n` +
            `Leia as regras do servidor para evitar futuras punições.`
        )
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .setFooter({ 
            text: `Sistema Anti-Flood • ${client.user.tag}`, 
            iconURL: client.user.displayAvatarURL({ dynamic: true }) 
        })
        .setTimestamp();
}

/**
 * Registra infração no banco de dados
 * @param {User} user - Usuário que cometeu a infração
 * @param {GuildMember} member - Membro do servidor
 * @param {string} type - Tipo da infração
 * @param {string} reason - Motivo da infração
 */
async function registerInfraction(user, member, type, reason) {
    try {
        await saveUserInfractions(
            user.id,
            user.tag,
            user.displayAvatarURL({ dynamic: true }),
            user.createdAt,
            member?.joinedAt || new Date(),
            type,
            reason,
            client.user.tag
        );
        
        databaseEvent('INSERT', 'UserInfractions', true, `${type} registrado para ${user.tag}`);
        return true;
    } catch (error) {
        logger.error('Erro ao registrar infração no banco de dados', {
            module: 'ANTI_FLOOD',
            user: user.tag,
            type,
            error: error.message
        });
        
        databaseEvent('INSERT', 'UserInfractions', false, error.message);
        return false;
    }
}

/**
 * Envia notificação para o canal de logs
 * @param {User} user - Usuário
 * @param {string} action - Ação tomada
 * @param {number} messageCount - Número de mensagens
 */
async function sendLogNotification(user, action, messageCount) {
    const logChannelId = process.env.CHANNEL_ID_LOGS_INFO_BOT;
    if (!logChannelId) return;
    
    const logChannel = client.channels.cache.get(logChannelId);
    if (!logChannel) {
        logger.warn('Canal de logs não encontrado', { 
            module: 'ANTI_FLOOD',
            channelId: logChannelId 
        });
        return;
    }
    
    try {
        const embed = new EmbedBuilder()
            .setColor(action === 'timeout' ? '#FF0000' : '#FFA500')
            .setTitle(`🛡️ Anti-Flood - ${action === 'timeout' ? 'Timeout' : 'Aviso'}`)
            .addFields(
                { name: 'Usuário', value: `${user} (${user.tag})`, inline: true },
                { name: 'Ação', value: action === 'timeout' ? 'Timeout aplicado' : 'Aviso enviado', inline: true },
                { name: 'Mensagens', value: `${messageCount} em ${CONFIG.TIME_WINDOW/1000}s`, inline: true }
            )
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .setTimestamp();
            
        await logChannel.send({ embeds: [embed] });
    } catch (error) {
        logger.error('Erro ao enviar notificação para logs', {
            module: 'ANTI_FLOOD',
            error: error.message
        });
    }
}

/**
 * Função principal do sistema Anti-Flood
 * @param {Message} message - Mensagem do Discord
 */
async function antiFloodChat(message) {
    // Verificações básicas
    if (!message.inGuild()) return;
    if (message.author.bot) return;
    
    const { author, member, guild } = message;
    const context = {
        module: 'ANTI_FLOOD',
        user: author.tag,
        guild: guild?.name,
        userId: author.id
    };
    
    // Verificar se o usuário é imune ao anti-flood
    if (isUserImmune(member)) {
        logger.silly(`Usuário ${author.tag} é imune ao anti-flood`, context);
        return;
    }
    
    try {
        // Adicionar mensagem e obter contagem
        const messageCount = floodData.addMessage(author.id);
        
        logger.debug(`Mensagem registrada para ${author.tag}: ${messageCount}/${CONFIG.MAX_MESSAGES}`, context);
        
        // Verificar se ultrapassou o limite
        if (messageCount > CONFIG.MAX_MESSAGES) {
            const warnings = floodData.getWarnings(author.id);
            
            logger.warn(`Flood detectado para ${author.tag}: ${messageCount} mensagens`, {
                ...context,
                messageCount,
                warnings
            });
            
            // Se já tem avisos suficientes, aplicar timeout
            if (warnings >= CONFIG.MAX_WARNINGS) {
                logger.info(`Aplicando timeout para ${author.tag} por flood persistente`, context);
                
                // Registrar infração de timeout
                const timeoutReason = `Timeout por flood de mensagens (${messageCount} mensagens em ${CONFIG.TIME_WINDOW/1000}s)`;
                await registerInfraction(author, member, 'floodTimeout', timeoutReason);
                
                try {
                    // Aplicar timeout
                    await member.timeout(CONFIG.TIMEOUT_DURATION, 'Flood de mensagens - Sistema automático');
                    
                    // Criar e enviar embed de timeout
                    const timeoutEmbed = createTimeoutEmbed(author);
                    await message.reply({ embeds: [timeoutEmbed] });
                    
                    // Enviar log
                    await sendLogNotification(author, 'timeout', messageCount);
                    
                    // Registrar eventos de segurança
                    securityEvent('ANTI_FLOOD_TIMEOUT', author, guild, `${messageCount} mensagens em ${CONFIG.TIME_WINDOW/1000}s`);
                    
                    logger.info(`Timeout aplicado com sucesso para ${author.tag}`, {
                        ...context,
                        duration: `${CONFIG.TIMEOUT_DURATION/60000} minutos`
                    });
                    
                    // Limpar dados do usuário
                    floodData.clearUser(author.id);
                    
                } catch (timeoutError) {
                    logger.error(`Erro ao aplicar timeout para ${author.tag}`, context, timeoutError);
                    securityEvent('TIMEOUT_FAILED', author, guild, timeoutError.message);
                }
                
            } else {
                // Dar aviso se não estiver em cooldown
                if (!floodData.isInWarningCooldown(author.id)) {
                    const newWarnings = floodData.addWarning(author.id);
                    floodData.setWarningCooldown(author.id);
                    
                    logger.info(`Enviando aviso ${newWarnings}/${CONFIG.MAX_WARNINGS} para ${author.tag}`, context);
                    
                    // Registrar infração de aviso
                    const warningReason = `Aviso por flood de mensagens (${messageCount} mensagens em ${CONFIG.TIME_WINDOW/1000}s)`;
                    await registerInfraction(author, member, 'floodWarning', warningReason);
                    
                    try {
                        // Criar e enviar embed de aviso
                        const warningEmbed = createWarningEmbed(author, newWarnings);
                        await message.reply({ embeds: [warningEmbed] });
                        
                        // Enviar log
                        await sendLogNotification(author, 'warning', messageCount);
                        
                        // Registrar evento de segurança
                        securityEvent('ANTI_FLOOD_WARNING', author, guild, `Aviso ${newWarnings}/${CONFIG.MAX_WARNINGS}`);
                        
                        logger.info(`Aviso enviado para ${author.tag}`, {
                            ...context,
                            warnings: newWarnings,
                            maxWarnings: CONFIG.MAX_WARNINGS
                        });
                        
                    } catch (warningError) {
                        logger.error(`Erro ao enviar aviso para ${author.tag}`, context, warningError);
                    }
                } else {
                    logger.debug(`Usuário ${author.tag} em cooldown de aviso`, context);
                }
            }
        }
        
    } catch (error) {
        logger.error('Erro no sistema anti-flood', context, error);
    }
}

/**
 * Função para obter estatísticas do sistema (útil para debug/monitoramento)
 * @returns {Object} Estatísticas do sistema
 */
function getFloodStats() {
    return {
        config: CONFIG,
        activeUsers: floodData.userMessages.size,
        usersWithWarnings: floodData.userWarnings.size,
        usersInCooldown: floodData.warningCooldowns.size
    };
}

/**
 * Função para ajustar configurações em tempo real (para testes/ajustes)
 * CUIDADO: Use apenas para desenvolvimento/teste
 * @param {Object} newConfig - Novas configurações
 */
function updateConfig(newConfig) {
    Object.assign(CONFIG, newConfig);
    logger.info('Configurações do anti-flood atualizadas', { 
        module: 'ANTI_FLOOD',
        newConfig: CONFIG 
    });
}

module.exports = { 
    antiFloodChat, 
    getFloodStats, 
    updateConfig 
};
