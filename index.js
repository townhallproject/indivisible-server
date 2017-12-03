'use strict';
const server = require('./lib/server.js');
const express = require('express');
const PORT = process.env.PORT || 3000;
const app = express();
const database = require('./postToInd/townHallListener');

server.start(app, PORT)
  .then(console.log)
  .then(database)
  .catch(console.log);
