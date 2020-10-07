#!/usr/bin/env node

const firebasedb = require('../lib/setup-indivisible-firebase');

const errorReport = require('../lib/error-reporting');
const eventModel = require('../pull_from_indivisible/event');
const getEvents = require('../pull_from_indivisible/getEvents');

const urlTemplate = (campaign) => `/rest/v1/event/?campaign=${campaign}`;

const campaigns = [15, 9, 21, 24, 27, 28, 38];
const urls = campaigns.map((number) => urlTemplate(number));
Promise.all(urls.map(url => getEvents(url) ))
  .then((returned) => {
    returned.forEach((ret) => {
      console.log(ret);
    });
    process.exit(0);
  }).catch((error) => {
    let newerrorEmail = new errorReport(error, 'Issue with getting events from indivisible}');
    return newerrorEmail.sendEmail();
  });

firebasedb.ref('indivisible_public_events/').on('child_added', (snapshot) => {
  var indEvent = new eventModel( snapshot.val());
  indEvent.checkDateAndRemove();
  indEvent.checkStatusAndRemove();
  indEvent.checkPublicAndRemove();
  indEvent.checkCampaignAndRemove();
});

