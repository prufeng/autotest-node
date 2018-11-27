var bunyan = require('bunyan');
var log = bunyan.createLogger({ name: 'app' });
log.info('hello world');
log.warn({ key: 'test' }, 'hello world');
log.error('hello world');

var log2file = bunyan.createLogger({
    name: 'log2file',
    streams: [{
        // type: 'file',  //default type
        path: './logs/bunyan.log',
    },
    {
        type: 'rotating-file',
        path: './logs/bunyan-rf.log',
        period: '1d',
        count: 3
    },
    {
        type: 'rotating-file',
        level: 'error',
        path: './logs/bunyan-rf-error.log',
        period: '1d',
        count: 3
    }]
});

function test() {
    log2file.info('hello world');
    log2file.warn({ key: 'test' }, 'hello world');
    log2file.error('hello world');
}

var express = {
    name: 'bunyan-express',
    // format: ":remote-address - :user-agent[major] custom logger",
    streams: [
        {
            type: 'rotating-file',
            path: './logs/bunyan-rf-express.log',
            period: '1d',
            count: 3
        }
    ]
};

module.exports = { test, express };
