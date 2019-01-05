var expect = require('chai').expect;
var assert = require('chai').assert;
var sinon = require('sinon');
var fs = require('fs');
var StockFetch = require('../../pam/stockFetch')
describe('StockFetch tests', () => {
    var stockFetch;

    beforeEach(() => {
        stockFetch = new StockFetch();
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should pass this canary test', () => {
        assert(true);
    });

    it('read should invoke error handler for invalid file', function (done) {
        var onError = function (err) {
            expect(err).to.be.eql('Error reading file: dummyInvalidFile');
            done();
        };
        var stub = sinon.stub(fs, 'readFile');
        // stub.yields(new Error('Failed to read file'));
        stub.callsArgWith(1, new Error('Failed to read file'));
        
        stockFetch.readTickerFile('dummyInvalidFile', onError);
        stub.restore();
    });

    it('read should invoke processTickers for valid file', function () {
        var rawData = '601169\n002146\n601009'
        var parsedData = ['601169', '002146', '601009'];

        sinon.stub(fs, 'readFile').callsFake(function(fileName, callback){
            callback(null, rawData);
        });
    
        sinon.stub(stockFetch, 'parseTickers').withArgs(rawData).returns(parsedData);    

        sinon.stub(stockFetch, 'processTickers').callsFake(function(data){
            expect(data).to.be.eql(parsedData);
        });

        stockFetch.readTickerFile('dummyValidFile', function(err){throw new Error(err);});
    });

    it('read should return error if given file is empty', function(done){
        var onError = function(err){
            expect(err).to.be.eql('File dummyEmptyFile has invalid content');
            done();
        };

        sinon.stub(stockFetch, 'parseTickers').withArgs('').returns([]);
        sinon.stub(fs, 'readFile').callsFake(function(fileName, callback){
            callback(null, '');
        });

        stockFetch.readTickerFile('dummyEmptyFile', onError);
    });

    it('parseTickers should return tickers', function(){
        expect(stockFetch.parseTickers('601169\n002146\n601009\n')).to.be.eql(['601169', '002146', '601009']);
    });

    it('parseTickers should return empty array for empty content', function(){
        expect(stockFetch.parseTickers('')).to.be.eql([]);
    });

    it('parseTickers should return empty array for white-space', function(){
        expect(stockFetch.parseTickers(' ')).to.be.eql([]);
    });

    it('parseTickers should ignore unexpected format in content', function(){
        expect(stockFetch.parseTickers('6011699\n601169 \n002 46\n601009\n\n')).to.be.eql(['601009']);
    });


    it('processTickers should call getPrice for each ticker symbol', function(){
        const stockFetchMock = sinon.mock(stockFetch);
        stockFetchMock.expects('getPrice').withArgs('601169');
        stockFetchMock.expects('getPrice').withArgs('002146');
        stockFetchMock.expects('getPrice').withArgs('601009');
        
        stockFetch.processTickers(['601169', '002146', '601009']);
        stockFetchMock.verify();
    });

    it('processTickers should return tickers count', function(){
        sinon.stub(stockFetch, 'getPrice');

        stockFetch.processTickers(['601169', '002146', '601009']);
        expect(stockFetch.tickersCount).to.be.eql(3);
    });

});
