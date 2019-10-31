const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { Expo } = require('expo-server-sdk');
var fetch = require('node-fetch');

module.exports = functions.database.ref('rooms/{roomName}/messages/{messageID}').onCreate( (snap, context) => {
    const messageID = context.params.messageID;
    const roomName = context.params.roomName;
    const messageFrom = snap.val().user.name;
    const messageText = snap.val().text;

    const root = admin.database().ref();
    var messages = []

    //return the main promise 
    return root.child('users').once('value').then( (snapshot) => {
        snapshot.forEach( (childSnapshot) => {

            let expoToken = childSnapshot.val().expoToken;
            console.log('expoToken: ', expoToken);
            if (Expo.isExpoPushToken(expoToken)) {
                messages.push({
                    "to": expoToken,
                    "sound": "default",
                    "title": roomName,
                    "body": messageFrom + ': ' + messageText,
                    data: { "title": roomName, "message": messageFrom + ': ' + messageText }
                });
            }
        });
        //firebase.database then() respved a single promise that resolves
        //once all the messages have been resolved 
        return Promise.all(messages);

    })
    .then( (messages) => {
        // console.log(messages)
        fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(messages)

        });
        console.log('Notifications Sent');
        return null;
    })
    .catch(reason => {
        console.log(reason)
    });


});