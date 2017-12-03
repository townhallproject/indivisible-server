// settings for mailgun
const mailgun_api_key = process.env.MAILGUN_API_KEY2;
const domain = 'updates.townhallproject.com';
const mailgun = require('mailgun-js')({apiKey: mailgun_api_key, domain: domain});

function errorReport(error, subject, to) {
  this.from = 'Town Hall Updates <update@updates.townhallproject.com>';
  this.to = to || 'Megan Riel-Mehan <meganrm@townhallproject.com>';
  this.subject = subject || 'Something has gone terribly wrong';
  try {
    this.html = JSON.stringify(error);
  }
  catch (e) {
    this.html = error;
  }
}

errorReport.prototype.sendEmail = function(){
  var data = this;
  console.log('sending');
  mailgun.messages().send(data, function () {
  });
};

module.exports = errorReport;
