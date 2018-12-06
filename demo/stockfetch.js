function readTickerFile(fileName, callback){
    callback('Error reading file: ' + fileName);
}

module.exports = {readTickerFile};