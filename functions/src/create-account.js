const functions = require('firebase-functions')
const admin =  require('firebase-admin')
const cryptico = require('cryptico');

export const createBursaryAccount = functions.database.ref('users/bursary/{key}').onCreate(event => {
    const data = event.data.val();
    const key = event.params.key;
    const randomString = key.split('').sort(function(){return 0.5-Math.random()}).join('');
    const rsakey = cryptico.generateRSAKey(randomString, 1024);
    const publicKey = cryptico.publicKeyString(rsakey);


    const full_name = data.full_name;
    const email = data.email;
    const password = cryptico.publicKeyID(publicKey);

    admin.auth().createUser({
        uid: key,
        email: email,
        emailVerified: false,
        displayName: full_name,
        disabled: false,
        password: password
    }).then((user) => {
        console.log('Successfully created new user: ', user.uid);
        console.log('Password ', password);
        console.log(JSON.stringify(user, null, 2));
    }).catch(error => {
        console.log('Error creating new user: ', error);
    });
});

// exports.createVendorAccount = functions.database.ref('users/vendors/').onCreate(event => {

// });