const IndTownHall = require('./townhall-model');
const firebasedb = require('../lib/setup-firebase');
const inddivisibleFb = require('../lib/setup-indivisible-firebase');
const firebaseKey = require('../lib/firebase-key/firebaseKey');


inddivisibleFb.ref(firebaseKey).once('value')
  .then((snapshot) => {
    snapshot.forEach((el) => {
      const event = el.val();
      if (event.thpId) {
        firebasedb.ref(`townHallIds/${event.thpId}`).once('value')
        .then((snap) => {
          const townhall = snap.val();
          if (townhall.indivisiblepath) {
            const townHallIndId = Number(townhall.indivisiblepath.split('/')[4]);
            if (townHallIndId != el.key) {
              console.log(el.key, townHallIndId, townhall.eventId);
              IndTownHall.cancelEvent(`/rest/v1/event/${el.key}/`)
            }
          }
        })
      }
    })
  })