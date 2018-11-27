const admin = require('firebase-admin');
const serviceAccount = requre('./service_account.json');
const functions = require('firebase-functions');
const createUser = require('./create_user');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://one-time-password-eb048.firebaseio.com"
});

exports.createUser = functions.https.onRequest(createUser);