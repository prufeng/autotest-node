var expect = require('chai').expect;
var bunyan = require('../../demo/bunyan');

describe('Bunyan Logger test', function () {
    it('should output JSON log in terminal', function () {
        var log = require('bunyan').createLogger({ name: 'app' });
        log.info('hello world');
        log.warn({ key: 'test' }, 'hello world');
        log.error('hello world');
    });
    it('should output JSON log in file', function(){
        const log = bunyan.log;
        log.info('hello world');
        log.warn({ key: 'test' }, 'hello world');
        log.error('hello world');
    });
});