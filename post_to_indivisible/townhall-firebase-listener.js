const moment = require('moment');

const firebasedb = require('../lib/setup-firebase');
const IndTownHall = require('./townhall-model');

function prepTownHall(townhall) {
  if ((!townhall.repeatingEvent) && (townhall.meetingType !== 'Tele-Town Hall') && (moment(townhall.dateObj).isAfter()) && (townhall.meetingType !=='Tele-town Hall')) {
    let newTownHall = new IndTownHall(townhall);
    if (newTownHall.event_address1 ) {
      console.log('adding', townhall.meetingType, townhall.eventId);
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
        console.log('already added', idObj);
      }
    });
  });
};
