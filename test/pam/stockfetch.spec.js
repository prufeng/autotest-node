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

        sinon.stub(fs, 'readFile').callsFake(function (fileName, callback) {
            callback(null, rawData);
        });

        sinon.stub(stockFetch, 'parseTickers').withArgs(rawData).returns(parsedData);

        sinon.stub(stockFetch, 'processTickers').callsFake(function (data) {
            expect(data).to.be.eql(parsedData);
        });

        stockFetch.readTickerFile('dummyValidFile', function (err) { throw new Error(err); });
    });

    it('read should return error if given file is empty', function (done) {
        var onError = function (err) {
            expect(err).to.be.eql('File dummyEmptyFile has invalid content');
            done();
        };

        sinon.stub(stockFetch, 'parseTickers').withArgs('').returns([]);
        sinon.stub(fs, 'readFile').callsFake(function (fileName, callback) {
            callback(null, '');
        });

        stockFetch.readTickerFile('dummyEmptyFile', onError);
    });

    it('parseTickers should return tickers', function () {
        expect(stockFetch.parseTickers('sh601169\r\nsz002146\r\nsh601009\r\n')).to.be.eql(['sh601169', 'sz002146', 'sh601009']);
    });

    it('parseTickers should return empty array for empty content', function () {
        expect(stockFetch.parseTickers('')).to.be.eql([]);
    });

    it('parseTickers should return empty array for white-space', function () {
        expect(stockFetch.parseTickers(' ')).to.be.eql([]);
    });

    it('parseTickers should ignore unexpected format in content', function () {
        expect(stockFetch.parseTickers('sh6011699\r\nsh601169 \r\n002 46\r\nsh601009\r\n')).to.be.eql(['sh601009']);
    });


    it('processTickers should call getPrice for each ticker symbol', function () {
        const stockFetchMock = sinon.mock(stockFetch);
        stockFetchMock.expects('getPrice').withArgs('601169');
        stockFetchMock.expects('getPrice').withArgs('002146');
        stockFetchMock.expects('getPrice').withArgs('601009');

        stockFetch.processTickers(['601169', '002146', '601009']);
        stockFetchMock.verify();
    });

    it('processTickers should call getPrice for each ticker symbol by sequence', function () {
        const stockFetchSpy = sinon.spy(stockFetch, 'getPrice');

        stockFetch.processTickers(['601169', '002146', '601009']);

        expect(stockFetchSpy.firstCall.calledWithExactly('601169')).to.be.true;
        expect(stockFetchSpy.secondCall.calledWithExactly('002146')).to.be.true;
        expect(stockFetchSpy.thirdCall.calledWithExactly('601009')).to.be.true;
    });

    it('processTickers should return tickers count', function () {
        sinon.stub(stockFetch, 'getPrice');

        stockFetch.processTickers(['601169', '002146', '601009']);
        expect(stockFetch.tickersCount).to.be.eql(3);
    });

    it('getSrcUrl should return the full URL', function () {
        expect(stockFetch.getSrcUrl('sz000001')).to.be.eql(stockFetch.url + 'sz000001');
        expect(stockFetch.getSrcUrl('sh600001')).to.be.eql(stockFetch.url + 'sh600001');
        expect(stockFetch.getSrcUrl('300001')).to.be.eql(stockFetch.url + '300001');
    });

    it('getPrice should call get on http with valid URL', function (done) {
        const stub = sinon.stub(stockFetch.http, 'get').callsFake(function (url) {
            expect(url).to.be.eql('http://hq.sinajs.cn/list=sz000001');
            done();
        });
        stockFetch.getPrice('sz000001');
    });

    it('getPrice should send a response handler to get', function (done) {
        const aHandler = function () { };

        sinon.stub(stockFetch.processResponse, 'bind').withArgs(stockFetch, '000001').returns(aHandler);

        sinon.stub(stockFetch.http, 'get').callsFake(function (url, handler) {
            expect(handler).to.be.eql(aHandler);
            done();

        });

        stockFetch.getPrice('000001');
    });

    it('getPrice should register handler for failure to reach host', function (done) {
        const errorHandler = function () { };

        sinon.stub(stockFetch.processHttpError, 'bind').withArgs(stockFetch, '000001').returns(errorHandler);

        const onStub = function (event, handler) {
            expect(event).to.be.eql('error');
            expect(handler).to.be.eql(errorHandler);
            done();
        }

        sinon.stub(stockFetch.http, 'get').returns({ on: onStub });

        stockFetch.getPrice('000001');;
    });

    it('processResponse should call parsePrice with valid data', function () {
        let dataFn;
        let endFn;

        let response = {
            statusCode: 200,
            on: function (event, handler) {
                if (event === 'data') {
                    dataFn = handler;
                }
                if (event === 'end') {
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

    it('processResponse should call processError if response failed', function () {
        let response = { statusCode: 404 };

        let processErrorMock = sinon.mock(stockFetch).expects('processError').withArgs('000001', 404);

        stockFetch.processResponse('000001', response);
        processErrorMock.verify();
    });

    it('processResponse should call processError only if response failed', function () {
        let response = {
            statusCode: 200,
            on: function () { }
        };

        let processErrorMock = sinon.mock(stockFetch).expects('processError').never();

        stockFetch.processResponse('000001', response);
        processErrorMock.verify();
    });

    it('processHttpError should call processError with error details', function () {
        let processErrorMock = sinon.mock(stockFetch).expects('processError').withArgs('000001', '...error code...');

        let error = { code: '...error code...' };
        stockFetch.processHttpError('000001', error);
        processErrorMock.verify();
    });

    const data = 'var hq_str_sz000001="平安银行,10.110,10.100,10.200,10.220,10.050,10.190,10.200,69636455,708001802.170,238400,10.190,218458,10.180,155700,10.170,81500,10.160,87500,10.150,809154,10.200,659000,10.210,1128800,10.220,518989,10.230,687000,10.240,2019-01-11,15:05:03,00";';
    it('parsePrice should update prices', function () {
        stockFetch.parsePrice('sz000001', data);

        expect(stockFetch.prices.sz000001).to.be.eql('10.200');
    });

    it('parsePrice should call printReport', () => {
        const mock = sinon.mock(stockFetch).expects('printReport');

        stockFetch.parsePrice('sz000001', data);
        mock.verify();
    });

    it('processError should update errors', () => {
        stockFetch.processError('sz000001', '...oops...');

        expect(stockFetch.errors.sz000001).to.be.eql('...oops...');
    });

    it('processError should call printReport', () => {
        const mock = sinon.mock(stockFetch).expects('printReport');

        stockFetch.processError('sz000001', '...oops...');
        mock.verify();
    });

    it('printReport should send price, errors once all response arrive', () => {
        stockFetch.prices = { 'sz000001': 11.22 };
        stockFetch.errors = { 'sh601009': 'error' };
        stockFetch.tickersCount = 2;

        const mock = sinon.mock(stockFetch).expects('reportCallback').withArgs([['sz000001', 11.22]], [['sh601009', 'error']]);
        stockFetch.printReport();
        mock.verify();
    });

    it('printReport should not send before all response arrive', () => {
        stockFetch.prices = { 'sz000001': 11.22 };
        stockFetch.errors = { 'sh601009': 'error' };
        stockFetch.tickersCount = 3;

        const mock = sinon.mock(stockFetch).expects('reportCallback').never();
        stockFetch.printReport();
        mock.verify();
    });

    it('printReport should call sortData once for prices, once for errors', () => {
        stockFetch.prices = { 'sz000001': 11.22 };
        stockFetch.errors = { 'sh601009': 'error' };
        stockFetch.tickersCount = 2;

        const mock = sinon.mock(stockFetch);
        mock.expects('sortData').withArgs(stockFetch.prices);
        mock.expects('sortData').withArgs(stockFetch.errors);
        stockFetch.printReport();
        mock.verify();
    });

    it('printReport should sort the data based on the symbols', () => {
        const data = {
            'sz000001': 11.22,
            'sh601009': 22.11
        };

        expect(stockFetch.sortData(data)).to.be.eql([['sh601009', 22.11], ['sz000001', 11.22]]);
    });

    it('getPriceForTickers should report error for invalid file', (done) => {
        const onError = function (err) {
            expect(err).to.be.eql('Error reading file: dummyInvalidFile');
            done();
        };

        const display = function () { };

        stockFetch.getPriceForTickers('dummyInvalidFile', display, onError);
    });
});
