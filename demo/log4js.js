const log4js = require('log4js');

log4js.configure({
    "appenders": {
        "console": {
            "type": "console"
        },
        "access": {
          "type": "dateFile",
          "filename": "logs/log4js-access.log",
          "pattern": "-yyyy-MM-dd",
          "category": "http"
        },
        "app": {
          "type": "file",
          "filename": "logs/log4js-app.log",
          "maxLogSize": 10485760,
          "numBackups": 3
        },
        "errorFile": {
          "type": "file",
          "filename": "logs/log4js-errors.log"
        },
        "errors": {
          "type": "logLevelFilter",
          "level": "ERROR",
          "appender": "errorFile"
        }
      },
      "categories": {
        "default": { "appenders": [ "console", "app", "errors" ], "level": "DEBUG" },
        "http": { "appenders": [ "console", "access"], "level": "DEBUG" }
      }
});

function getLogger(category){
    return log4js.getLogger(category||'default');
}

function connectLogger(app, category){
    app.use(log4js.connectLogger(log4js.getLogger(category), {level: 'auto'}));
}

module.exports = {getLogger, connectLogger};