var express = require('express');
var axios = require('axios');
var router = express.Router();


/* GET home page. */
router.get('/', async function (req, res, next) {
    try {
        const response = await axios.get('http://64.227.28.79:3002/facts');
        res.render('index', { title: 'CoffeeFacts', facts: response.data });
    } catch (error) {
        console.log('Error fetching data:', error);
        res.render('index', { title: 'CoffeeFacts', facts: [] });
    }
});

module.exports = router;



module.exports = router;
