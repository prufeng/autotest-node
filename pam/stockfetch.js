var fs = require('fs');

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

    this.getPrice = function(ticker){

    }


};

module.exports = StockFetch;
