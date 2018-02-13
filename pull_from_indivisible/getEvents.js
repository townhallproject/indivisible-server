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
        newEvent.writeToFirebase();
      });
      return response.body.meta;
    })
    .then((res) => {
      if (res.next) {
        console.log('next', res.next);
        return getAllData(res.next);
      }
      console.log('got all');
    })
    .catch(console.log);
}

module.exports = getAllData;
