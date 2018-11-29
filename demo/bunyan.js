var bunyan = require('bunyan');

var log = bunyan.createLogger({
    name: 'bunyan',
    streams: [
        {
            type: 'rotating-file',
            path: './logs/bunyan-app.log',
            period: '1d',
            count: 3
        },
        {
            type: 'rotating-file',
            level: 'error',
            path: './logs/bunyan-error.log',
            period: '1d',
            count: 3
        }]
});

var expressConfig = {
    name: 'bunyan-express',
    streams: [
        {
            type: 'rotating-file',
            path: './logs/bunyan-express.log',
            period: '1d',
            count: 3
        }
    ]
};

function connectLogger(app){
    app.use(require('express-bunyan-logger')(expressConfig));
}

module.exports = { log, connectLogger};