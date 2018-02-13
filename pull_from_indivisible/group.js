const lodash = require('lodash');
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
    let newPostKey = this.id;
    updates[path + newPostKey] = this;
    return firebaseref.update(updates);
  }
}

module.exports = Group;
