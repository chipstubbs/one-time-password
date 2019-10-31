const admin = require('firebase-admin');
const serviceAccount = require('./service_account.json');
const functions = require('firebase-functions');
const createUser = require('./create_user');
const requestOneTimePassword = require('./request_one_time_password');
const verifyOneTimePassword = require('./verify_one_time_password');
const requestNewVerification = require('./request_new_verification');
const mainPushNotifications = require('./main_pushnotifications');
const roomNotifications = require('./roomNotifications');
const individualNotifications = require('./individualNotifications');
const testUser = require('./updateTestUser');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://one-time-password-eb048.firebaseio.com"
});

exports.createUser = functions.https.onRequest(createUser);
exports.requestOneTimePassword = functions.https.onRequest(requestOneTimePassword);
exports.verifyOneTimePassword = functions.https.onRequest(verifyOneTimePassword);
exports.requestNewVerification = functions.https.onRequest(requestNewVerification);
exports.mainPushNotifications = functions.https.onRequest(mainPushNotifications);
exports.roomNotifications = roomNotifications;
exports.individualNotifications = individualNotifications;
exports.updateTestUser = functions.https.onRequest(testUser);