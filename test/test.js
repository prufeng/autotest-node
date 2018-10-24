var assert = require('assert');
var calc = require('../calc');
var app = require('../app');

describe('Calculator', function() {
  describe('add', function() {
    it('add(1,2) should return 3', function() {
      assert.equal(calc.add(1,2),3);
    });
  });

  describe('minus', function() {
    it('minus(1,2) should return -1', function() {
      assert.equal(calc.minus(1,2),-1);
    });
  });
});
