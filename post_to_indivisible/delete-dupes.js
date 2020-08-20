const IndTownHall = require('./townhall-model');
const firebasedb = require('../lib/setup-firebase');

const dupes = [{
  'thp_id': '-LlmLOLibWHQ5-bdaucO',
  'id_1': 145940,
  'id_2': 146162,
},
{
  'thp_id': '-LlmMPaGyMbfVU8GwdYI',
  'id_1': 145935,
  'id_2': 146168,
},
{
  'thp_id': '-Llsc7pH5L-tqRQfWkcn',
  'id_1': 145910,
  'id_2': 146228,
},
{
  'thp_id': '-LluomuJyWa7JVJT75n1',
  'id_1': 145858,
  'id_2': 146208,
},
{
  'thp_id': '-Llwt9XIMJftrY_DvqNy',
  'id_1': 145837,
  'id_2': 146154,
},
{
  'thp_id': '-LlwxqCyt1mHyz5Z2LNg',
  'id_1': 145832,
  'id_2': 146209,
},
{
  'thp_id': '-Llx-FtdzPRsU7x-x2Df',
  'id_1': 145843,
  'id_2': 146175,
},
{
  'thp_id': '-Llx-iaOvWETRyJo_8el',
  'id_1': 145845,
  'id_2': 146255,
},
{
  'thp_id': '-Llx0BiYe2FsygTxNe3v',
  'id_1': 145830,
  'id_2': 146310,
},
{
  'thp_id': '-Llx2OQzeoSMBe47WLSH',
  'id_1': 145855,
  'id_2': 146249,
},
{
  'thp_id': '-Llx5mmW_pEmq3usG4qm',
  'id_1': 145859,
  'id_2': 146161,
},
{
  'thp_id': '-LlxAAhMw_jjSVqjy0zd',
  'id_1': 145857,
  'id_2': 146270,
},
{
  'thp_id': '-LlxGBKzivGUeo3kiG7f',
  'id_1': 145856,
  'id_2': 146213,
},
{
  'thp_id': '-LlyI6q8tMqYhnNfcPfC',
  'id_1': 145902,
  'id_2': 146250,
},
{
  'thp_id': '-LlyJ1Z6bivG_GYPjqvn',
  'id_1': 145912,
  'id_2': 146187,
},
{
  'thp_id': '-Llyj2Vff_jtGCzuNThC',
  'id_1': 145968,
  'id_2': 146353,
},
{
  'thp_id': '-LlyJtm75YGAkyZIDaES',
  'id_1': 145922,
  'id_2': 146288,
},
{
  'thp_id': '-Lm-E_MCpEYFcuu7NY_u',
  'id_1': 145937,
  'id_2': 146257,
},
{
  'thp_id': '-Lm23NGbJWKHc3DezVo7',
  'id_1': 145906,
  'id_2': 146292,
},
{
  'thp_id': '-Lm5_7CG51P4G_TJys8k',
  'id_1': 145962,
  'id_2': 146179,
},
{
  'thp_id': '-Lm5_liWwEviNPZE2fUN',
  'id_1': 145944,
  'id_2': 146121,
},
{
  'thp_id': '-Lm5_SRhx9MGQQFpbrY1',
  'id_1': 145957,
  'id_2': 146242,
},
{
  'thp_id': '-Lm5asnwY9Be2__9_1sx',
  'id_1': 145949,
  'id_2': 146239,
},
{
  'thp_id': '-Lm5bbQ3KaXdh8Kp8mqp',
  'id_1': 145920,
  'id_2': 146215,
},
{
  'thp_id': '-Lm5cjXljK1Qo_pjm1gX',
  'id_1': 145909,
  'id_2': 146302,
},
{
  'thp_id': '-Lm5hxRSPO8QlsNOWNZ0',
  'id_1': 145908,
  'id_2': 146417,
},
{
  'thp_id': '-Lm5j05mjgdxBVHp-mTH',
  'id_1': 145933,
  'id_2': 146345,
},
{
  'thp_id': '-Lm5kPOt9BuxsQy6Q2YL',
  'id_1': 145916,
  'id_2': 146227,
},
{
  'thp_id': '-Lm5NWQnTlUsyEyeX_Pq',
  'id_1': 145936,
  'id_2': 146266,
},
{
  'thp_id': '-Lm5THTHwC6I44jtrUgp',
  'id_1': 145914,
  'id_2': 146152,
},
{
  'thp_id': '-Lm5XcdbrK0zlz6N9C-O',
  'id_1': 145938,
  'id_2': 146220,
},
{
  'thp_id': '-Lm5Y8VcNLaJq8hi8MDn',
  'id_1': 145970,
  'id_2': 146357,
},
{
  'thp_id': '-Lm5zbUFLASiptU5XQlF',
  'id_1': 145965,
  'id_2': 146216,
},
{
  'thp_id': '-Lm5ZjjbttKzn9DrPHNg',
  'id_1': 145921,
  'id_2': 146219,
},
{
  'thp_id': '-Lm60EW3U1gmvRV4vp4F',
  'id_1': 145973,
  'id_2': 146276,
},
{
  'thp_id': '-Lm61E0kPdnH8AO2GSMf',
  'id_1': 145950,
  'id_2': 146254,
},
{
  'thp_id': '-Lm61viFgX1mbYcDz0td',
  'id_1': 145939,
  'id_2': 146301,
},
{
  'thp_id': '-Lm69ySICKvuieh-zJ9i',
  'id_1': 145945,
  'id_2': 146286,
},
{
  'thp_id': '-Lm6j1C4PZJjxc-gt_ZW',
  'id_1': 145984,
  'id_2': 146198,
},
{
  'thp_id': '-Lm6Lw-O_G_xCDFYC2KI',
  'id_1': 145982,
  'id_2': 146222,
},
{
  'thp_id': '-Lm6ODXJhh5V_SQvB57-',
  'id_1': 145961,
  'id_2': 146320,
},
{
  'thp_id': '-Lm6WwFLIhuHhPQdE2U3',
  'id_1': 145931,
  'id_2': 146236,
},
{
  'thp_id': '-Lm70s84tPIDMne6ZJhR',
  'id_1': 145993,
  'id_2': 146240,
},
{
  'thp_id': '-Lm7HqXX9q3h0R30Bzoe',
  'id_1': 146028,
  'id_2': 146290,
},
{
  'thp_id': '-Lm7jAM1nrVaxFJ68KG-',
  'id_1': 145929,
  'id_2': 146354,
},
{
  'thp_id': '-Lm7m0J_9jDPL1bjJulX',
  'id_1': 145958,
  'id_2': 146364,
},
{
  'thp_id': '-Lm7mpha_vHBa9fpAoE4',
  'id_1': 146017,
  'id_2': 146367,
},
{
  'thp_id': '-Lm7mYfIHz1hrXFIg9wA',
  'id_1': 146033,
  'id_2': 146408,
},
{
  'thp_id': '-Lm7n75wxbZrw_YA1tKD',
  'id_1': 146022,
  'id_2': 146289,
},
{
  'thp_id': '-Lm7qKkTReH15xHIMYtj',
  'id_1': 146015,
  'id_2': 146333,
},
{
  'thp_id': '-Lm7r3jGM6ZEFbId5oua',
  'id_1': 145988,
  'id_2': 146332,
},
{
  'thp_id': '-LmAyJKK8qRsGQWYwhqv',
  'id_1': 146061,
  'id_2': 146324,
},
{
  'thp_id': '-LmBaUzHQmeVnM6S2DlW',
  'id_1': 146064,
  'id_2': 146351,
},
{
  'thp_id': '-LmBjnu0FKVA3bXSWqxs',
  'id_1': 146073,
  'id_2': 146212,
},
{
  'thp_id': '-LmBM8AvRcYcm2TwTBts',
  'id_1': 146060,
  'id_2': 146426,
},
{
  'thp_id': '-LmBMLLvf0Cdu4MXAduL',
  'id_1': 146065,
  'id_2': 146327,
},
{
  'thp_id': '-LmBMm5HSM8h3_iG_I_S',
  'id_1': 146067,
  'id_2': 146414,
},
{
  'thp_id': '-LmBMxq0DERNtmVKma70',
  'id_1': 146078,
  'id_2': 146370,
},
{
  'thp_id': '-LmBMYkiDBiLscvpOVvH',
  'id_1': 146066,
  'id_2': 146355,
},
{
  'thp_id': '-LmBq4OwAHtNp0Lqyf0F',
  'id_1': 146063,
  'id_2': 146433,
},
{
  'thp_id': '-LmBYpBnKzwdQy3PbJYB',
  'id_1': 146077,
  'id_2': 146307,
},
{
  'thp_id': '-LmBZFvTYQ9OAAb06FNt',
  'id_1': 146069,
  'id_2': 146318,
},
{
  'thp_id': '-LmCZgKH8efxmihqnN3E',
  'id_1': 146058,
  'id_2': 146287,
},
{
  'thp_id': '-LmEHbn0yRxox6WXUBnw',
  'id_1': 146070,
  'id_2': 146356,
},
{
  'thp_id': '-LmF8-O5_0dAx5QA6flF',
  'id_1': 146059,
  'id_2': 146305,
},
{
  'thp_id': '-LmFDEtbhO7QqEFCgSD2',
  'id_1': 146075,
  'id_2': 146319,
},
{
  'thp_id': '-LmFFe6rctvfSCRQJ6ac',
  'id_1': 146083,
  'id_2': 146284,
},
{
  'thp_id': '-LmFzH7nm3gkGj8p-hu4',
  'id_1': 146068,
  'id_2': 146427,
},
{
  'thp_id': '-LmG-oiCelHxKBBJD2qZ',
  'id_1': 146071,
  'id_2': 146325,
},
];

dupes.forEach(ele => {
  const toKeep = ele.id_1;
  const toDelete = ele.id_2;
  IndTownHall.cancelEvent(`/rest/v1/event/${toDelete}/`)
    .then(() => {
      firebasedb.ref(`townHallIds/${ele.thp_id}`).update({
        indivisiblepath: `/rest/v1/event/${toKeep}/`,
      }).catch(console.log);
      firebasedb.ref(`townHalls/${ele.thp_id}`).update({
        indivisiblepath: `/rest/v1/event/${toKeep}/`,
      }).catch(console.log);
    }).catch(console.log);
});