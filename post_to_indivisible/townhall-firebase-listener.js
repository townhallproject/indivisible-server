const moment = require('moment');

const firebasedb = require('../lib/setup-firebase');
const IndTownHall = require('./townhall-model');
const errorReport = require('../lib/error-reporting');

const production = process.env.NODE_ENV === 'production';

function prepTownHall(townhall) {
  if ((!townhall.repeatingEvent) && 
    (townhall.meetingType !== 'Tele-Town Hall') && 
    (moment(townhall.dateObj).isAfter()) && 
    (townhall.meetingType !=='Tele-town Hall') && 
    townhall.iconFlag !== 'staff' && 
    townhall.meetingType !== 'Office Hours') {
    let newTownHall = new IndTownHall(townhall);
    if (newTownHall.event_address1 && newTownHall.event_postal) {
      return newTownHall;
    }
    console.log('no address info', newTownHall.action_thp_id);
    let newerrorEmail = new errorReport(`No zipcode or address: ${newTownHall.action_thp_id}`, `error posting: ${newTownHall.action_thp_id}`);
    newerrorEmail.sendEmail();
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
        if (newTownHall && production) {
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
      let changedTownHall = prepTownHall(townhall);
      if (changedTownHall && production) {
        console.log('updating copy in indiv database', changedTownHall.event_title);
        changedTownHall.updateEvent(townhall.eventId, idObj.indivisiblepath);

        // checking that the event fields are in sync. 
        // Shouldn't be needed now that they are being correctly set on initial write. 
        changedTownHall.getEventField(idObj.indivisiblepath, 'meeting_type')
          .then((field) => {
            if (field && field.value !== changedTownHall.action_meeting_type) {
              console.log('updating meeting type field', field.value, field.resource_uri, changedTownHall.action_meeting_type);
              changedTownHall.updateEventField(field.resource_uri, 'action_meeting_type');
            }
          });
        changedTownHall.getEventField(idObj.indivisiblepath, 'event_issue_focus')
          .then((field) => {
            const fieldApiName = 'action_event_issue_focus';
            if (field && field.value !== changedTownHall[fieldApiName]) {
              console.log('updating issue focus field', field.value, field.resource_uri, changedTownHall[fieldApiName]);
              changedTownHall.updateEventField(field.resource_uri, fieldApiName);
            }
          });
      }
    });
  });
};
