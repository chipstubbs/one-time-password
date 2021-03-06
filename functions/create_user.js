const admin = require('firebase-admin');
const authy = require('./authyConfig.json');
const Client = require('authy-client').Client;
const client = new Client(authy);

module.exports = (req, res) => {
    // Verify the user provided a phone
    if (!req.body.phone) {
        return res.status(422).send({ error: 'Bad Input' });
    }

    // Format the phone number to remove dashes and parenthesis
    const phone = String(req.body.phone).replace(/[^\d]/g);
    const email = req.body.email;
    const name = String(req.body.name);

    console.log('req.body.email = ', req.body.email);
    console.log('String() email = ', String(req.body.email));
    console.log('String().trim() = ', String(req.body.email).trim());
    // Create a new user account using that phone number
    admin.auth().createUser({ uid: phone, email: email, displayName: name })
        .then(user => {
            res.send(user);
            return true;
        })
        .catch(error => {
            res.status(422).send({ error });
            return error.message;
        });

    // Respond to the user request, saying the account was made
}

