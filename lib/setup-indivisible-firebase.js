require('dotenv').load();
var admin = require('firebase-admin');
var firebasekey = process.env.FIREBASE_INDIVISIBLE_TOKEN.replace(/\\n/g, '\n');

const indivisibleDB = admin.initializeApp({
  credential: admin.credential.cert({
    projectId: 'indivisible-data',
    clientEmail: 'firebase-adminsdk-msqbq@indivisible-data.iam.gserviceaccount.com',
    privateKey: firebasekey,
    databaseAuthVariableOverride: {
      uid: 'my-service-worker',
    },
  }),
  databaseURL: 'https://indivisible-data.firebaseio.com',
}, 'indivisible-db'
);

module.exports = indivisibleDB.database();
