const moment = require('moment');
const request = require('request');

const firebasedb = require('../lib/setup-firebase');
const errorReport = require('../lib/error-reporting');

class IndTownHall {
  constructor(cur) {
    let address,
      zip,
      city;
    if (cur.address) {
      let addList = cur.address.split(', ');
      if (addList[addList.length - 1] === 'United States') {
        addList.splice(addList.length - 1);
      }
      zip = addList[addList.length - 1].split(' ')[1];
      city = addList[addList.length - 2];
      addList.splice(addList.length - 2, 2);
      address = addList.join(', ');
    }
    this.event_title;
    let prefix;

    if (cur.District === 'Senate') {
      prefix = 'Sen.';
    } else {
      prefix = 'Rep.';
    }
    if (cur.iconFlag === 'staff') {
      this.event_title = 'Staff Office Hours: ' + cur.Member + ' (' + cur.District + ')';
    } else if (cur.meetingType === 'Other') {
      this.event_title = prefix + ' ' + cur.Member + ' (' + cur.District + ') ';
    } else {
      this.event_title = prefix + ' ' + cur.Member + ' (' + cur.District + ') ' + cur.meetingType;
    }

    this.event_starts_at_date = moment(cur.dateObj).format('L');
    this.event_starts_at_time = cur.Time.split(' ')[0];
    this.event_starts_at_ampm = cur.Time.split(' ')[1].toLowerCase();
    this.event_venue = cur.Location ? cur.Location: ' ';
    this.event_address1 = address;
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

  submitEvent(eventID) {
    let townHall = this;
    const user = process.env.ACTION_KIT_USERNAME;
    const password = process.env.ACTION_KIT_PASS;
    const url = 'https://act.indivisibleguide.com/rest/v1/action/';
    request.post(
      url,
      {
        json: townHall,
        auth:
        {
          'user' : user,
          'pass' : password,
        },
      },
      function (error, response, body) {
        if (error || response.statusCode >= 400) {
          let newerrorEmail = new errorReport(response.body, `Issue with posting to indivisible: ${eventID}`);
          return newerrorEmail.sendEmail();
        }
        if (!error && response.statusCode == 201) {
          let path = body['event'].toString();
          firebasedb.ref(`townHallIds/${eventID}`).update({indivisiblepath : path});
          firebasedb.ref(`townHalls/${eventID}`).update({indivisiblepath : path});
        }
      });
  }

}

module.exports = IndTownHall;
