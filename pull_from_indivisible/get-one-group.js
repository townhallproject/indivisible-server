const superagent = require('superagent');

const baseUrl = 'https://api.prosperworks.com';
const path = '/developer_api/v1/companies/';


function requestData(url) {
  return superagent
    .get(url)
    .set('X-PW-AccessToken', process.env.GROUP_API_KEY)
    .set('X-PW-Application', 'developer_api')
    .set('X-PW-UserEmail', process.env.PW_USER_EMAIL)
    .set('Content-Type', 'application/json');
}

function getOneGroup(id) {
  return requestData(baseUrl + path + id)
    .then((response) => {
      return response.body;
  
    })
    .catch(e => {
      if (e.message === 'getaddrinfo ENOTFOUND api.prosperworks.com api.prosperworks.com:443' || e.message === 'Not Found') {
        return 'Not Found';
      }
      return e.message;
    });
}

module.exports = getOneGroup;
