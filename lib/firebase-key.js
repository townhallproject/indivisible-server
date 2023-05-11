require('dotenv').load();
const testing = (process.env.NODE_ENV !== 'production') || (process.env.STAGING_DATABASE === 'true');

const firebaseKey = testing ? 'indivisible_public_events_testing' : 'indivisible_public_events';
console.log("Using firebase key ", firebaseKey);

module.exports = {
    firebaseKey: firebaseKey
};