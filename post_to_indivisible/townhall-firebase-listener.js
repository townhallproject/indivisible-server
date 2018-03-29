const moment = require('moment');

const firebasedb = require('../lib/setup-firebase');
const IndTownHall = require('./townhall-model');

function prepTownHall(townhall) {
  if ((!townhall.repeatingEvent) && (townhall.meetingType !== 'Tele-Town Hall') && (moment(townhall.dateObj).isAfter()) && (townhall.meetingType !=='Tele-town Hall')) {
    let newTownHall = new IndTownHall(townhall);
    if (newTownHall.event_address1 ) {
      return newTownHall;
    }
    return null;
  }
}

module.exports = function setUpListener() {
  firebasedb.ref('townHalls/').on('child_added', function(snapshot){
    var townhall = snapshot.val();
    firebasedb.ref(`townHallIds/${townhall.eventId}`).once('value').then(function(ele){
      var idObj = ele.val();
      if (!idObj) {
        return console.log('no id');
      }
      if (!idObj.indivisiblepath) {
        let newTownHall = prepTownHall(townhall);
        if (newTownHall) {
          newTownHall.submitEvent(townhall.eventId);
        }
      } else {
        console.log('already added');
      }
    });
  });
  firebasedb.ref('townHalls/').on('child_changed', function(snapshot){
    var townhall = snapshot.val();
    firebasedb.ref(`townHallIds/${townhall.eventId}`).once('value').then(function(ele){
      var idObj = ele.val();
      if (!idObj) {
        return console.log('no id');
      }
      if (!idObj.indivisiblepath) {
        return console.log('no path');
      }
      console.log('changed');
      let newTownHall = prepTownHall(townhall);
      if (newTownHall) {
        console.log('updating', newTownHall.event_title);
        newTownHall.updateEvent(townhall.eventId, idObj.indivisiblepath);
      }
    });
  });
};
