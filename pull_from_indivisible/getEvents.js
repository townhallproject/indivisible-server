const superagent = require('superagent');
const moment = require('moment');
const url = 'https://indivisible.actionkit.com';
const testing = process.env.NODE_ENV !== 'production';
const IndEvent = require('./event');
const staging = !!process.env.STAGING_DATABASE;

function requestData(url) {
  return superagent
    .get(url)
    .auth(process.env.ACTION_KIT_USERNAME, process.env.ACTION_KIT_PASS);
}

function getAllData(path) {
  console.log('Getting data from ' + path);
  return requestData(url + path)
    .then((response) => {
      response.body.objects.forEach((ele) => {
        let newEvent = new IndEvent(ele);
        console.log('Processing event ', newEvent.id);
        if (!newEvent.issueFocus) {
          if (staging) {
            console.log('No issue focus', newEvent.id);
          }
          return;
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
      return Promise.resolve({
        message: 'got all events',
        previous: res.previous,
        total: res.total_count,
      });
    })
    .catch((err) => console.log('getAllData error', path, err));
}

module.exports = getAllData;
