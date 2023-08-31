/**
 * EventData is a map of string keys to any values.
 */
export type EventData = {
  [key: string]: any;
};

/**
 * An EventListener is a function that consumes an Event.
 */
export type EventListener = <E extends Event>(event: E) => void;

/**
 * An Event is a named object that may contain data to be consumed by listeners.
 */
export class Event {
  readonly name: string;
  protected _data: EventData;

  /**
   * Creates a new Event with the given name and optional data.
   */
  constructor(name: string, data: EventData = {}) {
    this.name = name;
    this._data = data;
  }

  /**
   * Returns a shallow copy of the event's data.
   */
  get data(): any {
    return Object.assign({}, this._data);
  }

  /**
   * Adds the given data to the event.
   *
   * @param data The data to add.
   * @returns This Event.
   */
  add(data: EventData): Event {
    Object.assign(this._data, data);
    return this;
  }

  /**
   * Returns true if the event has the given data key.
   *
   * @param key The data key to check.
   * @returns True if the event has the given data key; false otherwise.
   */
  hasData(key: string): boolean {
    return this._data.hasOwnProperty(key);
  }
}
