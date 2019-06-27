const mockGroup = require('./mockGroup');
const Group = require('../group');

describe('group module', () => {
  describe('location has been changed', () => {
    test('if nothing has been changed returns false', () => {
      let groupInFirebase = new Group(mockGroup);
      let newGroup = new Group(mockGroup);
      let hasBeenChanged = newGroup.locationHasBeenChanged(groupInFirebase);
      expect(hasBeenChanged).toEqual(false);
    });
    test('if the city has changed returns true', () => {
      let groupInFirebase = new Group(mockGroup);
      let newGroup = new Group(mockGroup);
      newGroup.city = 'New City';
      let hasBeenChanged = newGroup.locationHasBeenChanged(groupInFirebase);
      expect(hasBeenChanged).toEqual(true);
    });

    test('if a value gets added that was not there returns true', () => {
      let groupInFirebase = new Group(mockGroup);
      groupInFirebase.zip = null;
      let newGroup = new Group(mockGroup);
      let hasBeenChanged = newGroup.locationHasBeenChanged(groupInFirebase);
      expect(hasBeenChanged).toEqual(true);
    });

    test('if a value gets deleted returns true', () => {
      let groupInFirebase = new Group(mockGroup);
      let newGroup = new Group(mockGroup);
      newGroup.zip = null;
      let hasBeenChanged = newGroup.locationHasBeenChanged(groupInFirebase);
      expect(hasBeenChanged).toEqual(true);
    });
  });
});