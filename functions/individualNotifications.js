const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { Expo } = require('expo-server-sdk');
var fetch = require('node-fetch');

module.exports = functions.database.ref('userChats/{chatID}/{messageID}').onCreate( (snap, context) => {
    const messageID = context.params.messageID;
    const chatID = context.params.chatID;
    const messageFrom = snap.val().user.name;
    const messageText = snap.val().text;

    const fromID = snap.val().user._id;
    const toID = chatID.replace(/_/g, '').replace(fromID, '');

    const root = admin.database().ref();
    var messages = []

    //return the main promise 
    return root.child('users').once('value').then( (snapshot) => {
        

        snapshot.forEach( (childSnapshot) => {
            let userID = childSnapshot.key;
            console.log('userID is ',userID);
            console.log(`and toID is ${toID}`);
            if(userID === toID) {
                let expoToken = childSnapshot.val().expoToken;
                console.log('expoToken: ', expoToken);
                if (Expo.isExpoPushToken(expoToken)) {
                    messages.push({
                        "to": expoToken,
                        "sound": "default",
                        "title": messageFrom,
                        "body": messageText,
                        data: { "title": messageFrom, "message": messageText }
                    });
                }
            }

        });
        //firebase.database then() respved a single promise that resolves
        //once all the messages have been resolved 
        return Promise.all(messages);

    })
    .then( (messages) => {
        console.log(messages)
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