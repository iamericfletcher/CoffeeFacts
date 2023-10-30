const rateLimit = require('express-rate-limit');
let express = require('express');
let axios = require('axios');
let router = express.Router();
require('dotenv').config();

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

// Apply to all requests
router.use(limiter);

async function getManagementApiToken() {
    const options = {
        method: 'POST',
        url: `https://${process.env.DOMAIN}/oauth/token`,
        headers: {'content-type': 'application/x-www-form-urlencoded'},
        data: new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: process.env.CLIENTID,
            client_secret: process.env.CLIENTSECRET,
            audience: `https://${process.env.DOMAIN}/api/v2/`
        })
    };

    try {
        const response = await axios.request(options);
        return response.data.access_token;
    } catch (error) {
        console.error('Error fetching Management API token:', error);
        throw new Error('Could not fetch Management API token');
    }
}


// Middleware to check if user is an admin
async function isAdmin(req, res, next) {
    if (!req.oidc.isAuthenticated()) {
        return false;
    } else {
        const id = req.oidc.user.sub;
        const managementApiToken = await getManagementApiToken();

        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: `https://${process.env.DOMAIN}/api/v2/roles/${process.env.ADMINROLEID}/users`,
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${managementApiToken}`
            }
        };

        try {
            const response = await axios(config);
            const admins = response.data.map(item => item.user_id);
            return admins.includes(id);
        } catch (error) {
            console.log('Error fetching data:', error);
            res.status(500).send('Error fetching data.');
        }
    }
}


router.get('/', async function (req, res) {
    try {
        // const response = await axios.get('http://64.227.28.79:3002/public');
        const response = await axios.get(process.env.DEVSERVER + '/public');
        if (response.data.length === 0) {
            res.render('index', {
                title: 'CoffeeFacts',
                facts: [{"fact": "No facts in database"}],
                isAuthenticated: req.oidc.isAuthenticated(),
                isAdmin: await isAdmin(req, res)
            });
        } else {
            let randomFact = Math.floor(Math.random() * response.data.length);
            res.render('index', {
                title: 'CoffeeFacts',
                facts: response.data[randomFact],
                isAuthenticated: req.oidc.isAuthenticated(),
                isAdmin: await isAdmin(req, res)
            });
        }
    } catch (error) {
        res.render('index', {
            title: 'CoffeeFacts',
            facts: [{"fact": "Error fetching data from database"}],
            isAuthenticated: req.oidc.isAuthenticated(),
            isAdmin: await isAdmin(req, res)
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
        let data_pending;
        const userId = req.oidc.user.sub;
        const {token_type, access_token} = req.oidc.accessToken;

        try {
            // const response = await axios.get('http://64.227.28.79:3002/private', {
            const response = await axios.get(process.env.DEVSERVER + '/private', {
                headers: {
                    authorization: `${token_type} ${access_token}`
                }
            });
            // Filter the response data to only include facts submitted by the authenticated user and approved by an admin
            data = response.data.filter(item => item.user_id === userId && item.is_approved === 1);
            // Filter the response data to only include facts submitted by the authenticated user and are pending approval
            data_pending = response.data.filter(item => item.user_id === userId && item.is_approved === 0);
        } catch (error) {
            console.log('Error fetching data:', error);
            data = [{"fact": "Error fetching data from database"}];
            data_pending = [{"fact": "Error fetching data from database"}];
        }

        // Render the user profile page
        res.render('userProfile', {
            title: 'Your Profile',
            isAuthenticated: req.oidc.isAuthenticated(),
            user: req.oidc.user,
            user_id: userId,
            data: data,
            data_pending: data_pending,
            isAdmin: await isAdmin(req, res)
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
            // const response = await axios.get(`http://64.227.28.79:3002/editFact/${id}`, {
            const response = await axios.get(process.env.DEVSERVER + `/editFact/${id}`, {
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
        // axios.put(`http://64.227.28.79:3002/editFact/${id}`, {
        axios.put(process.env.DEVSERVER + `/editFact/${id}`, {
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
            // await axios.post('http://64.227.28.79:3002/addFact', {fact, source, user_id}, {
            await axios.post(process.env.DEVSERVER + '/addFact', {fact, source, user_id}, {
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
        // axios.delete(`http://64.227.28.79:3002/deleteFact/${id}`, {
        axios.delete(process.env.DEVSERVER + `/deleteFact/${id}`, {
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

// Admin route to request all unapproved facts from the database
router.get('/adminPanel', async (req, res) => {
    const admin = await isAdmin(req, res);
    // Check if user is an admin
    if (!req.oidc.isAuthenticated() || !admin) {
        return res.status(403).send('You are not authorized to view this page.');
    } else {
        try {
            // const response = await axios.get('http://64.227.28.79:3002/unapprovedFacts', {
            const response = await axios.get(process.env.DEVSERVER + '/unapprovedFacts', {
                headers: {
                    authorization: `${req.oidc.accessToken.token_type} ${req.oidc.accessToken.access_token}`
                }
            });
            res.render('adminPanel', {
                title: 'Admin',
                isAuthenticated: req.oidc.isAuthenticated(),
                user: req.oidc.user,
                facts: response.data,
                isAdmin: admin
            });
        } catch (error) {
            console.log('Error fetching data:', error);
            return res.status(500).send('Error fetching data.');
        }
    }
});

// Admin route to approve a fact
router.post('/adminApproveFact/:id', async (req, res) => {
        // Check if user is an admin
        const admin = await isAdmin(req, res);
        console.log('is admin:', admin);
        if (!req.oidc.isAuthenticated() || !admin) {
            return res.status(403).send('You are not authorized to approve this fact.');
        } else {
            const id = req.params.id;
            axios.put(process.env.DEVSERVER + `/adminApproveFact/${id}`, {}, {
                headers: {
                    authorization: `${req.oidc.accessToken.token_type} ${req.oidc.accessToken.access_token}`
                }
            }).then(response => {
                if (response.data.success) {
                    res.redirect('/adminPanel');
                } else {
                    res.status(500).send('Error updating data.');
                }
            }).catch(error => {
                console.log('Error updating data:', error);
                res.status(500).send('Error updating data.');
            });
        }
    }
);

// Admin route to reject a fact
router.post('/adminRejectFact/:id', async (req, res) => {
        // Check if user is an admin
        const admin = await isAdmin(req, res);
        if (!req.oidc.isAuthenticated() || !admin) {
            return res.status(403).send('You are not authorized to reject this fact.');
        } else {
            const id = req.params.id;
            axios.delete(process.env.DEVSERVER + `/adminRejectFact/${id}`, {
                headers: {
                    authorization: `${req.oidc.accessToken.token_type} ${req.oidc.accessToken.access_token}`
                }
            }).then(response => {
                if (response.data.success) {
                    res.redirect('/adminPanel');
                } else {
                    res.status(500).send('Error updating data.');
                }
            }).catch(error => {
                console.log('Error updating data:', error);
                res.status(500).send('Error updating data.');
            });
        }
    }
);


module.exports = router;
