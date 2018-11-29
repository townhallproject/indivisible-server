const superagent = require('superagent');
const lodash = require('lodash');
const firebasedb = require('../lib/setup-indivisible-firebase');
const url = 'https://api.prosperworks.com';
const path = '/developer_api/v1/companies/search';
// const path = '/developer_api/v1/custom_field_definitions';
const testing = process.env.NODE_ENV !== 'production';

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
      if (!response.body.length){
        console.log('end');
        return 0;
      }
      response.body.forEach((ele) => {
        const localGroupSubtype = lodash.find(ele.custom_fields, {custom_field_definition_id: 109116});
        let newGroup = new Group(ele);
        if (localGroupSubtype.value === 140251) {
          firebasedb.ref('indivisible_groups/' + newGroup.id).once('value')
            .then(groupInFirebase => {
              if (groupInFirebase.exists() &&
              groupInFirebase.val().longitude &&
              groupInFirebase.val().latitude &&
              !newGroup.hasBeenChanged(groupInFirebase.val())) {
                // still need to add to tileset
                newGroup.longitude = groupInFirebase.val().longitude;
                newGroup.latitude = groupInFirebase.val().latitude;
                allGroups.push(newGroup);
                newGroup.writeToFirebase();
              } else {
                newGroup.getLatLng()
                  .then(() => {
                    console.log('got lat lng');
                    allGroups.push(newGroup);
                    newGroup.writeToFirebase();
                  })
                  .catch((e) => {
                    console.log('no lat lng for group:', e);
                    count.noaddress ++;
                  });
              }
            });
        } else {
          let ref = firebasedb.ref(`indivisible_groups/${newGroup.id}`);
          ref.once('value')
            .then((snapshot) => {
              if (snapshot.exists()) {
                console.log('removing not public');
                ref.remove();
              }
            });
          count.notPublic ++;
        }
      });
      return pageNumber;
    })
    .then((pageNumber) => {
      if (pageNumber) {
        if (testing) {
          console.log('next group', pageNumber++);
        }
        return getAllData(pageNumber++);
      }
      else {
        console.log('got all groups', allGroups.length, count.notPublic);
        if (!testing) {
          const geoJSON = makeGeoJSON(allGroups);
          uploadToS3(geoJSON);
        }
      }
    })
    .catch(e => {
      console.log(e);
    });
}

module.exports = getAllData;
