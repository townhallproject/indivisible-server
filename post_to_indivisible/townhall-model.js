const moment = require('moment');
const request = require('superagent');

const firebasedb = require('../lib/setup-firebase');
const errorReport = require('../lib/error-reporting');

class IndTownHall {
  constructor(cur) {
    let address,
      zip,
      city;
    if (cur.issueFocus) {
      for (let key in cur) {
        this[key] = cur[key];
      }
      return; 
    }
    if (cur.address) {
      let addList = cur.address.split(', ');
      if (addList[addList.length - 1] === 'United States') {
        addList.splice(addList.length - 1);
      }
      zip = addList[addList.length - 1].split(' ')[1] || '';
      city = addList[addList.length - 2] || '';
      addList.splice(addList.length - 2, 2);
      address = addList.join(', ');
    }
    this.event_title;
    let prefix;
    let district;
    if (cur.flagIcon === 'campaign'){
      prefix = '';
    } else if (cur.district && !cur.thp_id) {
      prefix = 'Rep.';
      district = `${cur.state}-${Number(cur.district)}`;
    } else {
      prefix = 'Sen.';
      district = 'Senate';
    }
    if (cur.iconFlag === 'staff') {
      this.event_title = 'Staff Office Hours: ' + cur.Member + ' (' + district + ')';
    } else if (cur.meetingType === 'Other') {
      this.event_title = prefix + ' ' + cur.Member + ' (' + district + ') ';
    } else {
      this.event_title = prefix + ' ' + cur.Member + ' (' + district + ') ' + cur.meetingType;
    }

    this.event_starts_at_date = moment(cur.dateObj).format('L');
    this.event_starts_at_time = cur.Time.split(' ')[0];
    this.event_starts_at_ampm = cur.Time.split(' ')[1].toLowerCase();
    this.event_venue = this.getVenue(cur);
    this.event_address1 = address || '';
    this.event_host_ground_rules = '1';
    this.event_host_requirements = '1';
    this.event_city = city;
    this.event_postal = zip;
    this.email = 'field@indivisibleguide.com';
    this.name = 'MoC';
    this.event_public_description = cur.eventName ? cur.eventName : cur.Notes;
    this.event_public_description = this.event_public_description ? this.event_public_description: this.event_title;
    this.action_meeting_type = cur.meetingType;

    if (cur.link) {
      this.action_link_to_event_information = cur.link;
    } else {
      this.action_link_to_event_information = 'https://townhallproject.com/?eventId=' + cur.eventId;
    }
    this.page = 'register-event-recess_townhalls';
    this.campaign = '/rest/v1/campaign/9/';
  }

  displayDistrict(cur){
    if (cur.district) {
      return `${cur.state}-${cur.district}`;
    }
    return 'Senate';
  }

  getVenue(cur){
    if (cur.Location) {
      return cur.Location;
    }
    return 'Address below:';
  }

  submitEvent(eventID) {
    let townHall = this;
    const user = process.env.ACTION_KIT_USERNAME;
    const password = process.env.ACTION_KIT_PASS;
    const url = 'https://act.indivisibleguide.com/rest/v1/action/';
    return request
      .post(url)
      .auth(user, password)
      .send(townHall)
      .then(res => {
        let path = res.body.event;
        firebasedb.ref(`townHallIds/${eventID}`).update({indivisiblepath : path});
        firebasedb.ref(`townHalls/${eventID}`).update({indivisiblepath : path});
        return path;
      })
      .then(path => {
        const url = `https://act.indivisibleguide.com${path}`;
        console.log(url);
        return request
          .put(url)
          .auth(user, password)
          .send({
            is_approved: 'true',
            host_is_confirmed: 'true',
          });
      })
      .catch(err => {
        console.log('er', err.error, eventID);
        let newerrorEmail = new errorReport(err, `Issue with posting to indivisible: ${eventID}`);
        return newerrorEmail.sendEmail();
      });
  }

  updateEvent(eventID, path){
    let townHall = this;
    const user = process.env.ACTION_KIT_USERNAME;
    const password = process.env.ACTION_KIT_PASS;
    // ex '/rest/v1/event/8328/'
    const url = `https://act.indivisibleguide.com${path}`;
    return request
      .put(url)
      .auth(user, password)
      .send({
        address1: townHall.event_address1,
        city: townHall.event_city,
        title: townHall.event_title,
        venue: townHall.event_venue,
        public_description: townHall.event_public_description,
        zip: townHall.event_postal,
        is_approved: 'true',
        host_is_confirmed: 'true',
      })
      .then(res=> {
        console.log('res', res.body);
      })
      .catch(err=> {
        console.log(err, path);
      });
  }
  
  cancelEvent(path) {
    const user = process.env.ACTION_KIT_USERNAME;
    const password = process.env.ACTION_KIT_PASS;
    // ex '/rest/v1/event/8328/'
    const url = `https://act.indivisibleguide.com${path}`;
    console.log(url);
    return request
      .put(url)
      .auth(user, password)
      .send({
        status: 'cancelled',
      })
      .then(res => {
        console.log('cancelled', res.body);
      })
      .catch(err => {
        console.log(err, path);
      });
  }
}

module.exports = IndTownHall;
