const superagent = require('superagent');
const moment = require('moment');
const url = 'https://indivisible.actionkit.com';
const testing = process.env.NODE_ENV !== 'production';
const IndEvent = require('./event');

function requestData(url) {
  return superagent
    .get(url)
    .auth(process.env.ACTION_KIT_USERNAME, process.env.ACTION_KIT_PASS);
}

function getAllData(path) {
  return requestData(url + path)
    .then((response) => {
      response.body.objects.forEach((ele) => {
        let newEvent = new IndEvent(ele);
        if (!newEvent.issueFocus) {
          return;
        }
        if (newEvent.everyactionId) {
          if (moment(newEvent.starts_at).isAfter(moment().add(3, 'month'))) {
            return newEvent.removeOne('too far in future');
          }
        }

        if (newEvent.isRecurring) {
          if (moment(newEvent.starts_at).isAfter(moment().add(3, 'month'))) {
            return newEvent.removeOne('too far in future');
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
            .catch(() => {
              console.log('request group name error', url, newEvent.creator, newEvent.id);
              return newEvent.writeToFirebase();  
              
            });
        } else {
          newEvent.writeToFirebase();
        }
      });
      //outside forEach loop
      return response.body.meta;
    })
    .then((res) => {
      if (res.next) {
        if (testing) {
          console.log('next', res.next);
        }
        return getAllData(res.next);
      }
      return console.log('got all events');
    })
    .catch((err) => console.log('getAllData error', path, err));
}

module.exports = getAllData;
