const lodash = require('lodash');
const superagent = require('superagent');
const thpFirebaseDb = require('../lib/setup-firebase');
const firebasedb = require('../lib/setup-indivisible-firebase');
/*
if custom field id 109116 (Local Group Subtype)
has a value of 140251, display on map

if custom field 109096 has a value get the email
*/

const GROUP_STATUS_OPTIONS = [{
  'id': 140251,
  'name': 'Public (displayed in map)',
  'rank': 0,
}, {
  'id': 140250,
  'name': 'New (Needs Processing)',
  'rank': 4,
}, {
  'id': 140252,
  'name': 'Private (not on map)',
  'rank': 1,
}, {
  'id': 140254,
  'name': 'National',
  'rank': 5,
}, {
  'id': 140766,
  'name': 'Not following principles',
  'rank': 3,
}, {
  'id': 140764,
  'name': 'International',
  'rank': 6,
}, {
  'id': 141434,
  'name': 'Inactive',
  'rank': 2,
}, {
  'id': 678403,
  'name': 'Verified (displayed on map)',
  'rank': 7,
}];

class Group {
  static formatUrl(url) {
    if (!/(^https:\/\/)|(^http:\/\/)/.test(url)) {
      return `https://${url}`;
    }
    return url;
  }

  static remove(id) {
    const ref = firebasedb.ref(`indivisible_groups/${id}`);
    ref.remove();
  }



  constructor(res) {
    const email = lodash.find(res.custom_fields, {custom_field_definition_id: 109096});
    const facebook = lodash.find(res.socials, { category: 'facebook' });
    const twitter = lodash.find(res.socials, { category: 'twitter' });
    const groupStatus = lodash.find(res.custom_fields, {
      custom_field_definition_id: 109116,
    });
    this.active = groupStatus.value === 678403;
    const groupStatusName = lodash.find(GROUP_STATUS_OPTIONS, {
      id: groupStatus.value,
    });
    this.status = groupStatusName ? groupStatusName.name : '';

    this.facebook = facebook ? facebook.url: null;
    this.twitter = twitter ? twitter.url: null;
    this.email = email ? email.value : null;
    this.zip = res.address ? res.address.postal_code: null;
    this.city = res.address ? res.address.city: null;
    this.state = res.address ? res.address.state: null;
    this.country = res.address ? res.address.country: null;
    this.name = res.name;
    this.id = res.id;
    this.url = res.websites.length > 0 ? Group.formatUrl(res.websites[0].url) : null;
    this.details = res.details || null;
    this.socials = lodash.filter(res.socials, 'category') || null;
    this.interaction_count = res.interaction_count;
    this.tags = res.tags;
  }

  writeToFirebase() {
    let emailpath = 'indivisible_group_emails/';
    let newPostKey = this.id;
    let groupCopy = Object.assign({}, this);
    if (this.email) {
      firebasedb.ref(emailpath).update({[newPostKey]: this.email});
      groupCopy.email = true;
    }
    firebasedb.ref(`indivisible_groups/${newPostKey}`)
      .update(groupCopy);
  }

  dataHasBeenChanged(groupInFirebase) {
    let toCheck = ['socials', 'url', 'email'];
    let changed = false;
    
    toCheck.forEach((ele) => {
      if (!groupInFirebase[ele] && this[ele] && this[ele].length > 0) {
        console.log('values added', ele, this.id, this[ele]);
        changed = true;
      } else if (
        this[ele] && groupInFirebase[ele] && !lodash.isEqual(this[ele], groupInFirebase[ele])) {
        console.log('values updated', ele, this.id, this[ele], groupInFirebase[ele]);
        changed = true;
      } else if (groupInFirebase[ele] && (!this[ele] || this[ele].length === 0 )) {
        console.log('values deleted', ele, this.id);
        this[ele] = null;
        changed = true;
      }
    });
    return changed;
  }

  locationHasBeenChanged(groupInFirebase){
    let toCheck = ['city', 'state', 'zip', 'name'];
    let changed = false;
    toCheck.forEach((ele) => {
      if (!groupInFirebase[ele] && this[ele]) {
        console.log('values added', ele, this.id);
        changed = true;
      } else if (
        ele === 'zip' && 
        groupInFirebase[ele] && 
        Group.zeroPaddZip(this[ele]) !== Group.zeroPaddZip(groupInFirebase[ele])) {
        console.log('zip updated', ele, this.id, Group.zeroPaddZip(this[ele]), Group.zeroPaddZip(groupInFirebase[ele]));
        changed = true;
      } else if (ele !== 'zip' &&
        this[ele] && groupInFirebase[ele] && this[ele] !== groupInFirebase[ele]) {
        console.log('values updated', ele, this.id, this[ele], groupInFirebase[ele]);
        changed = true;
      } else if (groupInFirebase[ele] && !this[ele]){
        console.log('values deleted', ele, this.id);
        changed = true;
      }
    });
    return changed;
  }

  getLatLng(){
    let zip = this.zip ? this.zip.toString() : this.zip;
    if (zip && zip.length < 5) {
      zip = '00000'.slice(0, 5 - zip.length) + zip;
    }
    let group = this;
    this.zip = zip;
    if (zip && zip.length === 5) {
      return thpFirebaseDb.ref('zips/'+ zip).once('value')
        .then(latlog=> {
          if (latlog.exists()) {
            this.longitude = latlog.val().LNG;
            this.latitude = latlog.val().LAT;
            return this;
          }
          return group.updateLatLng();
        }).catch(err=> {
          console.log('error getting lat lng from firebase', err);
        });
    } else if (this.state) {
      return group.updateLatLng();
    }
    return Promise.reject('no address');
  }

  updateLatLng(){
    let address;
    if(this.city && this.state && this.zip && this.zip.toString().length === 5) {
      address = `${this.city},+${this.state},+${this.zip}`;
    } else if (this.city && this.state) {
      address = `${this.city},+${this.state}`;
    } else if (this.state) {
      address = `${this.state}`;
    } else {
      return Promise.reject('no address');
    }
    address = address.replace(/\s/g, '+');
    let group = this;
    return superagent
      .get(`https://maps.googleapis.com/maps/api/geocode/json?key=${process.env.GEOCODING_KEY}`)
      .query({ 'address': escape(address) })
      .then((r) => {
        const response = r.body;
        if (response.results.length > 0 && response.results[0].geometry.location.lat) {
          group.latitude = response.results[0].geometry.location.lat;
          group.longitude = response.results[0].geometry.location.lng;
          return group;
        } else {
          return Promise.reject(response);
        }
      })
      .catch(e => {
        console.log('geocode error:', e, address, group);
        group.address_failed = true;
        group.writeToFirebase();
      });
  }

  static zeroPaddZip(zip) {
    if (!zip) {
      return null;
    }
    let padding = '00000';
    let toBePadded = zip.toString();
    return padding.slice(0, padding.length - toBePadded.length) + toBePadded;
  }

  static getAllLatLng() {
    firebasedb.ref('indivisible_groups').once('value').then(snapshot => {
      snapshot.forEach(group => {
        let zip = group.val().zip;
        let id = group.val().id;
        if(zip){
          return firebasedb.ref('zips/'+ zip).once('value').then(latlog => {
            if (latlog.exists()){
              let updateObj = {};
              updateObj.longitude = latlog.val().LNG;
              updateObj.latitude = latlog.val().LAT;
              return firebasedb.ref('indivisible_groups/' + id).update(updateObj);
            }
          }).catch(()=> {
            console.log('error getting all lat lng');
          });
        }
      });
    });
  }
}

module.exports = Group;
