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

    it('getSrcUrl should return the full URL', function(){
        expect(stockFetch.getSrcUrl('000001')).to.be.eql(stockFetch.url+'sz000001');
        expect(stockFetch.getSrcUrl('600001')).to.be.eql(stockFetch.url+'sh600001');
        expect(stockFetch.getSrcUrl('300001')).to.be.eql(stockFetch.url+'300001');
    });
    
    it('getPrice should call get on http with valid URL', function(done){
        const stub = sinon.stub(stockFetch.http, 'get').callsFake(function(url){
            expect(url).to.be.eql('http://hq.sinajs.cn/list=sz000001');
            done();
        });
        stockFetch.getPrice('000001');
    });

    it('getPrice should send a response handler to get', function(done){
        const aHandler = function(){};

        sinon.stub(stockFetch.processResponse, 'bind').withArgs(stockFetch, '000001').returns(aHandler);

        sinon.stub(stockFetch.http, 'get').callsFake(function(url, handler){
            expect(handler).to.be.eql(aHandler);
            done();

        });

        stockFetch.getPrice('000001');
    });

    it('getPrice should register handler for failure to reach host', function(done){
        const errorHandler = function(){};

        sinon.stub(stockFetch.processHttpError, 'bind').withArgs(stockFetch, '000001').returns(errorHandler);

        const onStub = function(event, handler){
            expect(event).to.be.eql('error');
            expect(handler).to.be.eql(errorHandler);
            done();
        }

        sinon.stub(stockFetch.http, 'get').returns({on: onStub});

        stockFetch.getPrice('000001');;
    });
 
    it('processResponse should call parsePrice with valid data', function(){
        let dataFn;
        let endFn;

        let response = {
            statusCode: 200,
            on: function(event, handler){
                if(event==='data'){
                    dataFn = handler;
                }
                if(event ==='end'){
                    endFn = handler;
                }
            }
        };

        let parsePriceMock = sinon.mock(stockFetch).expects('parsePrice').withArgs('000001', 'some data');

        stockFetch.processResponse('000001', response);
        dataFn('some ');
        dataFn('data');
        endFn();

        parsePriceMock.verify();
    });

    it('processResponse should call processError if response failed', function(){
        let response = {statusCode: 404};

        let processErrorMock = sinon.mock(stockFetch).expects('processError').withArgs('000001', 404);

        stockFetch.processResponse('000001', response);
        processErrorMock.verify();
    });

    
    it('processResponse should call processError only if response failed', function(){
        let response = {
            statusCode: 200,
            on: function(){}
        };

        let processErrorMock = sinon.mock(stockFetch).expects('processError').never();

        stockFetch.processResponse('000001', response);
        processErrorMock.verify();
    });
});
