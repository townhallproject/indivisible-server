const AWS = require('aws-sdk');

const superagent = require('superagent');
const mapboxapi = 'https://api.mapbox.com/uploads/v1';

const uploadToMapbox = (url) => {
  const data = {
    tileset: `${process.env.MAPBOX_USERNAME}.groupdataset`,
    url: url,
    name: 'group-dataset',
  };
  return superagent
    .post(`${mapboxapi}/${process.env.MAPBOX_USERNAME}?access_token=${process.env.MAPBOX_ACCESS_TOKEN}`)
    .send(data)
    .then((res) => {
      console.log(res.body);
    })
    .catch(e => {
      console.log(e);
    });
};

// Upload the group data to Indivisible's S3
const uploadToIndivisible = (geoJSON) => {
  console.log("Uploading to IN s3");
  var inS3 = new AWS.S3({
    accessKeyId: process.env.IN_S3_KEY_ID,
    secretAccessKey: process.env.IN_S3_SECRET_KEY
  });
  inS3.putObject({
    Bucket: process.env.IN_S3_BUCKET,
    Key: process.env.IN_S3_KEY,
    Body: JSON.stringify(geoJSON)
  }, function(err) {
    console.log("Posted geo json to IN s3");
    console.log(err);
  });
};

module.exports = (geoJSON) => {
  return superagent
    .post(`${mapboxapi}/${process.env.MAPBOX_USERNAME}/credentials?access_token=${process.env.MAPBOX_ACCESS_TOKEN}`)
    .then(res => {
      const credentials = res.body;
      console.log(credentials);
      uploadToIndivisible(geoJSON);
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
