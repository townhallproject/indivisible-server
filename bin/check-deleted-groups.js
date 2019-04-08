#!/usr/bin/env node
const firebasedb = require('../lib/setup-indivisible-firebase');
const getOneGroup = require('../pull_from_indivisible/get-one-group');
const Group = require('../pull_from_indivisible/group');
const startingGroup = 12029911;
const endingGroup = 31611321 - 5297;
const startPoint = Math.floor(Math.random() * (endingGroup - startingGroup + 1) + startingGroup);

firebasedb.ref('indivisible_groups').orderByKey().startAt(`${startPoint}`).limitToFirst(5297).once('value').then(snapshot => {
  let index = 0;
  console.log(startPoint);
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
          } else if (!returned.id) {
            console.log(`${index} ${returned}`);
          }
        });
    };
    setTimeout(requestOneGroupAndDeleteRemoved, index * 300);
 
  });
});
