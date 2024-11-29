const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf } = format;
const path = require('path');
const fs = require('fs');

const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

const logFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${message}`;
});

const info = createLogger({
    level: 'info',
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
    ),
    transports: [
        new transports.File({ filename: path.join(logDir, 'bot.log'), level: 'info' }),
        new transports.Console({ format: combine(format.colorize(), logFormat) })
    ]
});

const erro = createLogger({
    level: 'error',
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
    ),
    transports: [
        new transports.File({ filename: path.join(logDir, 'erro_bot.log'), level: 'error' }),
        new transports.Console({ format: combine(format.colorize(), logFormat) })
    ]
});

module.exports = {info, erro};
