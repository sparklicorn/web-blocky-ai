import { Event } from "./Event";
import IEventRegistrar from "./IEventRegistrar";

export default interface IEventBussy extends IEventRegistrar {
  /**
   * Throws the given event to all registered listeners.
   *
   * @param event The event to throw.
   */
  throwEvent(event: Event): void;
};
