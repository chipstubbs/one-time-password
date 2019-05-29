const admin = require('firebase-admin');
// const twilio = require('./twilio');
const authy = require('./authyConfig.json');
const Client = require('authy-client').Client;
const client = new Client(authy);

module.exports = function(req, res) {
    if (!req.body.phone) {
        return res.status(422).send({ error: 'You must provide a phone number' });
    }

    const name = String(req.body.name);
    const phone = String(req.body.phone).replace(/[^\d]/g, "");
    const email = String(req.body.email).trim();

    admin.auth().getUser(phone)
        .then(userRecord => {
            // const code = Math.floor((Math.random() * 8999 + 1000));

            // twilio.messages.create({
            //     body: 'Your code is ' + code,
            //     to: phone,
            //     from: '17726634205'
            // }, (err) => {
            //     if (err) { return res.status(422).send(err); }

            //     admin.database().ref('users/' + phone)
            //         .update({ code: code, codeValid: true }, () => {
            //             res.send({ success: true });
            //         });
            // })

            // Authy 
            // Register user in Authy as well as firebase
            client.registerUser({
                countryCode: 'US',
                email: email,
                phone: phone
            }, (err, res) => {
                if (err) throw err;

                // eslint-disable-next-line promise/no-nesting
                admin.database().ref('users/' + phone)
                    .update({ authyId: res.user.id, displayName: name, email: email })
                    .then((fbResponse) => {
                        return true;
                    })
                    .catch((fireError) => res.status(422).send({ error: `fireError ${fireError}` }));
                    // .update({ authyId: res.user.id, displayName: name }, (updateResponse) => {
                    //     updateResponse.send({ success: true });
                    // });
            
                client.requestSms({ authyId: res.user.id }, (err, response) => {
                // if (err) throw err;
                    if (err) throw new Error('Text code was not sent');
                
                    console.log(`SMS requested to ${response.cellphone}`);
                });
            });

            res.send(userRecord);
            return true;
        })
        .catch((error) => {
            res.status(422).send({ error: "ok" });
        });
}
