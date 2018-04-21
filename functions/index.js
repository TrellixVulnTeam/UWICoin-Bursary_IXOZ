const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cryptico = require('cryptico');
const firebase = require('firebase');

admin.initializeApp(functions.config().firebase);

exports.createBursaryAccount = functions.database.ref('users/bursary/{key}').onCreate(event => {
    const data = event.data.current.val();
    const key = event.params.key;
    const randomString = key.split('').sort(() => { return 0.5-Math.random() }).join('');
    const rsakey = cryptico.generateRSAKey(randomString, 1024);
    const publicKey = cryptico.publicKeyString(rsakey);


    const full_name = data.full_name;
    const email = data.email;
    const password = cryptico.publicKeyID(publicKey);

    return admin.auth().createUser({
        uid: key,
        email: email,
        emailVerified: true,
        displayName: full_name,
        disabled: false,
        password: password
    }).then((user) => {
        console.log(`Successfully created new user: ${ JSON.stringify(user) }`);
        return admin.database().ref(`users/bursary/${user.uid}`).update({ created: true }).then(() => {
            console.log('User created attribute added');
        }).catch(error => {
            console.log(error);
            return Promise.reject(error);
        });
    }).catch(error => {
        console.log(`Error creating new user: ${error}`);
        return Promise.reject(error);
    });
});

exports.createVendorAccount = functions.database.ref('users/vendors/{key}').onCreate(event => {
    const data = event.data.current.val();
    const key = event.params.key;
    const randomString = key.split('').sort(() => { return 0.5-Math.random() }).join('');
    const rsakey = cryptico.generateRSAKey(randomString, 1024);
    const publicKey = cryptico.publicKeyString(rsakey);


    const full_name = data.full_name;
    const email = data.email;
    const password = cryptico.publicKeyID(publicKey);

    return admin.auth().createUser({
        uid: key,
        email: email,
        emailVerified: true,
        displayName: full_name,
        disabled: false,
        password: password
    }).then((user) => {
        console.log(`Successfully created new user: ${ JSON.stringify(password) }`);
        return admin.database().ref(`users/vendors/${user.uid}`).update({ created: true }).then(() => {
            console.log('User created attribute added');
        }).catch(error => {
            console.log(error);
            return Promise.reject(error);
        });
    }).catch(error => {
        console.log(`Error creating new user: ${error}`);
        return Promise.reject(error);
    });
});

exports.flagStudentAccount = functions.database.ref('users/students/{uid}/flag').onUpdate(event => {
    const flag = event.data.current.val();
    const uid = event.params.uid;
    if(flag !== null) {
        return admin.auth().getUser(uid).then(user => {
            user.disabled = flag;
            console.log('Student account flagged (disabled): ', uid);
        }).catch(error => {
            console.log('Error when flagging (disabling) account: ', error);
            return Promise.reject(error);
        });
    }
});

exports.encryptDebitTransaction = functions.database.ref('transactions/debit/{address}').onUpdate(event => {
    const address = event.params.address;
    const data = event.data.current.val();
    const previous = event.data.previous.val();

    const prepared = data.prepared;

    const rsakey = cryptico.generateRSAKey(address, 1024);
    const publicKey = cryptico.publicKeyString(rsakey);
    const encrypted = cryptico.encrypt(JSON.stringify(prepared), publicKey, rsakey);


    const payload = {
        notification: {
            title: 'New Debit Transation',
            body: `Description: ${data.description}, Amount: ${data.amount}, Fee: ${data.fee}`
        }
    }

    return admin.database().ref(`transactions/debit/${address}`).update({ prepared: encrypted}).then(() => {
        console.log('Encryption successful');
        return admin.database().ref(`fcmTokens/${address}`).once('value').then(token => token.val()).then(userFcmToken => {
            return admin.messaging().sendToDevice(userFcmToken, payload).then(result => {
                console.log('Message sent successfully', result);
            }).catch(error => {
                console.log(error);
                return Promise.reject(error);
            });
        }).catch(error => {
            console.log('Error retrieving fcm token');
            return Promise.reject(error);    
        });
    }).catch(error => {
        console.log('Error encrypting debit transaction: ', error);
        return Promise.reject(error);
    });

});

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
