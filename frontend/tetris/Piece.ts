import Coord from './Coord';
import Move from './Move';
import Position from './Position';
import { Shape } from './Shape';
import TetrisState from './TetrisState';
import ZMod from './ZMod';

export default class Piece {
  static copy(other: Piece): Piece {
    const copy = new Piece(other.position.location, other.shape);
    copy._position = Position.copy(other.position);
    copy._isActive = other.isActive;
    copy._blockCoords = other.blockCoords;
    return copy;
  }

  private _position: Position;
  private _blockCoords: Coord[];
  private _shape: Shape;
  private _isActive: boolean;

  /**
   * Creates a new piece with the given location and shape.
   *
   * @param location The location of the piece.
   * @param shape The shape of the piece.
   */
  constructor(location: Coord, shape: Shape) {
    this._shape = shape;
    this._position = new Position(location, 0, shape.numRotations);
    this._isActive = true;
    this._blockCoords = Array(4).fill(null).map(() => new Coord(0, 0));
    this._updateBlockCoords();
  }

  /**
   * Resets the piece to the given location and shape.
   *
   * @param location The location to reset the piece to.
   * @param shape The shape to reset the piece to.
   */
  reset(location: { row: number, col: number }, shape: Shape): void {
    this._shape = shape;
    this._position = new Position(location, 0, shape.numRotations);
    this._isActive = true;
    this._updateBlockCoords();
  }

  /**
   * Returns the shape of the piece.
   */
  get shape(): Shape {
    return this._shape;
  }

  /**
   * Sets the shape of the piece and updates the block coordinates.
   *
   * @param shape The new shape of the piece.
   * @return The new shape of the piece.
   */
  set shape(shape: Shape) {
    this._shape = shape;
    this._updateBlockCoords();
  }

  /**
   * Returns the position of the piece.
   */
  get position(): Position {
    return Position.copy(this._position);
  }

  /**
   * Sets the position of the piece and updates the block coordinates.
   *
   * @param position The new position of the piece.
   * @return The new position of the piece.
   */
  set position(newPosition: Position) {
    // Validate newPosition must have the same max rotation as the current position
    if (newPosition.maxRotation !== this._position.maxRotation) {
      throw new Error(`Invalid position: max rotation must be ${this._position.maxRotation}`);
    }

    this._position = Position.copy(newPosition);
    this._updateBlockCoords();
  }

  shapeShift(shape: Shape): void {
    this._shape = shape;
    // TODO using current position may result in invalid position once shape is changed
    this._position = new Position(this._position.offset, 0, shape.numRotations);
    this._updateBlockCoords();
  }

  /**
   * Returns whether or not the piece is active.
   */
  get isActive() {
    return this._isActive;
  }

  /**
   * Sets the piece as inactive.
   */
  disable(): void {
    this._isActive = false;
  }

  /**
   * Sets the piece as active.
   */
  enable(): void {
    this._isActive = true;
  }

  /**
   * Returns a copy of the block coordinates of the piece.
   */
  get blockCoords(): Coord[] {
    return Coord.copyAll(this._blockCoords);
  }

  /**
   * Moves the piece by the given offset and rotation, then updates the block coordinates.
   * Legality of the move is not checked.
   *
   * @param move The move to apply to the piece position.
   */
  move(move: Move): void {
    this._position.add(move);
    this._updateBlockCoords();
  }

  /**
   * Returns whether or not the piece intersects with any blocks on the given state.
   *
   * @param state The state to check for intersections.
   * @return Whether or not the piece intersects with any blocks on the given state.
   */
  intersects(state: TetrisState): boolean {
    return this._blockCoords.some(coord => !state.isCellEmpty(coord));
  }

  /**
   * Executes the given consumer for each block (row, column) coordinates of the piece.
   *
   * @param consumer The consumer to execute for each block (row, column) coordinates of the piece.
   */
  forEachCell(consumer: ((coord: Coord) => void)): void {
    this.blockCoords.forEach(consumer);
  }

  /**
   * Updates the block coordinates based on the current position and shape.
   * This method is called automatically when the position or shape is changed.
   */
  private _updateBlockCoords(): void {
    const rotationIndex = ZMod.apply(this._position.rotation, this._shape.numRotations);

    for (let i = 0; i < this._blockCoords.length; i++) {
      this._blockCoords[i].reset(this._position.offset);
      this._blockCoords[i].add(this._shape.getRotation(rotationIndex)[i]);
    }
  }
}
