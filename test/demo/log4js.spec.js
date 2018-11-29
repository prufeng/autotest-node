var expect = require('chai').expect;
var log4js = require('../../demo/log4js');

describe('Log4js test', function() {
    it('should pass and output app log', function(){
        const log = log4js.getLogger('app');
        log.info('test');
        log.warn('test');
        log.error('test'); 
    });  
    it('should pass and output default log', function(){
        const log = log4js.getLogger();
        log.info('test');
        log.warn('test');
        log.error('test'); 
    });  
});