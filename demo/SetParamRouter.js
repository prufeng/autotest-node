var express = require('express');
var router = express.Router();

function setUserId() {
    return function (req, res, next) {
        req.userId = 'LiLei';
        next();
    };
}

function next() {
    return function (req, res, next) {
        next();
    };
}

router.all('*', setUserId(), next());

module.exports = router;
