let calc = new Object();
calc.add = function(x, y){
    return x+y;
}
calc.minus = function(x,y){
    return x-y;
}
module.exports = calc;