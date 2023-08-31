import { Event, EventListener } from './Event';

/**
 * An EventBus contains a registry of event listeners that can be invoked by throwing events.
 */
export default class EventBus {
  private _listeners: { [eventName: string]: EventListener[] };

  /**
   * Creates a new EventBus with no listeners.
   */
  constructor() {
    this._listeners = {};
  }

  /**
   * Returns true if the event has listeners for the given event name.
   *
   * @param name The event name to check.
   * @returns True if the event has listeners for the given event name; false otherwise.
   */
  hasListeners(name: string): boolean {
    return name in this._listeners && this._listeners[name].length > 0;
  }

  /**
   * Registers an event listener for the given event name.
   *
   * @param name The event name to listen for.
   * @param listener The event listener to register.
   * @returns True if the event listener was registered; false otherwise.
   */
  registerEventListener(name: string, listener: EventListener): boolean {
    if (name in this._listeners) {
      this._listeners[name].push(listener);
    } else {
      this._listeners[name] = [listener];
    }

    return true;
  }

  /**
   * Unregisters an event listener for the given event name.
   *
   * @param name The event name to unregister.
   * @param listener The event listener to unregister.
   * @returns True if the event listener was unregistered; false otherwise.
   */
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

  /**
   * Unregisters all event listeners for the given event name.
   *
   * @param name The event name to unregister.
   * @returns True if any event listeners were unregistered; false otherwise.
   */
  unregisterAllEventListeners(name: string): boolean {
    if (name in this._listeners) {
      if (this._listeners[name].length > 0) {
        this._listeners[name] = [];
        return true;
      }
    }

    return false;
  }

  /**
   * Throws the given event to all listeners.
   *
   * @param event The event to throw.
   */
  throwEvent(event: Event): void {
    if (event.name in this._listeners) {
      this._listeners[event.name].forEach(listener => listener(event));
    }
  }
}
