var express = require('express');
var router = express.Router();
var log = require('../demo/log4js').getLogger('index', router);

/* GET home page. */
router.get('/', function(req, res, next) {
  log.info('index');
  res.render('index', { title: 'Express' });
});

module.exports = router;
