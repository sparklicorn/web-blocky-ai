import IEventRegistrar from "../event/IEventRegistrar";
import TetrisState from "./TetrisState";

/**
 * An interface for interacting with a game of Tetris.
 */
export default interface ITetrisGame extends IEventRegistrar {
  /**
   * Sets up a new unstarted game.
   */
  newGame(): void;

  /**
   * Starts the game.
   *
   * @param level The level to start at.
   * @param useGravity Whether to use gravity to soft drop pieces.
   */
  start(level: number, useGravity: boolean): void;

  /**
   * Stops the game.
   */
  stop(): void;

  /**
   * Pauses the game.
   */
  pause(): void;

  /**
   * Resumes the game.
   */
  resume(): void;

  /**
   * Moves the current piece left.
   *
   * @returns Whether the move was successful.
   */
  moveLeft(): boolean;

  /**
   * Moves the current piece right.
   *
   * @returns Whether the move was successful.
   */
  moveRight(): boolean;

  /**
   * Moves the current piece down.
   *
   * @returns Whether the move was successful.
   */
  moveDown(): boolean;

  /**
   * Rotates the current piece clockwise.
   *
   * @returns Whether the rotation was successful.
   */
  rotateClockwise(): boolean;

  /**
   * Rotates the current piece counter-clockwise.
   *
   * @returns Whether the rotation was successful.
   */
  rotateCounterClockwise(): boolean;

  /**
   * Gets the current state of the game.
   *
   * @returns The current state of the game.
   */
  getState(): TetrisState;
};
