const { includes } = require('lodash');
const firebasedb = require('../lib/setup-firebase');
const indFireabasedb = require('../lib/setup-indivisible-firebase');

const IndTownHall = require('./townhall-model');

module.exports = function compareLists() {

  const indivisibleIds = [];

  firebasedb.ref('townHalls').once('value')
    .then((snapshot) => {
      snapshot.forEach(ele => {
        const townHall = ele.val();
        if (townHall.indivisiblepath) {
          let id = townHall.indivisiblepath.split('/')[4];
          if (Number(id)){
            indivisibleIds.push(Number(id));
          }
        }
      });
      return indivisibleIds;
   

    }).then((indivisibleIds) => {
      indFireabasedb.ref('indivisible_public_events').once('value')
        .then(snapshot => {
          snapshot.forEach(ele => {
            const townHall = new IndTownHall(ele.val());
            if (townHall.issueFocus === 'Town Hall') {
              if (!includes(indivisibleIds, townHall.id)) {
                townHall.cancelEvent(townHall.resource_uri);
              }
            }
          });
        });
    });
};