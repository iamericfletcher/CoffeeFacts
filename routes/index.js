let express = require('express');
let axios = require('axios');
let router = express.Router();


/* GET home page. */
router.get('/', async function (req, res, next) {
        console.log(req.oidc.isAuthenticated());
        try {
            const response = await axios.get('http://64.227.28.79:3002/facts');
            if (response.data.length === 0) {
                console.log('No facts in database');
                res.render('index', {
                        title: 'CoffeeFacts',
                        facts: [{"fact": "No facts in database"}],
                        isAuthenticated: req.oidc.isAuthenticated()
                    }
                );
            } else {
                res.render('index', {
                    title: 'CoffeeFacts',
                    facts: response.data,
                    isAuthenticated: req.oidc.isAuthenticated()
                });
            }
        } catch
            (error) {
            console.log('Error fetching data:', error);
            res.render('index', {
                title: 'CoffeeFacts',
                facts: [{"fact": "Error fetching data from database"}],
                isAuthenticated: req.oidc.isAuthenticated()
            });
        }
    }
)
;

module.exports = router;
