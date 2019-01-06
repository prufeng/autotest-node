var fs = require('fs');
var http = require('http');

var StockFetch = function () {

    this.readTickerFile = function(fileName, onError) {
        var self = this;
        var processResponse = function(err, data){
            // console.log('Start to processResponse');
            if(err){
                onError('Error reading file: ' + fileName);
            }else{
                var tickers = self.parseTickers(data.toString());
                if(tickers.length === 0){
                    onError('File ' + fileName + ' has invalid content');
                }else{
                    self.processTickers(tickers);
                }
            }
        };
        fs.readFile(fileName, processResponse);
        
    };

    this.parseTickers = function(content) {
        // console.log('Start to parseTickers');
        const isInRightFormat = function(str){
            return str.trim().length===6 && str.indexOf(' ')<0;
        };
        return content.split('\n').filter(isInRightFormat);
    };

    this.tickersCount = 0;
    this.processTickers = function(tickers) {
        // console.log('Start to processTickers');
        const self = this;
        self.tickersCount = tickers.length;
        tickers.forEach(ticker=>{
            self.getPrice(ticker);
        });
    };

    this.url = 'http://hq.sinajs.cn/list=';
    this.getSrcUrl = function(ticker){
        let startChar = ticker.substr(0,1);
        if('6'===startChar){
            startChar='sh';
        }else if('0'===startChar){
            startChar='sz';
        }else{
            startChar='';
        }
        return this.url+startChar+ticker;
    };

    
    this.http = http;
    this.getPrice = function(ticker){
        this.http.get(this.getSrcUrl(ticker), this.processResponse.bind(this, ticker))
        .on('error', this.processHttpError.bind(this, ticker));
    };

    this.processResponse = function(stockFetch, symbol){

    };

    this.processHttpError = function(stockFetch, symbol){};
};

module.exports = StockFetch;
