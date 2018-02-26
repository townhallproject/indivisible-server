const superagent = require('superagent');
const url = 'https://indivisible.actionkit.com';

const IndEvent = require('./event');

function requestData(url) {
  return superagent
    .get(url)
    .auth(process.env.ACTION_KIT_USERNAME, process.env.ACTION_KIT_PASS);
}


function getAllData(path){
  return requestData(url + path)
    .then((response) => {
      response.body.objects.forEach((ele) => {
        let newEvent = new IndEvent(ele);
        if (!newEvent.issueFocus) {
          return;
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
      return console.log('got all');
    })
    .catch(console.log);
}

module.exports = getAllData;
