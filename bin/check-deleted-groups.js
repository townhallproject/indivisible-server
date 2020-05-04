#!/usr/bin/env node
const firebasedb = require('../lib/setup-indivisible-firebase');
const getOneGroup = require('../pull_from_indivisible/get-one-group');
const Group = require('../pull_from_indivisible/group');

const ref = firebasedb.ref('indivisible_groups');
ref.once('value')
  .then(snapshot => {
    let index = 0;
    const total = snapshot.numChildren();
    console.log('total', total);

    snapshot.forEach((res) => {
      let group = res.val();
      let groupId = group.id;
      index++;

      const requestOneGroupAndDeleteRemoved = (id) => {

        getOneGroup(id)
          .then((returned) => {
            if (returned === 'Not Found') {
              console.log('removing', id);
              Group.remove(id);
            } else if (!returned.id) {
              console.log(`Other server error when looking for group: ${index} ${returned}`);
            }
          });
      };
      setTimeout(() => requestOneGroupAndDeleteRemoved(groupId), index * 300);
    });
    setTimeout(() => {
      console.log('done');
      process.exit(0);
    }, (total + 1) * 300);
  });

