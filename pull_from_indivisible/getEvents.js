const superagent = require('superagent');
const moment = require('moment');
const url = 'https://indivisible.actionkit.com';

const IndEvent = require('./event');

function requestData(url) {
  return superagent
    .get(url)
    .auth(process.env.ACTION_KIT_USERNAME, process.env.ACTION_KIT_PASS);
}


function getAllData(path) {
  const recurringEvents = {};
  return requestData(url + path)
    .then((response) => {
      response.body.objects.forEach((ele) => {
        let newEvent = new IndEvent(ele);
        if (!newEvent.issueFocus) {
          return;
        }
        if (newEvent.isRecurring) {
          if (!recurringEvents[newEvent.mobilizeId]) {
            recurringEvents[newEvent.mobilizeId] = {
              id: newEvent.id,
              starts_at: newEvent.starts_at,
            };
          } else {
            let currentSoonest = recurringEvents[newEvent.mobilizeId];
            if (moment(newEvent.starts_at).isBefore(currentSoonest.starts_at)) {
              recurringEvents[newEvent.mobilizeId] = {
                id: newEvent.id,
                starts_at: newEvent.starts_at,
              };
              let toRemove = new IndEvent(currentSoonest);
              toRemove.removeOne('found earlier recurring event');
            } else {
              return newEvent.removeOne('recurring');
            }
          }
        }
        if (newEvent.creator !== '/rest/v1/user/393393/') {
          //get group name
          requestData(url + newEvent.creator)
            .then(response => {
              if (response.body.fields && response.body.fields.group_name) {
                newEvent.group_name = response.body.fields.group_name;
              }
              return newEvent.writeToFirebase();
            })
            .catch(e => {
              console.log(e.message);
            });
        } else {
          newEvent.writeToFirebase();
        }
      });
      return response.body.meta;
    })
    .then((res) => {
      if (res.next) {
        console.log('next', res.next);
        return getAllData(res.next);
      }
      return console.log('got all events');
    })
    .catch(console.log);
}

module.exports = getAllData;
