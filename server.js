const express = require('express');
const axios = require('axios');
const querystring = require('querystring');
const path = require('path');
require('dotenv').config();

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/callback', async (req, res) => {
    const { code } = req.query;

    if (!code) {
        return res.status(400).send('No code received');
    }

    try {
        const response = await axios.post(
            process.env.TOKEN_URL,
            querystring.stringify({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: process.env.REDIRECT_URI,
                client_id: process.env.CLIENT_ID,
                client_secret: process.env.CLIENT_SECRET,
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );

        const { access_token } = response.data;

        const userInfoResponse = await axios.get(process.env.USERINFO_URL, {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });

        const { email } = userInfoResponse.data;

        res.send(`
            <html>
            <head>
                <title>User Info</title>
                <link rel="stylesheet" href="style.css">
            </head>
            <body>
                <div class="container">
                    <h1>User's Email Address</h1>
                    <p>${email}</p>
                </div>
            </body>
            </html>
        `);
    } catch (error) {
        console.error(error);
        res.status(500).send('Authentication failed');
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
