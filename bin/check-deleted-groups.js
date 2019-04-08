#!/usr/bin/env node
const firebasedb = require('../lib/setup-indivisible-firebase');
const getOneGroup = require('../pull_from_indivisible/get-one-group');
const Group = require('../pull_from_indivisible/group');

firebasedb.ref('indivisible_groups').once('value').then(snapshot => {
  let index = 0;
  snapshot.forEach((res) => {
    let group = res.val();
    let id = group.id;
    index++;
    const requestOneGroupAndDeleteRemoved = () => {
      getOneGroup(id)
        .then((returned) => {
          if (returned === 'Not Found') {
            console.log('removing', id);
            Group.remove();
          } else {
            console.log(returned.id || returned);
          }
        });
    };
    setTimeout(requestOneGroupAndDeleteRemoved, index * 300);
 
  });
});
