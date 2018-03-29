const superagent = require('superagent');
const lodash = require('lodash');
const firebasedb = require('../lib/setup-indivisible-firebase');
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
      'sort_by': 'date_modified',
      'sort_direction': 'desc'});
}

const allGroups = [];
const count = {
  noaddress: 0,
  notPublic: 0,
};

function getAllData(pageNumber){
  return requestData(url + path, pageNumber)
    .then((response) => {
      response.body.forEach((ele) => {
        const localGroupSubtype = lodash.find(ele.custom_fields, {custom_field_definition_id: 109116});
        if (localGroupSubtype.value === 140251) {
          let newGroup = new Group(ele);
          firebasedb.ref('indivisible_groups/' + newGroup.id).once('value')
            .then(group => {
              if (!group.val().latitude) {

                newGroup.getLatLng()
                  .then(() => {
                    newGroup.writeToFirebase();
                    allGroups.push(newGroup);
                  })
                  .catch((e) => {
                    console.log('returned error:', e);
                    count.noaddress ++;
                  });
              } else {
                console.log('already got latitude');
              }
            });
        } else {
          count.notPublic ++;
        }
      });
      return pageNumber;
    })
    .then((pageNumber)=> {
      if (pageNumber < 43) {
        console.log(pageNumber++);
        return getAllData(pageNumber++);
      }
      else {
        console.log('got all of them', allGroups.length, count.noadress, count.notPublic);
        const geoJSON = makeGeoJSON(allGroups);
        uploadToS3(geoJSON);
      }
    })
    .catch(e => {
      console.log(e);
    });
}

module.exports = getAllData;
