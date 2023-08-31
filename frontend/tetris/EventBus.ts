import { Event, EventListener } from './Event';

export default class EventBus {
  private _listeners: { [eventName: string]: EventListener[] };

  constructor() {
    this._listeners = {};
  }

  registerEventListener(name: string, listener: EventListener): boolean {
    if (name in this._listeners) {
      this._listeners[name].push(listener);
    } else {
      this._listeners[name] = [listener];
    }

    return true;
  }

  unregisterEventListener(name: string, listener: EventListener): boolean {
    if (name in this._listeners) {
      const index = this._listeners[name].indexOf(listener);
      if (index >= 0) {
        this._listeners[name].splice(index, 1);
        return true;
      }
    }

    return false;
  }

  unregisterAllEventListeners(name: string): boolean {
    if (name in this._listeners) {
      this._listeners[name] = [];
      return true;
    }

    return false;
  }

  throwEvent(event: Event): void {
    if (event.name in this._listeners) {
      this._listeners[event.name].forEach(listener => listener(event));
    }
  }
}
