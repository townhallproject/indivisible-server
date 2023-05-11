#!/usr/bin/env node

const firebasedb = require('../lib/setup-indivisible-firebase');

const errorReport = require('../lib/error-reporting');
const eventModel = require('../pull_from_indivisible/event');
const getEvents = require('../pull_from_indivisible/getEvents');

const firebaseKey = require('../lib/firebase-key/firebaseKey');

const urlTemplate = (campaign) => {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const dateString = twoDaysAgo.toISOString().substring(0, 10);

    return `/rest/v1/event/?campaign=${campaign}&starts_at__gt=${dateString}`;
};

const campaigns = [15, 9, 21, 24, 27, 28, 38, 19];
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

firebasedb.ref(`${firebaseKey}/`).on('child_added', (snapshot) => {
  var indEvent = new eventModel( snapshot.val());
  indEvent.checkDateAndRemove();
  indEvent.checkStatusAndRemove();
  indEvent.checkPublicAndRemove();
});

