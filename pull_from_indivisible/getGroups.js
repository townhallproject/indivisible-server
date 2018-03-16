const superagent = require('superagent');
const lodash = require('lodash');

const url = 'https://api.prosperworks.com';
const path = '/developer_api/v1/companies/search';
// const path = '/developer_api/v1/custom_field_definitions';
const Group = require('./group');
const makeGeoJSON = require('./point');
const uploadToS3 = require('./mapboxUpload');

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

const allGroups = [];

function getAllData(pageNumber){
  return requestData(url + path, pageNumber)
    .then((response) => {
      console.log('got response');
      response.body.forEach((ele) => {
        const localGroupSubtype = lodash.find(ele.custom_fields, {custom_field_definition_id: 109116});
        if (localGroupSubtype.value === 140251) {
          let newGroup = new Group(ele);
          newGroup.writeToFirebase();
          newGroup.getLatLng();
          allGroups.push(newGroup);
        }
      });
      return pageNumber;
    })
    .then((pageNumber)=> {
      console.log('return page number', pageNumber);
      if (pageNumber < 42) {
        console.log(pageNumber++);
        return getAllData(pageNumber++);
      }
      else {
        console.log('got all of them');
        const geoJSON = makeGeoJSON(allGroups);
        uploadToS3(geoJSON);
      }
    })
    .catch(e => {
      console.log(e);
    });
}

module.exports = getAllData;
