#!/usr/bin/env node

const firebasedb = require('../lib/setup-firebase');

const eventModel = require('../pull_from_indivisible/event');
const getEvents = require('../pull_from_indivisible/getEvents');

const getGroups = require('../pull_from_indivisible/getGroups');
let localEventsPath = '/rest/v1/event/?campaign=15';
getEvents(localEventsPath);

let townHallPath = '/rest/v1/event/?campaign=9';
getEvents(townHallPath);

firebasedb.ref('indivisible_public_events/').on('child_added', (snapshot) => {
  var indEvent = new eventModel( snapshot.val());
  indEvent.checkDateAndRemove();
});

getGroups(1);

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
