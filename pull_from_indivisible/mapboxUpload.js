const AWS = require('aws-sdk');

const superagent = require('superagent');
const mapboxapi = 'https://api.mapbox.com/uploads/v1';

const uploadToMapbox = (url) => {
  const data = {
    tileset: `${process.env.MAPBOX_USERNAME}.groupdataset`,
    url: url,
    name: 'group-dataset',
  };
  console.log(url);
  superagent
    .post(`${mapboxapi}/${process.env.MAPBOX_USERNAME}?access_token=${process.env.MAPBOX_ACCESS_TOKEN}`)
    .send(data)
    .then((res) => {
      console.log(res.body);
    })
    .catch(e => {
      console.log(e);
    });
};

module.exports = (geoJSON) => {
  superagent
    .post(`${mapboxapi}/${process.env.MAPBOX_USERNAME}/credentials?access_token=${process.env.MAPBOX_ACCESS_TOKEN}`)
    .then(res => {
      const credentials = res.body;
      console.log(credentials);
      // Use aws-sdk to stage the file on Amazon S3
      var s3 = new AWS.S3({
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
        sessionToken: credentials.sessionToken,
        region: 'us-east-1',
      });
      s3.putObject({
        Bucket: credentials.bucket,
        Key: credentials.key,
        Body: JSON.stringify(geoJSON),
      }, function(err) {
        if (err) {
          return console.log('error: ', err);
        }
        uploadToMapbox(credentials.url);
      });
    });
};
