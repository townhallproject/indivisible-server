#!/usr/bin/env node

const firebasedb = require('../lib/setup-firebase');

const eventModel = require('../pull_from_indivisible/event');
const getEvents = require('../pull_from_indivisible/getEvents');

let path = '/rest/v1/event/?name=recess-townhall';
getEvents(path);

firebasedb.ref('indivisible_public_events/').on('child_added', (snapshot) => {
  var indEvent = new eventModel( snapshot.val());
  indEvent.checkDateAndRemove();
});

// firebasedb.ref('indivisible_groups').once('value').then(snapshot => {
//   snapshot.forEach(res => {
//     let group = res.val();
//     let zip = group.zip;
//     let id = group.id;
//     if ( !group.longitude ){
//       setTimeout(function () {
//         groupModel.updateLatLng(group.city, group.state, group.id);
//       }, 1000);
//     }
//   });
// });
