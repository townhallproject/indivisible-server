const IndTownHall = require('./townhall-model');
const firebasedb = require('../lib/setup-firebase');
const inddivisibleFb = require('../lib/setup-indivisible-firebase');


inddivisibleFb.ref('indivisible_public_events').once('value')
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