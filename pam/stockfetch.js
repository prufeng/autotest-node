var fs = require('fs');

var StockFetch = function () {

    this.readTickerFile = function(fileName, onError) {
        var self = this;
        var processResponse = function(err, data){
            console.log('Start to processResponse');
            if(err){
                onError('Error reading file: ' + fileName);
            }else{
                var tickers = self.parseTickers(data.toString());
                self.processTickers(tickers);
            }
        }
        fs.readFile(fileName, processResponse);
        
    }

    this.parseTickers = function() {
        console.log('Start to parseTickers');

    }

    this.processTickers = function() {
        console.log('Start to processTickers');

    }


};

module.exports = StockFetch;