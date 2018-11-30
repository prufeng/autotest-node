var log4js = require('../../demo/log4js');

describe('Log4js test', function () {
    // this require will affect other test case due to Node.js module loading mechanism
    // let log4js = require('log4js');
    // log4js.configure({
    //     appenders: {
    //         console: {
    //             type: 'console'
    //         }
    //     },
    //     categories: {
    //         default: { appenders: ['console'], 'level': 'DEBUG' }
    //     }
    // });
    it('should output app log', function () {
        const log = log4js.getLogger('app');
        log.debug('test');
        log.info('test');
        log.warn('test');
        log.error('test');
    });
    it('should output default log', function () {
        const log = log4js.getLogger();
        log.debug('test');
        log.info('test');
        log.warn('test');
        log.error('test');
    });
});

describe('Log4js json layout test', function () {
    // let log4js = require('log4js');
    // log4js.addLayout('json', function (config) {
    //     return function (logEvent) { return JSON.stringify(logEvent) + config.separator; }
    // });
    // log4js.configure({
    //     appenders: {
    //         console: {
    //             type: 'console',
    //             layout: { type: 'json', separator: ',' }
    //         }
    //     },
    //     categories: {
    //         default: { appenders: ['console'], 'level': 'DEBUG' }
    //     }
    // });

    it('should output json layout error log in log file', function () {
        const logger = log4js.getLogger('json');
        logger.info('this is just a test');
        logger.error('of a custom appender');
        logger.warn('that outputs error log as json');
        logger.debug('The date format is ISO8601_WITH_TZ_OFFSET_FORMAT, but not ISO8601_FORMAT')
    });
});

describe('Log4js pattern layout test', function () {
    it('should output predefined pattern layout log', function () {
        const logger = log4js.getLogger('pattern');
        logger.addContext('userId', 'HanMeimei');//not work, need define userId in pattern
        logger.info('this is just a test');
        logger.error('of a custom appender');
        logger.warn('that outputs predefined user - system');
    });
    it('should output predefined pattern layout log with user token', function () {
        const logger = log4js.getLogger('pattern-token');
        logger.addContext('user', 'HanMeimei');
        logger.info('this is just a test');
        logger.error('of a custom appender');
        logger.warn('that outputs runtime user - Hanmeimei');
    });
});
