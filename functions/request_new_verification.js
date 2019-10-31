const admin = require('firebase-admin');
const authy = require('./authyConfig.json');
const Client = require('authy-client').Client;
const client = new Client(authy);

module.exports = function(req, res) {
    if (!req.body.phone) {
        return res.status(422).send({ error: 'You must provide a phone number' });
    }

    const phone = String(req.body.phone).replace(/[^\d]/g, "");

    const ref = admin.database().ref('users/' + phone + '/authyId');

    // test user check
    if (phone === '5555555555') {
        res.send('Test user Success');
    } else {
        ref.on("value", (snapshot) => {
            let authyId = snapshot.val();
            console.log('authyId: ', authyId);
            client.requestSms({ authyId: authyId }, (err, response) => {
                // if (err) throw new Error('Text code was not sent');
                if (err) {
                    res.status(422).send({ error: "SMS Request Error" });
                } else {
                    console.log(`SMS re-requested to ${response.cellphone}`);
                    res.send('Validation Code Sent');
                }
                
            });
        }, (errorObject) => {
            console.log("The read failed: " + errorObject.code);
            res.status(422).send({ error: 'Failed to read user' });
        });
    }
    
    
    
    return null;
}
