var expect = require('chai').expect;
var sinon = require('sinon');
var fs = require('fs');
var stockfetch = require('../../demo/stockfetch')
describe('Stock fetch tests', ()=>{
    var sb;

    beforeEach(()=>{
        // sb=sinon.sanbox.create();
    });

    afterEach(()=>{
        // sb.restore();
    });

    it('should pass this canary test', ()=>{
        expect(true).to.be.true;
    });

    it('read should invoke error handler for invalid file', function(done){
        var onError = function(err){
            expect(err).to.be.eql('Error reading file: invalidFile');
            done();
        }
        // done();
        stockfetch.readTickerFile('invalidFile', onError);
    });
});