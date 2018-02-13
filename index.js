'use strict';
const server = require('./lib/server.js');
const express = require('express');
const PORT = process.env.PORT || 9000;
const app = express();
const database = require('./post_to_indivisible/townhall-firebase-listener');

app.get('*', function(request, response) {
  console.log('New request:', request.url);
  response.sendFile('index.html', { root: '.' });
});

server.start(app, PORT)
  .then(console.log)
  .then(database)
  .catch(console.log);
