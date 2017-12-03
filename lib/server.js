'use strict';

require('dotenv').config();

let server = null;

module.exports = {
  start: (app, port) => {
    let usePort = port || 3000;
    return new Promise( (resolve, reject) => {
      if (!server || !server.listening){
        server = app.listen(usePort , err => {
          if(err){
            reject(err);
          } else {
            resolve(`Server up on Port: ${usePort}`);
          }
        });

      } else {
        reject('Server is already running');
      }
    });
  },
  stop: () => {
    return new Promise( (resolve, reject) => {
      if(!server.listening){
        reject(console.log('Server is not running'));
      } else {

        server.close(err => {
          if(err){
            reject(err);
          } else {
            resolve('Server off');
          }
        });
      }
    });
  },
};
