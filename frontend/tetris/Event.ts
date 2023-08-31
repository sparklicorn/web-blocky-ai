export type EventData = {
  [key: string]: any;
};

/**
 * An EventListener is a function that takes a subclass of Event  as its only argument.
 */
export type EventListener = <E extends Event>(event: E) => void;

export class Event {
  readonly name: string;
  protected _data: EventData;

  constructor(name: string, data: EventData = {}) {
    this.name = name;
    this._data = data;
  }

  get data(): any {
    return Object.assign({}, this._data);
  }

  add(data: EventData): Event {
    Object.assign(this._data, data);
    return this;
  }

  hasData(key: string): boolean {
    return this._data.hasOwnProperty(key);
  }
}
