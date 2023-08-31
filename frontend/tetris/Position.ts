import Coord from './Coord';
import Move from './Move';

export default class Position extends Move {
  static readonly ERR_FROZEN: string = 'Cannot modify frozen Position';
  static readonly ERR_MAX_ROTATION_NOT_POSITIVE: string = 'Max rotation must be a positive integer';
  static readonly ERR_MAX_ROTATION_NOT_INTEGER: string = 'Max rotation must be an integer';

  /**
   * Returns a new Position with the same row, col, rotation, and maxRotation as the given Position.
   *
   * @param position The Position to copy
   */
  static copy(position: Position): Position {
    return new Position(position, position.rotation, position._maxRotation);
  }

  private _maxRotation: number;

  /**
   * Creates a new Position with the given offset, rotation, and maxRotation.
   * Rotation will be normalized to be within the maximum.
   * Max rotation must be a positive integer.
   */
  constructor(location: { row: number, col: number }, rotation: number, maxRotation: number) {
    super(location, rotation);
    this._maxRotation = this._validateMaxRotation(maxRotation);
    this._normalizeRotation();
  }

  /**
   * Freezes this Position, preventing further modification.
   *
   * @returns This Position
   */
  freeze(): Position {
    return super.freeze() as Position;
  }

  /**
   * Gets the location of this Position.
   */
  get location(): Coord {
    return this.offset;
  }

  /**
   * Gets the maximum rotation of this Position.
   */
  get maxRotation(): number {
    return this._maxRotation;
  }

  /**
   * Gets the rotation of this Position.
   */
  get rotation(): number {
    return super.rotation;
  }

  /**
   * Sets the location of this Position.
   * Rotation will be normalized to be within the maximum.
   *
   * @throws {Error} If this Position is frozen
   */
  set rotation(rotation: number) {
    super.rotation = rotation;
    this._normalizeRotation();
  }

  /**
   * Sets the maximum rotation of this Position.
   * Rotation will be normalized to be within the new maximum.
   *
   * @throws {Error} If this Position is frozen
   */
  set maxRotation(maxRotation: number) {
    if (this._frozen) {
      throw new Error(Position.ERR_FROZEN);
    }

    this._maxRotation = this._validateMaxRotation(maxRotation);
    this._normalizeRotation();
  }

  /**
   * Adds the given Move to this Position.
   * Rotation will be normalized to be within the maximum.
   *
   * @param other The Move to add
   * @returns This Position
   * @throws {Error} If this Position is frozen
   */
  add(other: Move): Position {
    super.add(other);
    this._normalizeRotation();
    return this;
  }

  /**
   * Adds the given offset to this Position.
   * Rotation will be normalized to be within the maximum.
   *
   * @param rotation The rotation to add
   * @returns This Position
   * @throws {Error} If this Position is frozen
   */
  rotate(rotation: number): Position {
    super.rotate(rotation);
    this._normalizeRotation();
    return this;
  }

  /**
   * Rotates this Position clockwise.
   * Rotation will be normalized to be within the maximum.
   *
   * @returns This Position
   * @throws {Error} If this Position is frozen
   */
  rotateClockwise(): Position {
    super.rotateClockwise();
    this._normalizeRotation();
    return this;
  }

  /**
   * Rotates this Position counter-clockwise.
   * Rotation will be normalized to be within the maximum.
   *
   * @returns This Position
   * @throws {Error} If this Position is frozen
   */
  rotateCounterClockwise(): Position {
    super.rotateCounterClockwise();
    this._normalizeRotation();
    return this;
  }

  /**
   * Gets whether this Position is equal to the given Position.
   *
   * @param other The Position to compare to
   * @returns True if this Position is equal to the given Position; false otherwise.
   */
  equals(other: Position): boolean {
    return (
      this.offset.equals(other.offset) &&
      this.rotation === other.rotation &&
      this._maxRotation === other._maxRotation
    );
	}

	hashCode(): number {
		return super.hashCode() * 37 + this._maxRotation;
	}

  /**
   * Returns a string representation of this Position.
   */
	toString(): string {
    return `Position{offset: ${this._offset.toString()}, rotation: ${this._rotation}, maxRotation: ${this._maxRotation}}`;
	}

  private _normalizeRotation(): void {
    if (this._rotation < 0 || this._rotation >= this._maxRotation) {
      this._rotation = ((this._rotation % this._maxRotation) + this._maxRotation) % this._maxRotation;
    }
  }

  private _validateMaxRotation(maxRotation: number): number {
    if (maxRotation < 1) {
      throw new Error(Position.ERR_MAX_ROTATION_NOT_POSITIVE);
    }
    if (!Number.isInteger(maxRotation)) {
      throw new Error(Position.ERR_MAX_ROTATION_NOT_INTEGER);
    }
    return maxRotation;
  }
}
