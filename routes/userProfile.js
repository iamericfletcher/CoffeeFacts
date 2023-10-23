var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.render('userProfile', { title: 'Your Profile' });
});

module.exports = router;
