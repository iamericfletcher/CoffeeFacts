const axios = require("axios").default;

const getAuth0Token = async (domain, clientId, clientSecret, audience) => {
    const options = {
        method: 'POST',
        url: `${domain}/oauth/token`,
        headers: {'content-type': 'application/x-www-form-urlencoded'},
        data: new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: clientId,
            client_secret: clientSecret,
            audience: audience
        })
    };

    try {
        const response = await axios.request(options);
        return response.data;
    } catch (error) {
        console.error("Error getting Auth0 token:", error);
        return null;
    }
};

module.exports = {
    getAuth0Token
};
