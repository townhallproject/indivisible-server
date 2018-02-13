const firebasedb = require('../lib/setup-firebase');

const eventModel = require('../pull_from_indivisible/event');
const getEvents = require('../pull_from_indivisible/getEvents');
let path = '/rest/v1/event/?name=recess-townhall';

getEvents(path);

firebasedb.ref('indivisible_public_events/').on('child_added', (snapshot) => {
  var indEvent = new eventModel( snapshot.val());
  indEvent.checkDateAndRemove();
});
