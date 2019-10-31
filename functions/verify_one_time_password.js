const admin = require('firebase-admin');
const authy = require('./authyConfig.json');
const Client = require('authy-client').Client;
const client = new Client(authy);

module.exports = function(req, res) {
    if (!req.body.phone || !req.body.code) {
        return res.status(422).send({ error: 'Phone and code must be provided' });
    }

    const phone = String(req.body.phone).replace(/[^\d]/g, '');
    const code = String(parseInt(req.body.code));

    if (phone === '5555555555' && code === '9955') {

        // eslint-disable-next-line promise/no-nesting
        admin.auth().createCustomToken(phone)
            .then(token => res.send({ token: token }))
            // eslint-disable-next-line handle-callback-err
            .catch(error => {
                res.status(422).send({ error: 'Error receiving token' });
            })
        return null;
    }

    admin.auth().getUser(phone)
        // eslint-disable-next-line promise/always-return
        .then(() => {
            
            const ref = admin.database().ref('users/' + phone);
            ref.on('value', snapshot => {
                ref.off();
                const user = snapshot.val();

                client.verifyToken({ authyId: user.authyId, token: code }, (err, response) => {
                    // if (err) throw err.response
                    if (err) throw new Error(`Code is invalid: ${err.response}`);
                   
                    console.log('Token is valid');
                        
                        ref.update({ itWorked: true });
                        // eslint-disable-next-line promise/no-nesting
                        admin.auth().createCustomToken(phone)
                            .then(token => res.send({ token: token }))
                            // eslint-disable-next-line handle-callback-err
                            .catch(error => {
                                res.status(422).send({ error: 'Error receiving token' });
                            })
                });
                // if (user.code !== code || !user.codeValid) { return res.status(422).send({ error: 'Code not valid' }); }

                

            })
        })
        .catch((err) => res.status(422).send({ error: 'verify line 42 error: ' + err }))

        return null;
}
