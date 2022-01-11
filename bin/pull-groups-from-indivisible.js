#!/usr/bin/env node
const getGroups = require('../pull_from_indivisible/getGroups');

// Uncomment if you want to use the THP group sync again.
// getGroups(1);

// firebasedb.ref('indivisible_groups').once('value').then(snapshot => {
//   snapshot.forEach(res => {
//     let group = res.val();
//     let zip = group.zip;
//     let id = group.id;
//     if ( !group.longitude ){
//       setTimeout(function () {
//         groupModel.updateLatLng(group.city, group.state, group.id);
//       }, 1000);
//     }
//   });
// });
