const admin = require('firebase-admin');
const { Expo } = require('expo-server-sdk');
const expo = new Expo();

module.exports = function(req, res) {
    console.log('request: ', req);
    if (!req.body.message) {
        return res.status(422).send({ error: 'No message!' });
    }
    
    const title = String(req.body.title);
    const message = String(req.body.message);

    const ref = admin.database().ref('users');
    
    const notifications = [];
    
    // eslint-disable-next-line promise/catch-or-return
    ref.once("value", (snapshot) => {
        snapshot.forEach(childSnapshot => {

            let expoToken = childSnapshot.val().expoToken;
            if (Expo.isExpoPushToken(expoToken)) {
                notifications.push({
                    to: expoToken,
                    sound: 'default',
                    title: title,
                    body: message,
                    data: { title, message }
                });               
                // continue;
            } else {
                console.error(`Push token ${expoToken} is not a valid Expo push token`);
            }
            
        });
        
    }, (errorObject) => {
        console.log("Failed: " + errorObject.code);
        res.status(422).send({ error: 'Failed to read user' });
    })
    .then(() => {
        let chunks = expo.chunkPushNotifications(notifications);
        (async () => {
            for (let chunk of chunks) {
                try {
                    let receipts = await expo.sendPushNotificationsAsync(chunk);
                    console.log('Receipts: ', receipts);
                } catch (error) {
                    console.error(error);
                }
            }
        })();
        // return res.status(200).send(`Success - Notification Sent!!<br>Title: ${title} <br> Message: ${message}`);
        const data = {
            title: title,
            message: message,
            response: 'Success - Notification Sent'
        };
        return res.status(200).json(data);
    
    })
    .catch(() => {
        return res.status(403).send('Failed!')
    });
    
    // return null;
}