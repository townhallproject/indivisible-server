const lodash = require('lodash');
const superagent = require('superagent');
const firebasedb = require('../lib/setup-firebase');
/*
if custom field id 109116 (Local Group Subtype)
has a value of 140251, display on map

if custom field 109096 has a value get the email
*/
class Group {
  constructor(res) {
    const email = lodash.find(res.custom_fields, {custom_field_definition_id: 109096});
    this.email = email ? email.value : null;
    this.zip = res.address ? res.address.postal_code: null;
    this.city = res.address ? res.address.city: null;
    this.state = res.address ? res.address.state: null;
    this.country = res.address ? res.address.country: null;
    this.name = res.name;
    this.id = res.id;
    this.url = res.websites.url || null;
    this.details = res.details || null;
    this.socials = res.socials || null;
    this.interaction_count = res.interaction_count;
    this.tags = res.tags;
  }

  writeToFirebase(mockref) {
    let updates = {};
    let firebaseref = mockref || firebasedb.ref();
    let path = `indivisible_groups/`;
    let emailpath = 'indivisible_group_emails/';
    let newPostKey = this.id;
    if (this.email) {
      updates[emailpath + newPostKey] = this.email;
      this.email = true;
    }
    updates[path + newPostKey] = this;
    return firebaseref.update(updates);
  }

  static getLatLng(){
    firebasedb.ref('indivisible_groups').once('value').then(snapshot => {
      snapshot.forEach(group=> {
        let zip = group.val().zip;
        let id = group.val().id;
        if(zip){
          firebasedb.ref('zips/'+ zip).once('value').then(latlog=>{
            if (latlog.exists()){
              let updateObj = {};
              updateObj.longitude = latlog.val().LNG;
              updateObj.latitude = latlog.val().LAT;
              firebasedb.ref('indivisible_groups/' + id).update(updateObj);
            }
          });
        }
      });
    });
  }

  static updateLatLng(city, state, id){
    let address;
    if (city && state) {
      address = `${city},${state}`;
    } else if (state) {
      address = `${state}`;
    }
    return superagent
      .get('https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyB868a1cMyPOQyzKoUrzbw894xeoUhx9MM')
      .query({ 'address': address })
      .then((r) => {
        const response = r.body;
        if (response.results.length > 0 && response.results[0].geometry.location.lat) {
          const latitude = response.results[0].geometry.location.lat;
          const longitude = response.results[0].geometry.location.lng;
          let path = `indivisible_groups/${id}`;
          return firebasedb.ref(path).update({latitude, longitude});
        } else {
          console.log(response, city, state, id);
        }

      })
      .catch(e => {
        console.log(e.message, address, id);
      });
  }
}

module.exports = Group;
