Node.js自动化测试(Mocha+Istanbul)
====
基于Express，Mocha + Istanbul
# 1. Unit Test

## 1.1 Install Mocha
```bash
npm i -D mocha
```

## 1.2 Create test/test.js
```javascript
var assert = require('assert');
describe('Array', function() {
  describe('#indexOf()', function() {
    it('should return -1 when the value is not present', function() {
      assert.equal([1,2,3].indexOf(4), -1);
    });
  });
});
```

## 1.3 Run Test Case
Add `test` to package.json `scripts` node as below.
```json
  "scripts": {
    "start": "node ./bin/www",
    "test": "mocha"
  }
  ```
Run `npm test`, will get result in the terminal.
```bash
> mocha



  Array
    #indexOf()
      √ should return -1 when the value is not present


  1 passing (5ms)

```
# 2. Code Coverage
## 2.1 Install Istanbul
新版本Istanbul命令行工具已经改为[nyc](https://github.com/istanbuljs/nyc)。
```bash
$ npm i -D nyc
```

## 2.2 Run Test
修改package.json
```json
{
  "scripts": {
    "test": "nyc mocha --timeout=3000"
  }
}
```
运行`npm test`，等结果如下：
```bash
> nyc mocha --timeout=3000



  Array
    #indexOf()
      √ should return -1 when the value is not present


  1 passing (8ms)

----------|----------|----------|----------|----------|-------------------|
File      |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
----------|----------|----------|----------|----------|-------------------|
All files |        0 |        0 |        0 |        0 |                   |
----------|----------|----------|----------|----------|-------------------|

```
因为没有测试到任何代码，所以上例各项覆盖率为0。

## 2.3 实例
添加如下代码供测试。
```javascript
//calc.js
let calc = new Object();
calc.add = function(x, y){
    return x+y;
}
calc.minus = function(x,y){
    return x-y;
}
module.exports = calc;
```
修改test.js。
```js
//test/test.js
var assert = require('assert');
var calc = require('../calc');

describe('Calculator', function() {
  describe('add', function() {
    it('add(1,2) should return 3', function() {
      assert.equal(calc.add(1,2),3);
    });
  });
});
```
运行测试，结果变为：
```bash
----------|----------|----------|----------|----------|-------------------|
File      |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
----------|----------|----------|----------|----------|-------------------|
All files |    83.33 |      100 |       50 |    83.33 |                   |
 calc.js  |    83.33 |      100 |       50 |    83.33 |                 6 |
----------|----------|----------|----------|----------|-------------------|
```
修改test.js，添加测试用例。
```js
//test/test.js
var assert = require('assert');
var calc = require('../calc');

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
```
运行测试，结果变为100%。
```bash

----------|----------|----------|----------|----------|-------------------|
File      |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
----------|----------|----------|----------|----------|-------------------|
All files |      100 |      100 |      100 |      100 |                   |
 calc.js  |      100 |      100 |      100 |      100 |                   |
----------|----------|----------|----------|----------|-------------------|

```
## 2.4 坑++
以上report还是有点问题，只包含了一个文件，并没有出现项目中的其他文件，说明Istanbul只是统计了测试中的文件。
```js
var app = require('../app');
```
把App入口文件import进去test.js以后，得结果如下。
```
-----------------|----------|----------|----------|----------|-------------------|
File             |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
-----------------|----------|----------|----------|----------|-------------------|
All files        |    82.93 |        0 |    33.33 |    82.93 |                   |
 autotest        |    83.87 |        0 |       50 |    83.87 |                   |
  app.js         |       80 |        0 |        0 |       80 |    27,33,34,37,38 |
  calc.js        |      100 |      100 |      100 |      100 |                   |
 autotest/routes |       80 |      100 |        0 |       80 |                   |
  index.js       |       80 |      100 |        0 |       80 |                 6 |
  users.js       |       80 |      100 |        0 |       80 |                 6 |
-----------------|----------|----------|----------|----------|-------------------|

```
要把所有文件包含进去，可以为nyc命令增加-a参数，即修改如下。   
```json
"test": "nyc -a --reporter=clover mocha --recursive"
```

### Reference:    
https://mochajs.org/    
https://istanbul.js.org/    
