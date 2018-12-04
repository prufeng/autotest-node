var express = require('express');
var router = express.Router();
var log = require('../demo/log4js').getLogger('users', router);


/* GET users listing. */
router.get('/', function(req, res, next) {
  log.info('respond with a resource');
  res.send('respond with a resource');
});

module.exports = router;
