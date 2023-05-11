require('dotenv').load();
const testing = process.env.NODE_ENV !== 'production';

const firebaseKey = testing ? 'indivisible_public_events_testing' : 'indivisible_public_events';

module.exports = {
    firebaseKey: firebaseKey
};