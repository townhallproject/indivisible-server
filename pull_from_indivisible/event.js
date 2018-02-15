const firebasedb = require('../lib/setup-firebase');
const moment = require('moment');

class IndEvent {
  constructor(response) {
    for (var key in response) {
      if (response.hasOwnProperty(key)) {
        this[key] = response[key];
      }
    }
    const eventType = response.fields.filter(obj => obj.name === 'event_type');
    const groupName = response.fields.filter(obj => obj.name === 'group_name');
    if (eventType.length > 0) {
      this.eventType = eventType[0].value;
    }
    if (groupName.length > 0) {
      this.groupName = groupName[0].value;
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
      console.log('removing', moment(this.starts_at_utc).format('MM/DD/YYYY'));
      const ref = firebasedb.ref(`indivisible_public_events/${this.id}`);
      return ref.remove();
    }
    console.log('in future', moment(this.starts_at_utc).format('MM/DD/YYYY'));
  }
}

module.exports = IndEvent;
