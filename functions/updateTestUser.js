const admin = require('firebase-admin');
// const authy = require('./authyConfig.json');
// const Client = require('authy-client').Client;
// const client = new Client(authy);

module.exports = function(req, res) {
     
        admin.auth().createUser({
            uid: '5555555555',
            email: 'marketing@advisorsacademy.com',
            password: 'secretPassword',
            displayName: 'Test User',
        // eslint-disable-next-line promise/always-return
        }).then(user => {
            console.log('made user', user);
        })
        .catch(error => {
            console.log(error.message);
        });
}
