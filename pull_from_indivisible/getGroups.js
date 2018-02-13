const superagent = require('superagent');
const url = 'https://api.prosperworks.com';
const path = '/developer_api/v1/companies/search';
const Group = require('./group');

function requestData(url) {
  return superagent
    .post(url)
    .set('X-PW-AccessToken', process.env.GROUP_API_KEY)
    .set('X-PW-Application', 'developer_api')
    .set('X-PW-UserEmail', process.env.PW_USER_EMAIL)
    .set('Content-Type', 'application/json')
    .send({   'page_size':200,
      'sort_by': 'date_modified',
      'sort_direction': 'desc'});
}


function getAllData(){
  return requestData(url + path)
    .then((response) => {
      response.body.forEach((ele) => {
        let newGroup = new Group(ele);
        console.log(newGroup);
        return newGroup.writeToFirebase();
      });
    })
  return response.body.meta;

  .then((res) => {
    if (res.next) {
      console.log('next', res.next);
      return getAllData(res.next);
    }
    console.log('got all groups');
  })
    .catch(console.log);
}

module.exports = getAllData;
