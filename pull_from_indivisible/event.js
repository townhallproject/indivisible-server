const firebasedb = require('../lib/setup-firebase');
const moment = require('moment');

class IndEvent {
  constructor(response) {
    for (var key in response) {
      if (response.hasOwnProperty(key)) {
        this[key] = response[key];
      }
    }
  }

  writeToFirebase(mockref) {
    if (!moment(this.starts_at_utc).isAfter()) {
      return;
    }
    let updates = {};
    let firebaseref = mockref || firebasedb.ref();
    let path = `indivisible_public_events/`;
    let newPostKey = this.id;
    updates[path + newPostKey] = this;
    return firebaseref.update(updates);
  }
}

module.exports = IndEvent;
