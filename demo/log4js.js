const log4js = require('log4js');

log4js.addLayout('json', function (config) {
    return function (logEvent) { return JSON.stringify(logEvent) + config.separator; };
});

const ptn = '[%d] [%p] [%c] [%X{user}] - %m';
log4js.configure({
    "appenders": {
        "console": {
            "type": "console",
            layout: {
                type: 'pattern',
                pattern: ptn
            }
        },
        "access": {
            "type": "dateFile",
            "filename": "logs/log4js-access.log",
            "pattern": "-yyyy-MM-dd",
            "category": "http",
            layout: {
                type: 'pattern',
                pattern: ptn
            }
        },
        "app": {
            "type": "file",
            "filename": "logs/log4js-app.log",
            "maxLogSize": 10485760,
            "numBackups": 3,
            layout: {
                type: 'pattern',
                pattern: ptn
            }
        },
        "errorFile": {
            "type": "file",
            "filename": "logs/log4js-errors.log",
            layout: { type: 'json', separator: ',' }
        },
        "errors": {
            "type": "logLevelFilter",
            "level": "ERROR",
            "appender": "errorFile",
        }
    },
    "categories": {
        "default": { "appenders": ["console", "app", "errors"], "level": "DEBUG" },
        "http": { "appenders": ["console", "access"], "level": "DEBUG" }
    }
});

function getLogger(category) {
    let logger = log4js.getLogger(category || 'default');
    logger.addContext('user', 'system');//inject default user
    return logger;
}

function connectLogger(app, category) {
    app.use(log4js.connectLogger(getLogger(category), { level: 'auto' }));
}

module.exports = { getLogger, connectLogger };
