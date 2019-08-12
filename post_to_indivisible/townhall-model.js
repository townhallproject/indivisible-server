const moment = require('moment');
const request = require('superagent');
const find = require('lodash').find;

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
    if (cur.flagIcon === 'campaign' || cur.meetingType === 'Campaign Town Hall') {
      prefix = '';
    } else if (cur.district && !cur.thp_id) {
      prefix = 'Rep.';
      district = `${cur.state}-${Number(cur.district)}`;
    } else if (cur.chamber === 'upper') {
      prefix = 'Sen.';
      district = 'Senate';
    } else {
      prefix = '';
    }
    if (district) {
      if (cur.iconFlag === 'staff') {
        this.event_title = 'Staff Office Hours: ' + cur.Member + ' (' + district + ')';
      } else if (cur.meetingType === 'Other') {
        this.event_title = prefix + ' ' + cur.Member + ' (' + district + ') ';
      } else {
        this.event_title = prefix + ' ' + cur.Member + ' (' + district + ') ' + cur.meetingType;
      }
    } else {
      if (cur.iconFlag === 'staff') {
        this.event_title = 'Staff Office Hours: ' + cur.Member;
      } else if (cur.meetingType === 'Other') {
        this.event_title = prefix + ' ' + cur.Member;
      } else {
        this.event_title = prefix + ' ' + cur.Member + ' ' + cur.meetingType;
      }
    }

    this.event_starts_at_date = moment(cur.dateString, 'ddd, MMMM D YYYY').format('L');
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
    this.campaign = '/rest/v1/campaign/9/';
    this.page = 'register-event-recess_townhalls';
    this.event_public_description = cur.eventName ? cur.eventName : cur.Notes;
    this.action_thp_id = cur.eventId;
    this.event_public_description = this.event_public_description ? this.event_public_description: this.event_title;
    if (cur.iconFlag === 'campaign' && cur.chamber === 'nationwide') {
      this.action_meeting_type = '2020 Candidate Event';
      this.action_event_issue_focus = '2020 Candidate Event';
      this.campaign = '/rest/v1/campaign/28/';
      this.page = 'register-event-2020-candidate-events';
    } else {
      this.action_town_hall_in_person = cur.iconFlag === 'in-person';
      this.action_meeting_type = cur.meetingType;
      this.action_event_issue_focus = 'Town Hall';
    }
    if (cur.link) {
      this.action_link_to_event_information = cur.link;
    } else {
      this.action_link_to_event_information = 'https://townhallproject.com/?eventId=' + cur.eventId;
    }
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
        console.log('posted', path);
        firebasedb.ref(`townHallIds/${eventID}`).update({ indivisiblepath : path });
        firebasedb.ref(`townHalls/${eventID}`).update({ indivisiblepath : path });
        return path;
      })
      .then(path => {
        const url = `https://act.indivisibleguide.com${path}`;
        console.log('updating is approved and host', url);
        return request
          .put(url)
          .auth(user, password)
          .send({
            is_approved: 'true',
            host_is_confirmed: 'true',
          });
      })
      .catch(err => {
        console.log('error posting to indivisible', err.response.error.text, eventID);
        let newerrorEmail = new errorReport(err, `Issue with posting to indivisible: ${eventID}`);
        return newerrorEmail.sendEmail();
      });
  }

  getEventField(path, fieldName) {
    const user = process.env.ACTION_KIT_USERNAME;
    const password = process.env.ACTION_KIT_PASS;
    // ex '/rest/v1/event/8328/'
    const url = `https://act.indivisibleguide.com${path}`;
    return request
      .get(url)
      .auth(user, password)
      .then((res) => {
        const response = res.body;
        return response.fields.length ? find(response.fields, {name: fieldName}) : null;

      })
      .catch(err => {
        console.log(err, path);
      });
  }

  updateEventField(path, valueToChange) {
    const townHall = this;
    const user = process.env.ACTION_KIT_USERNAME;
    const password = process.env.ACTION_KIT_PASS;
    // ex '/rest/v1/event/8328/'
    const url = `https://act.indivisibleguide.com${path}`;
    return request
      .put(url)
      .auth(user, password)
      .send({
        value: townHall[valueToChange],
      })
      .then(() => {
        console.log('updated field successful');
      })
      .catch(err => {
        console.log(err, path);
      });
  }

  updateEvent(eventID, path){
    let townHall = this;
    const user = process.env.ACTION_KIT_USERNAME;
    const password = process.env.ACTION_KIT_PASS;
    const time = moment(`${townHall.event_starts_at_time} ${townHall.event_starts_at_ampm}`, 'H:mm a').format('kk:mm:ss');
    console.log('moment', time, 'original', `${townHall.event_starts_at_time} ${townHall.event_starts_at_ampm}`);
    // ex '/rest/v1/event/8328/'
    const url = `https://act.indivisibleguide.com${path}`;
    return request
      .put(url)
      .auth(user, password)
      .send({
        address1: townHall.event_address1,
        starts_at: `${townHall.event_starts_at_date} ${time}`,
        city: townHall.event_city,
        title: townHall.event_title,
        venue: townHall.event_venue,
        public_description: townHall.event_public_description,
        zip: townHall.event_postal,
        is_approved: 'true',
        host_is_confirmed: 'true',
      })
      .then(()=> {
        console.log('updated successful');
      })
      .catch(err=> {
        console.log(err, path);
      });
  }
}

IndTownHall.cancelEvent = (path) => {
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
};

module.exports = IndTownHall;
