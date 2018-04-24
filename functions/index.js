const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cryptico = require('cryptico');
const firebase = require('firebase');

admin.initializeApp(functions.config().firebase);

exports.createBursaryAccount = functions.database.ref('users/bursary/accounts/{key}').onCreate(event => {
    const data = event.data.current.val();
    const key = event.params.key;
    const randomString = key.split('').sort(() => { return 0.5 - Math.random() }).join('');
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
        console.log(`Successfully created new user: ${JSON.stringify(user)}`);
        return admin.database().ref(`users/bursary/accounts/${user.uid}`).update({ created: true }).then(() => {
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
    const randomString = key.split('').sort(() => { return 0.5 - Math.random() }).join('');
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
        console.log(`Successfully created new user: ${JSON.stringify(password)}`);
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

exports.flagStudentAccount = functions.database.ref('users/students/{uid}/flag').onWrite(event => {
    const flag = event.data.current.val();
    const uid = event.params.uid;
    if (flag !== null) {
        return admin.auth().getUser(uid).then(user => {
            user.disabled = flag;
            console.log('Student account flagged (disabled): ', uid);
        }).catch(error => {
            console.log('Error when flagging (disabling) account: ', error);
            return Promise.reject(error);
        });
    }
});

exports.sendCustomerCreditTransactionNotification = functions.database.ref('transactions/credit/{key}').onCreate(event => {
    const data = event.data.current.val();
    const amount = data.amount;
    const address = data.destination;

    const payload = {
        notification: {
            title: 'New Credit Transation',
            body: `You received amount: ${amount.value} ${amount.currency}`,
            sound: 'default'
        },
        data: {
            title: 'Credit',
            message: JSON.stringify(data)
        }
    }
    return admin.database().ref(`fcmTokens/${address}`).once('value').then(token => token.val()).then(userFcmToken => {
        return admin.messaging().sendToDevice(userFcmToken, payload).then(result => {
            console.log('Message sent successfully', result);
            return Promise.resolve(result);
        }).catch(error => {
            console.log(error);
            return Promise.reject(error);
        });
    }).catch(error => {
        console.log('Error retrieving fcm token');
        return Promise.reject(error);
    });
});

exports.sendCustomerDebitTransactionNotification = functions.database.ref('transactions/debit/{key}').onCreate(event => {
    const data = event.data.current.val();
    const uid = data.uid;
    const address = data.source.address;

    const amount = data.destination.amount;
    const payload = {
        notification: {
            title: 'New Debit Transation',
            body: `You received a request to withdraw ${amount.value} ${amount.currency}`,
            sound: 'default'
        },
        data: {
            title: 'Debit',
            message: JSON.stringify(data)
        }
    }

    return admin.database().ref(`fcmTokens/${address}`).once('value').then(token => token.val()).then(userFcmToken => {
        return admin.messaging().sendToDevice(userFcmToken, payload).then(result => {
            console.log('Message sent successfully', result);
            return Promise.resolve(result);
        }).catch(error => {
            console.log(error);
            return Promise.reject(error);
        });
    }).catch(error => {
        console.log('Error retrieving fcm token');
        return Promise.reject(error);
    });
});

exports.sendVendorDebitTransactionNotification = functions.database.ref('transactions/debit/{key}').onUpdate(event => {

    const currentData = event.data.current.val();
    const previousData = event.data.previous.val();
    const status = currentData.status;
    const amount = currentData.destination.amount.value;
    const currency = currentData.destination.amount.currency;
    const uid = currentData.uid;

    if (previousData === null) {
        return;
    }

    if (status === 'pending') {
        return;
    }

    const payload = {
        notification: {
            title: status === 'success' ? 'Transaction accepted' : 'Transaction cancelled',
            body: status === 'success' ? `The user accepted the transaction.` : `The user cancelled the transaction.`,
            sound: 'default'
        },
        data: {
            title: status === 'success' ? 'Transaction accepted' : 'Transaction canceled',
            message: status === 'success' ? `The user accepted the transaction for ${amount} ${currency}.` : `The user cancelled the transaction.`
        }
    }

    return admin.database().ref(`fcmTokens/${uid}`).once('value').then(token => token.val()).then(userFcmToken => {
        return admin.messaging().sendToDevice(userFcmToken, payload).then(result => {
            console.log(`Message sent successfully to ${uid}`, result);
            return Promise.resolve(result);
        }).catch(error => {
            console.log(error);
            return Promise.reject(error);
        });
    }).catch(error => {
        console.log('Error retrieving fcm token');
        return Promise.reject(error);
    });
});
