#!/usr/bin/env node

const firebasedb = require('../lib/setup-firebase');

const IndTownHall = require('./townhall-model');
const production = process.env.NODE_ENV === 'production';

function compareLists() {

  const canceledEvents = [];
  firebasedb.ref('townHallIds').once('value')
    .then((snapshot) => {
      snapshot.forEach(ele => {
        const townHall = ele.val();
        if (
          townHall.status === 'cancelled' && 
          townHall.indivisiblepath && 
          townHall.indivisiblepath !== true &&
          townHall.indivisible_status !== 'cancelled') {
          let id = townHall.indivisiblepath.split('/')[4];
          if (Number(id)) {
            canceledEvents.push({
              path: townHall.indivisiblepath,
              thpId: ele.key,
            });
          }
        }
      });
      return canceledEvents;
    }).then((canceledEvents) => {
      if (!production) {
        return;
      }
      canceledEvents.forEach((townHall) => {
        IndTownHall.cancelEvent(townHall.path)
          .then(() => {
            firebasedb.ref(`townHallIds/${townHall.thpId}`).update({
              indivisible_status: 'cancelled',
            });
          }).catch(console.log);
      });
    }).catch(console.log);
}

compareLists();
module.exports = compareLists;