const superagent = require('superagent');
const lodash = require('lodash');

const url = 'https://api.prosperworks.com';
const path = '/developer_api/v1/companies/search';
// const path = '/developer_api/v1/custom_field_definitions';
const Group = require('./group');

function requestData(url, pageNumber) {
  return superagent
    .post(url)
    .set('X-PW-AccessToken', process.env.GROUP_API_KEY)
    .set('X-PW-Application', 'developer_api')
    .set('X-PW-UserEmail', process.env.PW_USER_EMAIL)
    .set('Content-Type', 'application/json')
    .send({'page_size':200,
      'page_number': pageNumber,
      'sort_by': 'last_interaction',
      'sort_direction': 'desc'});
}


function getAllData(pageNumber){
  return requestData(url + path, pageNumber)
    .then((response) => {
      response.body.forEach((ele) => {
        const localGroupSubtype = lodash.find(ele.custom_fields, {custom_field_definition_id: 109116});
        if (localGroupSubtype.value !== 140251) {
          return;
        }
        let newGroup = new Group(ele);
        newGroup.writeToFirebase();
      });
      return pageNumber;
    })
    .then((pageNumber)=> {
      if (pageNumber < 60) {
        console.log(pageNumber++);
        return getAllData(pageNumber++);
      }
    });
}

module.exports = getAllData;
