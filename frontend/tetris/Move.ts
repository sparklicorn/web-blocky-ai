import Coord from './Coord';

export default class Move {
  static readonly ERR_FROZEN: string = 'Cannot modify frozen Move';

  static readonly STAND = new Move(Coord.ZERO, 0).freeze();
  static readonly UP = new Move(Coord.UP, 0).freeze();
  static readonly DOWN = new Move(Coord.DOWN, 0).freeze();
  static readonly LEFT = new Move(Coord.LEFT, 0).freeze();
  static readonly RIGHT = new Move(Coord.RIGHT, 0).freeze();
  static readonly CLOCKWISE = new Move(Coord.ZERO, -1).freeze();
  static readonly COUNTERCLOCKWISE = new Move(Coord.ZERO, 1).freeze();

  /**
   * Returns a new Move with the same row, col, and rotation as the given Move.
   *
   * @param move The Move to copy
   */
  static copy(move: Move): Move {
    return new Move(move.offset, move.rotation);
  }

	protected _offset: Coord;
	protected _rotation: number;
  protected _frozen: boolean;

  /**
   * Creates a new Move with the given offset and rotation.
   */
	constructor(location: { row: number, col: number }, rotation: number) {
		this._offset = Coord.copy(location);
		this._rotation = rotation;
    this._frozen = false;
	}

  /**
   * Freezes this Move, preventing further modification.
   *
   * @returns This Move
   */
  freeze(): Move {
    this._frozen = true;
    this._offset.freeze();
    return this;
  }

  /**
   * Gets whether this Move is frozen.
   */
  get frozen() {
    return this._frozen;
  }

  /**
   * Gets the offset of this Move.
   */
	get offset(): Coord {
		return this._offset;
	}

  /**
   * Gets the row of this Move.
   */
	get row(): number {
		return this._offset.row;
	}

  /**
   * Gets the column of this Move.
   */
	get col(): number {
		return this.offset.col;
	}

  /**
   * Gets the rotation of this Move.
   */
	get rotation(): number {
		return this._rotation;
	}

  /**
   * Sets the row of this Move.
   */
  set row(row: number) {
    this._validateFrozen();
    this._offset.row = row;
  }

  /**
   * Sets the column of this Move.
   */
  set col(col: number) {
    this._validateFrozen();
    this._offset.col = col;
  }

  /**
   * Sets the rotation of this Move.
   */
  set rotation(rotation: number) {
    this._validateFrozen();
    this._rotation = rotation;
  }

  /**
   * Sets the offset and rotation of this Move.
   *
   * @param offset The new offset.
   * @param rotation The new rotation.
   * @returns This Move.
   */
  set(offset?: Coord, rotation?: number): Move {
    this._validateFrozen();

    if (offset) {
      this._offset.reset(offset);
    }

    if (rotation) {
      this._rotation = rotation;
    }

    return this;
  }

  /**
   * Shifts this Move by the given offset.
   *
   * @param offset The offset to shift by
   */
  shift(offset: Coord): Move {
    this._validateFrozen();
    this._offset.add(offset);
    return this;
  }

  /**
   * Adds the given Move to this Move.
   *
   * @param other The Move to add
   */
  add(other: Move): Move {
    this._validateFrozen();
    this._offset.add(other.offset);
    this._rotation += other.rotation;
    return this;
	}

  /**
   * Rotates this Move by the given amount.
   *
   * @param rotation The amount to rotate by
   */
  rotate(rotation: number): Move {
    this._validateFrozen();
    this._rotation += rotation;
    return this;
  }

  /**
   * Rotates this Move clockwise.
   */
	rotateClockwise(): Move {
    return this.rotate(Move.CLOCKWISE.rotation);
	}

  /**
   * Rotates this Move counterclockwise.
   */
	rotateCounterClockwise(): Move {
    return this.rotate(Move.COUNTERCLOCKWISE.rotation);
	}

  /**
   * Returns the squared distance between this Move and the given Move.
   *
   * @param other The Move to calculate the squared distance to
   */
  sqrDist(other: Move): number {
    return this.offset.sqrDist(other.offset);
  }

  /**
   * Returns whether this Move is equal to the given Move.
   *
   * @param other The Move to compare to
   */
	equals(other: Move): boolean {
    return this.offset.equals(other.offset) && this.rotation === other.rotation;
	}

	hashCode(): number {
		return this._offset.hashCode() * 31 + this._rotation;
	}

  /**
   * Returns a string representation of this Move.
   */
	toString(): string {
    return `Move{offset: ${this._offset.toString()}, rotation: ${this._rotation}}`;
	}

  protected _validateFrozen(): void {
    if (this._frozen) {
      throw new Error(Move.ERR_FROZEN);
    }
  }
}
