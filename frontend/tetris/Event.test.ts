import { Event } from "./Event";

describe('Event', () => {
  let event: Event;

  beforeEach(() => {
    event = new Event('test');
  });

  test('has a name', () => {
    expect(event.name).toEqual('test');
  });

  test('has no data by default', () => {
    expect(event.data).toEqual({});
  });

  describe('get data', () => {
    test('returns a copy of the data', () => {
      event.add({ a: 1 });
      expect(event.data).toEqual({ a: 1 });
    });
  });

  describe('add', () => {
    test('adds data to the event', () => {
      event.add({ a: 1 });
      expect(event.data).toEqual({ a: 1 });
    });

    test('overwrites existing data', () => {
      event.add({ a: 1 });
      event.add({ a: 2 });
      expect(event.data).toEqual({ a: 2 });
    });
  });

  describe('hasData', () => {
    test('returns true if the event has the given data', () => {
      event.add({ a: 1 });
      expect(event.hasData('a')).toEqual(true);
    });

    test('returns false if the event does not have the given data', () => {
      expect(event.hasData('a')).toEqual(false);
    });
  });
});
