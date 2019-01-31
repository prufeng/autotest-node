var fs = require('fs');
var http = require('http');

var StockFetch = function () {

    this.readTickerFile = function (fileName, onError) {
        var self = this;
        var processResponse = function (err, data) {
            if (err) {
                onError('Error reading file: ' + fileName);
            } else {
                var tickers = self.parseTickers(data.toString());
                if (tickers.length === 0) {
                    onError('File ' + fileName + ' has invalid content');
                } else {
                    self.processTickers(tickers);
                }
            }
        };
        fs.readFile(fileName, processResponse);

    };

    this.parseTickers = function (content) {
        const isInRightFormat = function (str) {
            return str.trim().length === 8 && str.indexOf(' ') < 0;
        };
        return content.split('\r\n').filter(isInRightFormat);
    };

    this.tickersCount = 0;
    this.processTickers = function (tickers) {
        const self = this;
        self.tickersCount = tickers.length;
        tickers.forEach(ticker => {
            self.getPrice(ticker);
        });
    };

    this.url = 'http://hq.sinajs.cn/list=';
    this.getSrcUrl = function (ticker) {
        return this.url + ticker;
    };


    this.http = http;
    this.getPrice = function (ticker) {
        this.http.get(this.getSrcUrl(ticker), this.processResponse.bind(this, ticker))
            .on('error', this.processHttpError.bind(this, ticker));
    };

    this.processResponse = function (symbol, response) {
        var self = this;
        if (response.statusCode === 200) {
            let data = '';
            response.on('data', function (chunk) { data += chunk; });
            response.on('end', function () { self.parsePrice(symbol, data); });
        } else {
            self.processError(symbol, response.statusCode);
        }
    };

    this.prices = {};
    this.parsePrice = function (symbol, data) {
        const price = data.split('=')[1].split(',')[3];
        this.prices[symbol] = price;

        this.printReport();
    };

    this.errors = {};
    this.processError = function (symbol, data) {
        this.errors[symbol] = data;

        this.printReport();
    };

    this.processHttpError = function (symbol, error) {
        this.processError(symbol, error.code);
    };

    this.printReport = function () {
        if (this.tickersCount === Object.keys(this.prices).length + Object.keys(this.errors).length) {
            this.reportCallback(this.sortData(this.prices), this.sortData(this.errors));
        }
    };

    this.sortData = function (data) {
        const toArray = function (key) { return [key, data[key]]; };
        return Object.keys(data).sort().map(toArray);

    };

    this.reportCallback = function (prices, errors) {};

    this.getPriceForTickers = function (filePath, callback, onError) {
        var self = this;
        this.reportCallback = callback;
        this.readTickerFile(filePath, onError);
    };
};

module.exports = StockFetch;
