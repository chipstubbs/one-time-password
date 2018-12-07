const admin = require('firebase-admin');

module.exports = function(req, res) {
    if (!req.body.phone || !req.body.code) {
        return res.status(422).send({ error: 'Phone and code must be provided' });
    }

    const phone = String(req.body.phone).replace(/[^\d]/g, '');
    const code = parseInt(req.body.code);

    admin.auth().getUser(phone)
        // eslint-disable-next-line promise/always-return
        .then(() => {
            const ref = admin.database().ref('users/' + phone);
            ref.on('value', snapshot => {
                ref.off();
                const user = snapshot.val();

                if (user.code !== code || !user.codeValid) { return res.status(422).send({ error: 'Code not valid' }); }

                ref.update({ codeValid: false });
                // eslint-disable-next-line promise/no-nesting
                admin.auth().createCustomToken(phone)
                    .then(token => res.send({ token: token }))
                    // eslint-disable-next-line handle-callback-err
                    .catch(err => {
                        res.status(422).send({ error: 'Error receiving token' });
                    })

            })
        })
        .catch((err) => res.status(422).send({ error: err }))

        return null;
}
