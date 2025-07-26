const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, errors } = format;
const path = require('path');
const fs = require('fs');

// Cria diretório de logs se não existir
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// Códigos ANSI para cores (compatível com todas as versões do Node.js)
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    gray: '\x1b[90m',
    redBright: '\x1b[91m',
    greenBright: '\x1b[92m',
    yellowBright: '\x1b[93m',
    blueBright: '\x1b[94m',
    magentaBright: '\x1b[95m',
    cyanBright: '\x1b[96m'
};

// Função para colorir texto
function colorize(text, color) {
    return `${colors[color] || ''}${text}${colors.reset}`;
}

// Configuração de cores personalizadas para cada nível
const logColors = {
    error: 'redBright',
    warn: 'yellowBright',
    info: 'blueBright',
    debug: 'greenBright',
    verbose: 'magentaBright',
    silly: 'gray'
};

// Prefixos personalizados para cada nível
const logPrefixes = {
    error: '❌ ERROR',
    warn: '⚠️  WARN',
    info: 'ℹ️  INFO',
    debug: '🐛 DEBUG',
    verbose: '📝 VERBOSE',
    silly: '🔍 SILLY'
};

// Formato para console com cores
const consoleFormat = printf(({ level, message, timestamp, stack, module, command, user, guild }) => {
    const color = logColors[level] || 'white';
    const prefix = logPrefixes[level] || level.toUpperCase();
    
    let formattedMessage = `${colorize(timestamp, 'gray')} ${colorize(prefix, color)}`;
    
    // Adiciona contexto se disponível
    if (module) formattedMessage += ` ${colorize(`[${module}]`, 'cyan')}`;
    if (command) formattedMessage += ` ${colorize(`{${command}}`, 'yellow')}`;
    if (user) formattedMessage += ` ${colorize(`<${user}>`, 'magenta')}`;
    if (guild) formattedMessage += ` ${colorize(`(${guild})`, 'green')}`;
    
    formattedMessage += `: ${message}`;
    
    // Adiciona stack trace se for erro
    if (stack && level === 'error') {
        formattedMessage += `\n${colorize(stack, 'red')}`;
    }
    
    return formattedMessage;
});

// Formato para arquivos (sem cores)
const fileFormat = printf(({ level, message, timestamp, stack, module, command, user, guild }) => {
    let formattedMessage = `${timestamp} [${level.toUpperCase()}]`;
    
    if (module) formattedMessage += ` [${module}]`;
    if (command) formattedMessage += ` {${command}}`;
    if (user) formattedMessage += ` <${user}>`;
    if (guild) formattedMessage += ` (${guild})`;
    
    formattedMessage += `: ${message}`;
    
    if (stack && level === 'error') {
        formattedMessage += `\n${stack}`;
    }
    
    return formattedMessage;
});

// Logger principal com todos os níveis
const logger = createLogger({
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true })
    ),
    transports: [
        // Arquivo para todos os logs
        new transports.File({ 
            filename: path.join(logDir, 'bot.log'), 
            level: 'silly',
            format: fileFormat,
            maxsize: 5242880, // 5MB
            maxFiles: 5
        }),
        // Arquivo específico para erros
        new transports.File({ 
            filename: path.join(logDir, 'error.log'), 
            level: 'error',
            format: fileFormat,
            maxsize: 5242880, // 5MB
            maxFiles: 5
        }),
        // Arquivo específico para warns
        new transports.File({ 
            filename: path.join(logDir, 'warn.log'), 
            level: 'warn',
            format: fileFormat,
            maxsize: 5242880, // 5MB
            maxFiles: 3
        }),
        // Console com cores
        new transports.Console({ 
            format: consoleFormat,
            level: process.env.NODE_ENV === 'development' ? 'debug' : 'info'
        })
    ],
    // Tratamento de exceções não capturadas
    exceptionHandlers: [
        new transports.File({ 
            filename: path.join(logDir, 'exceptions.log'),
            format: fileFormat
        })
    ],
    // Tratamento de rejeições não capturadas
    rejectionHandlers: [
        new transports.File({ 
            filename: path.join(logDir, 'rejections.log'),
            format: fileFormat
        })
    ]
});

// Classe Logger com métodos personalizados
class Logger {
    constructor() {
        this.logger = logger;
    }

    // Método para adicionar contexto
    createContext(module, command = null, user = null, guild = null) {
        return {
            module,
            command,
            user,
            guild
        };
    }

    // Métodos de log com contexto
    error(message, context = {}, error = null) {
        const logData = { 
            level: 'error', 
            message,
            ...context
        };
        
        if (error) {
            logData.stack = error.stack;
            logData.message = `${message}: ${error.message}`;
        }
        
        this.logger.error(logData);
    }

    warn(message, context = {}) {
        this.logger.warn({ 
            level: 'warn', 
            message,
            ...context
        });
    }

    info(message, context = {}) {
        this.logger.info({ 
            level: 'info', 
            message,
            ...context
        });
    }

    debug(message, context = {}) {
        this.logger.debug({ 
            level: 'debug', 
            message,
            ...context
        });
    }

    verbose(message, context = {}) {
        this.logger.verbose({ 
            level: 'verbose', 
            message,
            ...context
        });
    }

    silly(message, context = {}) {
        this.logger.silly({ 
            level: 'silly', 
            message,
            ...context
        });
    }

    // Métodos específicos para eventos do bot
    commandExecuted(commandName, user, guild, success = true) {
        const message = success 
            ? `Comando executado com sucesso`
            : `Falha na execução do comando`;
            
        const level = success ? 'info' : 'warn';
        
        this[level](message, {
            module: 'COMMAND',
            command: commandName,
            user: user?.tag || user,
            guild: guild?.name || guild
        });
    }

    musicEvent(event, details, context = {}) {
        this.info(`Evento de música: ${event} - ${details}`, {
            module: 'MUSIC',
            ...context
        });
    }

    databaseEvent(operation, table, success = true, details = '') {
        const message = success 
            ? `Operação no banco: ${operation} em ${table}`
            : `Falha na operação no banco: ${operation} em ${table}`;
            
        const level = success ? 'debug' : 'error';
        
        this[level](message + (details ? ` - ${details}` : ''), {
            module: 'DATABASE'
        });
    }

    botEvent(event, details = '') {
        this.info(`Evento do bot: ${event}${details ? ` - ${details}` : ''}`, {
            module: 'BOT'
        });
    }

    securityEvent(event, user, guild, details = '') {
        this.warn(`Evento de segurança: ${event}${details ? ` - ${details}` : ''}`, {
            module: 'SECURITY',
            user: user?.tag || user,
            guild: guild?.name || guild
        });
    }
}

const loggerInstance = new Logger();

// Exporta tanto a instância da classe quanto os métodos individuais para compatibilidade
module.exports = {
    Logger: loggerInstance,
    logger: loggerInstance,
    info: loggerInstance.info.bind(loggerInstance),
    warn: loggerInstance.warn.bind(loggerInstance),
    error: loggerInstance.error.bind(loggerInstance),
    debug: loggerInstance.debug.bind(loggerInstance),
    verbose: loggerInstance.verbose.bind(loggerInstance),
    silly: loggerInstance.silly.bind(loggerInstance),
    
    // Métodos específicos
    commandExecuted: loggerInstance.commandExecuted.bind(loggerInstance),
    musicEvent: loggerInstance.musicEvent.bind(loggerInstance),
    databaseEvent: loggerInstance.databaseEvent.bind(loggerInstance),
    botEvent: loggerInstance.botEvent.bind(loggerInstance),
    securityEvent: loggerInstance.securityEvent.bind(loggerInstance),
    createContext: loggerInstance.createContext.bind(loggerInstance),
    
    // Compatibilidade com o sistema antigo
    erro: loggerInstance.error.bind(loggerInstance)
};
