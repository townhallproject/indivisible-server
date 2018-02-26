const moment = require('moment');
const lodash = require('lodash');
const firebasedb = require('../lib/setup-firebase');

class IndEvent {
  constructor(response) {
    for (var key in response) {
      if (response.hasOwnProperty(key)) {
        this[key] = response[key];
      }
    }
    const eventType = response.fields.filter(obj => obj.name === 'event_type');
    const issueFocus = response.fields.filter(obj => obj.name === 'event_issue_focus');
    const townHall = lodash.filter(response.fields, { name: 'meeting_type' });
    if (eventType.length > 0) {
      this.eventType = eventType[0].value;
    }
    if (issueFocus.length > 0) {
      this.issueFocus = issueFocus[0].value;
    } else if (townHall.length > 0) {
      this.issueFocus = 'Town Hall';
    } else {
      this.issueFocus = false;
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
      const ref = firebasedb.ref(`indivisible_public_events/${this.id}`);
      return ref.remove();
    }
  }
}

module.exports = IndEvent;
