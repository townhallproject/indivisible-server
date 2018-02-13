const firebasedb = require('../lib/setup-firebase');
const moment = require('moment');

class Group {
  constructor(response) {
    for (var key in response) {
      if (response.hasOwnProperty(key)) {
        this[key] = response[key];
      }
    }
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
