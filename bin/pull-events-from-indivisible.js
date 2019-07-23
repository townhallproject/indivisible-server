#!/usr/bin/env node

const firebasedb = require('../lib/setup-indivisible-firebase');

const eventModel = require('../pull_from_indivisible/event');
const getEvents = require('../pull_from_indivisible/getEvents');

let localEventsPath = '/rest/v1/event/?_offset=1820&_limit=20&campaign=15';
getEvents(localEventsPath);

// let townHallPath = '/rest/v1/event/?campaign=9';
// getEvents(townHallPath);

// let scotusActionsPath = '/rest/v1/event/?campaign=21';
// getEvents(scotusActionsPath);

// let indivisible2020 = '/rest/v1/event/?campaign=24';
// getEvents(indivisible2020);

firebasedb.ref('indivisible_public_events/').on('child_added', (snapshot) => {
  var indEvent = new eventModel( snapshot.val());
  indEvent.checkDateAndRemove();
  indEvent.checkStatusAndRemove();
  indEvent.checkPublicAndRemove();
  indEvent.checkCampaignAndRemove();
});

