const rateLimit = require('express-rate-limit');
let express = require('express');
let axios = require('axios');
let router = express.Router();


const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5 // limit each IP to 100 requests per windowMs
});

// Apply to all requests
router.use(limiter);


router.get('/', async function (req, res) {
    try {
        const response = await axios.get('http://64.227.28.79:3002/public');
        // const response = await axios.get('http://localhost:3002/public');
        if (response.data.length === 0) {
            res.render('index', {
                title: 'CoffeeFacts',
                facts: [{"fact": "No facts in database"}],
                isAuthenticated: req.oidc.isAuthenticated()
            });
        } else {
            let randomFact = Math.floor(Math.random() * response.data.length);
            res.render('index', {
                title: 'CoffeeFacts',
                facts: response.data[randomFact],
                isAuthenticated: req.oidc.isAuthenticated()
            });
        }
    } catch (error) {
        res.render('index', {
            title: 'CoffeeFacts',
            facts: [{"fact": "Error fetching data from database"}],
            isAuthenticated: req.oidc.isAuthenticated()
        });
    }
});

// User profile route
router.get('/userProfile', async function (req, res) {
    // Check if the user is authenticated
    if (!req.oidc.isAuthenticated()) {
        return res.status(403).send('You are not authorized to view this page.');
    } else {
        // Fetch facts specific to the authenticated user
        let data;
        const userId = req.oidc.user.sub;
        const {token_type, access_token} = req.oidc.accessToken;

        try {
            const response = await axios.get('http://64.227.28.79:3002/private', {
                headers: {
                    authorization: `${token_type} ${access_token}`
                }
            });
            data = response.data.filter(item => item.user_id === userId);
        } catch (error) {
            console.log('Error fetching data:', error);
            data = [{"fact": "Error fetching data from database"}];
        }

        // Render the user profile page
        res.render('userProfile', {
            title: 'Your Profile',
            isAuthenticated: req.oidc.isAuthenticated(),
            user: req.oidc.user,
            user_id: userId,
            data: data
        });
    }
});


// Handle the editing of a fact
router.get('/editFact/:id', async (req, res) => {
    if (!req.oidc.isAuthenticated()) {
        return res.status(403).send('You are not authorized to edit this fact.');
    } else {
        const id = req.params.id;
        const user_id = req.oidc.user.sub;

        try {
            const response = await axios.get(`http://64.227.28.79:3002/editFact/${id}`, {
                headers: {
                    authorization: `${req.oidc.accessToken.token_type} ${req.oidc.accessToken.access_token}`
                }
            });

            if (response.data.user_id !== user_id) {
                return res.status(403).send('You are not authorized to edit this fact.');
            }

            // Render the editing form with pre-populated data
            res.render('editFact', {
                fact: response.data,
                isAuthenticated: req.oidc.isAuthenticated(),
            });
        } catch (error) {
            console.log('Error fetching data:', error);
            return res.status(500).send('Error fetching data.');
        }
    }
});

// Handle updating an edited fact
router.post('/editFact/:id', (req, res) => {
    if (!req.oidc.isAuthenticated()) {
        return res.status(403).send('You are not authorized to edit this fact.');
    } else {
        const id = req.params.id;
        const {fact, source} = req.body;

        // Update the fact using axios
        axios.put(`http://64.227.28.79:3002/editFact/${id}`, {
            fact,
            source
        }, {
            headers: {
                authorization: `${req.oidc.accessToken.token_type} ${req.oidc.accessToken.access_token}`
            }
        }).then(response => {
            if (response.data.success) {
                res.redirect('/userProfile');
            } else {
                res.status(500).send('Error updating data.');
            }
        }).catch(error => {
            console.log('Error updating data:', error);
            res.status(500).send('Error updating data.');
        });
    }
});


router.post('/submit', async (req, res) => {
    if (!req.oidc.isAuthenticated()) {
        return res.status(403).send('You are not authorized to add a fact.');
    } else {
        const {fact, source} = req.body;
        const user_id = req.oidc.user.sub;

        try {
            await axios.post('http://64.227.28.79:3002/addFact', {fact, source, user_id}, {
                headers: {
                    authorization: `${req.oidc.accessToken.token_type} ${req.oidc.accessToken.access_token}`
                }
            });
            return res.redirect('/userProfile');
        } catch (err) {
            return res.status(500).send('Error inserting data.');
        }
    }
});
router.post('/deleteFact/:id', (req, res) => {
    if (!req.oidc.isAuthenticated()) {
        return res.status(403).send('You are not authorized to delete this fact.');
    } else {
        const id = req.params.id;
        axios.delete(`http://64.227.28.79:3002/deleteFact/${id}`, {
            headers: {
                authorization: `${req.oidc.accessToken.token_type} ${req.oidc.accessToken.access_token}`
            }
        }).then(() => {
            return res.redirect('/userProfile');
        }).catch(error => {
            console.log('Error deleting data:', error);
            return res.status(500).send('Error deleting data.');
        });
    }
});




module.exports = router;
