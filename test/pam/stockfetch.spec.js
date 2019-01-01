var expect = require('chai').expect;
var sinon = require('sinon');
var fs = require('fs');
var StockFetch = require('../../pam/stockfetch')
describe('StockFetch tests', () => {
    var stockfetch;

    beforeEach(() => {
        stockfetch = new StockFetch();
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should pass this canary test', () => {
        expect(true).to.be.true;
    });

    it('read should invoke error handler for invalid file', function (done) {
        var onError = function (err) {
            expect(err).to.be.eql('Error reading file: invalidFile');
            done();
        }
        var stub = sinon.stub(fs, 'readFile');
        stub.yields(new Error('Failed to read file'));
        
        stockfetch.readTickerFile('invalidFile', onError);
        stub.restore();
    });

    it('read should invoke processTickers for valid file', function (done) {
        var rawData = '601169\n002146\n601009'
        var parsedData = ['601169', '002146', '601009'];

        sinon.stub(fs, 'readFile').callsFake(function(fileName, callback){
            callback(null, rawData);
        });
    
        sinon.stub(stockfetch, 'parseTickers').withArgs(rawData).returns(parsedData);    

        sinon.stub(stockfetch, 'processTickers').callsFake(function(data){
            expect(data).to.be.eql(parsedData);
            done();
        });

        stockfetch.readTickerFile('validFile', function(err){throw new Error(err);});
    });

    it('read should return error if given file is empty', function(done){
        var onError = function(err){
            expect(err).to.be.eql('File emptyFile has invalid content');
            done();
        };

        sinon.stub(stockfetch, 'parseTickers').withArgs('').returns([]);
        sinon.stub(fs, 'readFile').callsFake(function(fileName, callback){
            callback(null, '');
        });

        stockfetch.readTickerFile('emptyFile', onError);
    })

});
