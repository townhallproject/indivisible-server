const moment = require('moment');
const lodash = require('lodash');

const firebasedb = require('../lib/setup-indivisible-firebase');
const errorReport = require('../lib/error-reporting');

class IndEvent {
  constructor(response) {
    for (var key in response) {
      if (response.hasOwnProperty(key)) {
        this[key] = response[key];
      }
    }
    const issueFocus = response.fields? response.fields.filter(obj => obj.name === 'event_issue_focus'): null;
    const townHallMeetingType = IndEvent.upPackField(response.fields, 'meeting_type');
    this.linkToInfo = IndEvent.upPackField(response.fields , 'link_to_event_information');
    this.displayAltLink = IndEvent.upPackField(response.fields, 'display_alt_link') ? true: false;
    this.campaignNo = this.campaign ? this.campaign.split('/').splice(-2, 1)[0]: null;
    this.isVirtualEvent = IndEvent.upPackField(response.fields , 'is_virtual_event');
    this.eventType = IndEvent.upPackField(response.fields, 'event_type');
    this.actionMeetingType = IndEvent.upPackField(response.fields, 'meeting_type');
    this.actionGroupName = IndEvent.upPackField(response.fields, 'group_name') !== 'No promoter equipped with this actionkit config.' ? IndEvent.upPackField(response.fields, 'group_name'): null;
    this.actionHostName = IndEvent.upPackField(response.fields, 'host_name');
    this.isRecurring = IndEvent.upPackField(response.fields, 'is_recurring');
    this.mobilizeId = IndEvent.upPackField(response.fields, 'mobilize_id');
    this.everyactionId = IndEvent.upPackField(response.fields, 'everyaction_eventid');
    //Do not show venue if venue = “Unnamed venue” or if venue = "Private venue"
    this.venue = this.venue === 'Unnamed venue' || this.venue === '"Private venue' ? null: this.venue;
    if (issueFocus && issueFocus.length > 0) {
      this.issueFocus = issueFocus[0].value;
    } else if (townHallMeetingType && townHallMeetingType.length > 0) {
      this.issueFocus = townHallMeetingType === '2020 Candidate Event' ? townHallMeetingType : 'Town Hall';
    } else {
      this.issueFocus = false;
    }
  }

  static upPackField(fields, fieldName) {
    const result = lodash.filter(fields, {
      name: fieldName,
    });
    return result.length > 0 ? result[0].value : null;
  }

  writeToFirebase(mockref) {
    if (this.id == 144865) {
      console.log('got it', 144865)
    }
    if (moment(this.starts_at_utc).isBefore(moment(), 'day')) {
      this.removeOne('is in past');
      return;
    }
    if (!this.host_is_confirmed){
      this.removeOne('not not confirmed');
      return;
    }
    if (this.status !== 'active') {
      this.removeOne('not active');
      return;
    }
    if (this.is_private) {
      this.removeOne('is private');
      return;
    }
    if (this.postal == '20301' || this.postal === '00840') {
      this.removeOne('zip', this.postal);
      return;
    }
    if (this.address1 === 'This event is virtual, Washington, DC 20301'){
      this.removeOne('virtual');
      return;
    }
    if (this.isVirtualEvent === 'Yes') {
      this.removeOne('virtual');
      return;
    }
    if (this.id == 144865) {
      console.log('writing it', 144865)
    }
    let updates = {};
    let firebaseref = mockref || firebasedb.ref();
    let path = `indivisible_public_events/`;
    let newPostKey = this.id;
    updates[path + newPostKey] = this;
    return firebaseref.update(updates)
      .catch((err) => {
        console.log('cant write event');
        let newErrorEmail = new errorReport(err, `Issue with pulling from indivisible: ${JSON.stringify(this)}`);
        return newErrorEmail.sendEmail();
      });
  }

  removeOne(reason){
    const ref = firebasedb.ref(`indivisible_public_events/${this.id}`);
    return ref.once('value', (snapshot) => {
      if (snapshot.exists()) {
        console.log('removing', this.id, reason);
        ref.set(null);
        return ref.remove();
      }
    });
  }

  checkDateAndRemove() {
    if (moment(this.starts_at_utc).isBefore(moment(), 'day')) {
      const ref = firebasedb.ref(`indivisible_public_events/${this.id}`);
      ref.set(null);
      console.log('removing old', this.id)

      return ref.remove();
    }
  }

  checkStatusAndRemove() {
    if (this.status !== 'active') {
      const ref = firebasedb.ref(`indivisible_public_events/${this.id}`);
      ref.set(null);
      return ref.remove();
    }
  }

  checkPublicAndRemove() {
    if (this.is_private) {
      const ref = firebasedb.ref(`indivisible_public_events/${this.id}`);
      ref.set(null);
      return ref.remove();
    }
  }

  checkCampaignAndRemove() {
    if (this.campaignNo === '19') {
      console.log('ma campaign', this.id);
      const ref = firebasedb.ref(`indivisible_public_events/${this.id}`);
      ref.set(null);
      return ref.remove();
    }
  }

  checkPostalAndRemove() {
    if (this.postal === '20301' || this.postal === '00840') {
      const ref = firebasedb.ref(`indivisible_public_events/${this.id}`);
      ref.set(null);
      return ref.remove();
    }
  }
}

module.exports = IndEvent;
