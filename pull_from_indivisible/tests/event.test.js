const moment = require('moment');
const mockGroup = require('./mock-event');
const IndEvent = require('../event');
const firebaseMock = jest.fn();

// IndEvent.removeOne = jest.fn();

describe('Event module', () => {
  describe('constructor', () => {
    test('issue focus will be set if exists', () => {
      let newEvent = new IndEvent(mockGroup);
      let expectedIssueFocus = mockGroup.fields[1].value;
      expect(newEvent.issueFocus).toEqual(expectedIssueFocus);
    });
    test('issue focus will Town Hall if it has a meeting type', () => {
      let mockTownHall = {
          ...mockGroup,
          fields: [
              {
                  name: 'meeting_type',
                  value: 'Other',
              }
          ]
      };
      let newEvent = new IndEvent(mockTownHall);
      let expectedIssueFocus = 'Town Hall';
      expect(newEvent.issueFocus).toEqual(expectedIssueFocus);
    });
    test('issue focus will 2020 Candidate Event if it has that set as meeting type', () => {
        let mockTownHall = {
            ...mockGroup,
            fields: [{
                name: 'meeting_type',
                value: '2020 Candidate Event',
            }]
        };
        let newEvent = new IndEvent(mockTownHall);
        let expectedIssueFocus = '2020 Candidate Event';
        expect(newEvent.issueFocus).toEqual(expectedIssueFocus);
    });
  });
  describe('writeToFirebase', () => {
    test('it wont write if date is in the past', () => {
      let newEvent = new IndEvent(mockGroup);
      const removeOneMock = jest.fn();
      newEvent.removeOne = removeOneMock;

      newEvent.writeToFirebase(firebaseMock);
      expect(removeOneMock.mock.calls[0][0]).toEqual('is in past');
    });
    test('it wont write host is not confirmed', () => {
      let newEvent = new IndEvent(mockGroup);
      newEvent.host_is_confirmed = false;
      newEvent.starts_at_utc = moment();
      const removeOneMock = jest.fn();
      newEvent.removeOne = removeOneMock;

      newEvent.writeToFirebase(firebaseMock);
      expect(removeOneMock.mock.calls[0][0]).toEqual('not not confirmed');
    });
    test('it wont write if status is not active', () => {
      let newEvent = new IndEvent(mockGroup);
      newEvent.starts_at_utc = moment();
      const removeOneMock = jest.fn();
      newEvent.removeOne = removeOneMock;

      newEvent.status = 'not active';

      newEvent.writeToFirebase(firebaseMock);
      expect(removeOneMock.mock.calls[0][0]).toEqual('not active');
    });
 
  });
});