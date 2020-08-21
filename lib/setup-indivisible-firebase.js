require('dotenv').load();
const admin = require('firebase-admin');
const testing = process.env.NODE_ENV !== 'production';
const staging = !!process.env.STAGING_DATABASE;
console.log('testing', testing);
console.log('staging', staging);

const key = testing ? process.env.FIREBASE_INDIVISIBLE_TESTING_TOKEN: process.env.FIREBASE_INDIVISIBLE_TOKEN;
const firebasekey = key.replace(/\\n/g, '\n');
const projectId = testing ? process.env.FIREBASE_INDIVISIBLE_TESTING_PROJECT_ID: process.env.FIREBASE_INDIVISIBLE_PROJECT_ID;
const clientEmail = testing ? process.env.FIREBASE_INDIVISIBLE_TESTING_CLIENT_EMAIL : process.env.FIREBASE_INDIVISIBLE_CLIENT_EMAIL;
const databaseURL = testing ? process.env.FIREBASE_INDIVISIBLE_TESTING_DB_URL : process.env.FIREBASE_INDIVISIBLE_DB_URL;

console.log('INDIVISIBLE DATABSE ID', projectId);

const indivisibleDB = admin.initializeApp({
  credential: admin.credential.cert({
    projectId: projectId,
    clientEmail: clientEmail,
    privateKey: firebasekey,
    databaseAuthVariableOverride: {
      uid: 'my-service-worker',
    },
  }),
  databaseURL: databaseURL,
}, 'indivisible-db'
);

module.exports = indivisibleDB.database();
