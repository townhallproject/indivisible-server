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

  checkDateAndRemove() {
    if (!moment(this.starts_at_utc).isAfter()) {
      console.log('removing', this.id);
      const ref = firebasedb.ref(`indivisible_public_events/${this.id}`);
      return ref.remove();
    }
    console.log('in future', this.starts_at);
  }
}

module.exports = IndEvent;
