import Coord from '../structs/Coord';
import Move from '../structs/Move';
import Piece from './Piece';
import Position from '../structs/Position';
import { SHAPES, Shape } from './Shape';
import ShapeQueue from './ShapeQueue';
import { bounded, validatePositiveInteger } from '../util/Util';

export default class TetrisState {
	// TODO experiment with different values
	static readonly MIN_ROWS = 5;
	static readonly MIN_COLS = 5;
	static readonly MAX_ROWS = 100;
	static readonly MAX_COLS = 100;

  static readonly DEFAULT_NUM_ROWS = 20;
	static readonly DEFAULT_NUM_COLS = 10;
  static readonly DEFAULT_LINES_PER_LEVEL = 10;

	static readonly DEFAULT_ENTRY_COLUMN = TetrisState.calcEntryColumn(TetrisState.DEFAULT_NUM_COLS);
  static readonly DEFAULT_ENTRY_COORD = new Coord(1, TetrisState.DEFAULT_ENTRY_COLUMN);

  // TODO default points per line cleared

  /**
	 * Calculates the column where pieces appear, which is the center column,
	 * or just left of center if there are an even number of columns.
	 *
	 * @param cols Number of columns on the board.
	 */
	static calcEntryColumn(cols : number) {
		const _cols = bounded(
			TetrisState.MIN_COLS,
			TetrisState.MAX_COLS,
			validatePositiveInteger(cols, 'cols')
		);

		return Math.floor(_cols / 2) - ((_cols % 2 === 0) ? 1 : 0);
	}

	/**
	 * Creates a new TetrisState with the same values as the given TetrisState.
	 */
	static copy(other: TetrisState): TetrisState {
    const copy = new TetrisState(
      other.rows,
      other.cols,
      other.entryCoord,
      other._linesPerLevel
    );

		copy._board = other._board.slice();
		copy._isGameOver = other.isGameOver;
		copy._isPaused = other.isPaused;
		copy._isClearingLines = other.isClearingLines;
		copy._hasStarted = other.hasStarted;
		copy._level = other.level;
		copy._score = other.score;
		copy._linesCleared = other.linesCleared;
		copy._numPiecesDropped = other.numPiecesDropped;
		copy._linesUntilNextLevel = other.linesUntilNextLevel;
		copy._dist = other._dist.slice();
		copy._nextShapes = ShapeQueue.copy(other._nextShapes);
		copy._piece = Piece.copy(other._piece);

    return copy;
	}

  readonly rows: number = TetrisState.DEFAULT_NUM_ROWS;
  readonly cols: number = TetrisState.DEFAULT_NUM_COLS;
  readonly entryCoord: Coord = new Coord(1, TetrisState.calcEntryColumn(this.cols));

	protected readonly _linesPerLevel: number | ((level: number) => number) = TetrisState.DEFAULT_LINES_PER_LEVEL;

  protected _board: number[] = [];
  protected _isGameOver: boolean = false;
  protected _isPaused: boolean = false;
  protected _isClearingLines: boolean = false;
  protected _hasStarted: boolean = false;
  protected _level: number = 0;
  protected _score: number = 0;
  protected _linesCleared: number = 0;
  protected _numPiecesDropped: number = 0;
  protected _linesUntilNextLevel: number = 0;
  protected _dist: number[] = [];
  protected _nextShapes: ShapeQueue = new ShapeQueue();
  protected _piece: Piece = new Piece(
		new Position(this.entryCoord, 0, this._nextShapes.peek().numRotations),
		this._nextShapes.poll()
	);

  // TODO private pointsPerLineClear: number[] | ((linesCleared: number, level: number) => number);
  // TODO create function to calculate points per line cleared based property

	/**
	 * Creates a new TetrisState with the given number of rows and columns.
	 */
	constructor(
    rows: number = TetrisState.DEFAULT_NUM_ROWS,
    cols: number = TetrisState.DEFAULT_NUM_COLS,
    entryCoord: Coord = new Coord(1, TetrisState.calcEntryColumn(cols)),
    linesPerLevel: number | ((level: number) => number) = TetrisState.DEFAULT_LINES_PER_LEVEL
  ) {
		this.rows = validatePositiveInteger(rows, 'rows');
		this.cols = validatePositiveInteger(cols, 'cols');

		if (this.rows < TetrisState.MIN_ROWS || this.rows > TetrisState.MAX_ROWS) {
			throw new Error(`rows must be between ${TetrisState.MIN_ROWS} and ${TetrisState.MAX_ROWS}`);
		}

		if (this.cols < TetrisState.MIN_COLS || this.cols > TetrisState.MAX_COLS) {
			throw new Error(`cols must be between ${TetrisState.MIN_COLS} and ${TetrisState.MAX_COLS}`);
		}

		this.entryCoord = entryCoord;
		this._linesPerLevel = linesPerLevel;
		this.reset();
	}

	/**
	 * Resets the state of the game.
	 */
	reset(): void {
		this._board = Array(this.rows * this.cols).fill(0);
		this._isGameOver = false;
		this._isPaused = false;
		this._isClearingLines = false;
		this._hasStarted = false;
		this._level = 0;
		this._score = 0;
		this._linesCleared = 0;
		this._numPiecesDropped = 0;
		this._linesUntilNextLevel = this.linesPerLevel();
		this._dist = Array(SHAPES.length).fill(0);
		this._nextShapes = new ShapeQueue();
		this._piece = new Piece(
			new Position(this.entryCoord, 0, this._nextShapes.peek().numRotations),
			this._nextShapes.poll()
		);
	}

  /**
   * Returns a copy of the board.
   */
  get board(): number[] { return this._board.slice(); }
  get isGameOver(): boolean { return this._isGameOver; }
  get isPaused(): boolean { return this._isPaused; }
  get isClearingLines(): boolean { return this._isClearingLines; }
  get hasStarted(): boolean { return this._hasStarted; }
  get level(): number { return this._level; }
  get score(): number { return this._score; }
  get linesCleared(): number { return this._linesCleared; }
  get numPiecesDropped(): number { return this._numPiecesDropped; }
  get linesUntilNextLevel(): number { return this._linesUntilNextLevel; }
  get dist(): number[] { return this._dist.slice(); }
  get nextShapes(): ShapeQueue { return ShapeQueue.copy(this._nextShapes); }

  /**
   * Returns the current piece.
   */
  get piece(): Piece { return this._piece; }

  set linesCleared(linesCleared: number) { this._linesCleared = linesCleared; }
  set score(score: number) { this._score = score; }
  set isClearingLines(isClearingLines: boolean) { this._isClearingLines = isClearingLines; }
  set linesUntilNextLevel(linesUntilNextLevel: number) { this._linesUntilNextLevel = linesUntilNextLevel; }
  set level(level: number) { this._level = level; }
  set hasStarted(hasStarted: boolean) { this._hasStarted = hasStarted; }
  set isGameOver(isGameOver: boolean) { this._isGameOver = isGameOver; }
  set isPaused(isPaused: boolean) { this._isPaused = isPaused; }

  linesPerLevel(): number {
    return (typeof this._linesPerLevel === 'function') ?
      this._linesPerLevel(this.level) :
      this._linesPerLevel;
  }

	/**
	 * Gets the next shape in the queue.
	 */
	getNextShape(): Shape {
		return this._nextShapes.peek();
	}

	/**
	 * Peeks the given number of shapes in the queue.
	 *
	 * @param numShapes Number of shapes to peek.
	 * @return An array of the next shapes in the queue.
	 */
	getNextShapes(numShapes: number): Shape[] {
		return this._nextShapes.peekNext(numShapes);
	}

	/**
	 * Sets the value of the cell at the given index.
	 *
	 * @param index The index of the cell to set.
	 * @param value The value to set the cell to.
	 * @throws Error if the given index is out of bounds.
	 */
	setCellByIndex(index: number, value: number): void {
		if (index < 0 || index >= this._board.length) {
			throw new Error(`Index ${index} is out of bounds`);
		}

		this._board[index] = value;
	}

	/**
	 * Sets the value of the cell at the given location.
	 *
	 * @param location The location of the cell to set.
	 * @param value The value to set the cell to.
	 * @throws Error if the given location is out of bounds.
	 */
	setCell(location: Coord, value: number): void {
		if (!this.isLocationValid(location)) {
			throw new Error(`Location ${location.toString()} is out of bounds`);
		}

    this._board[location.row * this.cols + location.col] = value;
	}

	/**
	 * Gets the value of the cell at the given index.
	 *
	 * @param index The index of the cell to get.
	 * @return The value of the cell at the given index.
	 * @throws Error if the given index is out of bounds.
	 */
	getCellByIndex(index: number): number {
		if (index < 0 || index >= this._board.length) {
			throw new Error(`Index ${index} is out of bounds`);
		}

		return this._board[index];
	}

	/**
	 * Gets the value of the cell at the given location.
	 *
	 * @param location The location of the cell to get.
	 * @return The value of the cell at the given location.
	 * @throws Error if the given location is out of bounds.
	 */
	getCell(location: Coord): number {
		if (!this.isLocationValid(location)) {
			throw new Error(`Location ${location.toString()} is out of bounds`);
		}

    return this._board[location.row * this.cols + location.col];
	}

	/**
	 * Checks whether the specified cell is empty.
	 *
	 * @param location The location of the cell to check.
	 * @return True if the cell is empty; false otherwise.
	 * @throws Error if the given location is out of bounds.
	 */
	isCellEmpty(location: Coord): boolean {
		return this.getCell(location) === 0;
	}

	/**
	 * Checks whether the given coordinates are within the bounds of the board.
	 *
	 * @param row The row to check.
	 * @param col The column to check.
	 * @return True if the coordinates are valid; false otherwise.
	 */
	isLocationValid(location: Coord): boolean {
		return (
			location.row >= 0 &&
			location.row < this.rows &&
			location.col >= 0 &&
			location.col < this.cols
		);
	}

	/**
	 * Checks whether the current piece is within the bounds of the board.
	 *
	 * @return True if the piece is in bounds; false otherwise.
	 */
	isCurrentPieceLocationValid(): boolean {
    return this.isPositionValid(this._piece.position);
	}

	/**
	 * Checks whether the given position for the current shape is valid,
	 * i.e. the piece blocks are all within the bounds of the board, there
	 * are no blocks in the way, and the piece is not wrapping around the board.
	 *
	 * @param pos The position to check.
	 * @return True if the position is valid; false otherwise.
	 */
	isPositionValid(position: Position): boolean {
		const newBlockCoords = this.getShapeCoordsAtPosition(position);
		let minCol = newBlockCoords[0].col;
		let maxCol = newBlockCoords[0].col;

		for (let c of newBlockCoords) {
			minCol = Math.min(minCol, c.col);
			maxCol = Math.max(maxCol, c.col);

			if (
				!this.isLocationValid(c) ||
				!this.isCellEmpty(c) ||

				// TODO May not be necessary anymore when using Coord
				// TODO because cols will just be negative instead of wrapping around.
				// A large gap between cell columns means the piece wrapped around the board.
				(maxCol - minCol) > 4
			) {
				return false;
			}
		}

		return true;
	}

	/**
	 * ! it's more like validation of the resulting location and does not imply that a path exists to it unless the
	 * ! magnitude of the move is (exclusively) one unit of rotation or of offset.
	 * ! however you wanna fit that into a name... is great
	 * Checks that the given move is in bounds of the board, that there are no blocks occupying
	 * the spaces, and that the resulting position does not end up higher on the board.
	 *
	 * @param move
	 * @return True if the active piece can move to the specified position; otherwise false.
	 */
	canPieceMove(move: Move): boolean {
		// TODO game should also have to be started
		return (
			!this.isGameOver &&
			this.piece.isActive &&
			!this.isPaused &&
			move.row >= 0 &&
			this.isPositionValid(this.piece.position.add(move))
		);
	}

	/**
	 * Checks whether the current piece can move with the given rotation.
	 * If the piece cannot be rotated in place, it will check whether it can be shifted first.
	 *
	 * If shifting doesn't allow rotation, then this returns an adjusted move of STAND, indicating
	 * the rotation is not possible.
	 *
	 * @param move CLOCKWISE or COUNTERCLOCKWISE
	 * @return A Move representing the rotation, it may be adjusted to include a left
	 * or right shift that is required to accomodate the rotation.
	 * If the rotation is not possible, returns Move.STAND.
	 */
	tryRotation(move: Move): Move {
		if (!(move.equals(Move.CLOCKWISE) || move.equals(Move.COUNTERCLOCKWISE))) {
			return Move.copy(Move.STAND);
		}

		if (this.canPieceMove(move)) {
			return Move.copy(move);
		}

		// Attempt to "kick off" an edge or block if rotating too close.
		const kickLeft = Move.copy(move);
		const kickRight = Move.copy(move);
		for (let colOffset = 1; colOffset < 3; colOffset++) {
			if (this.canPieceMove(kickLeft.add(Move.LEFT))) {
				return kickLeft;
			}

			if (this.canPieceMove(kickRight.add(Move.RIGHT))) {
				return kickRight;
			}
		}

		return Move.copy(Move.STAND);
	}

	/**
	 * Calculates the block coordinates for the active shape at the given position.
	 *
	 * @param pos Position of the shape to calculate the block coordinates for.
	 * @return An array of coordinates for the blocks of the shape at the given position.
	 */
	getShapeCoordsAtPosition(position: Position): Coord[] {
		return new Piece(position, this.piece.shape).blockCoords;
	}

	/**
	 * Determines whether the given row is full.
	 *
	 * @param row Index of the row to check.
	 * @return True if the row is full; false otherwise.
	 */
	protected isRowFull(row: number): boolean {
		for (let col = 0; col < this.cols; col++) {
			// TODO get rid of wasteful instantiations
			if (this.isCellEmpty(new Coord(row, col))) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Gets a list of indices for rows that are full, in ascending order.
	 */
	getFullRows(): number[] {
		const lines: number[] = [];

		for (let row = 0; row < this.rows; row++) {
			if (this.isRowFull(row)) {
				lines.push(row);
			}
		}

		return lines;
	}

	/**
	 * Copies the one row's values to another.
	 *
	 * @param fromRow The row to copy from.
	 * @param toRow The row to copy to.
	 * @throws Error if either row index is out of bounds.
	 */
	copyRow(fromRow: number, toRow: number): void {
		// Validate row indices
		if (fromRow < 0 || fromRow >= this.rows) {
			throw new Error(`fromRow ${fromRow} is out of bounds`);
		}

		if (toRow < 0 || toRow >= this.rows) {
			throw new Error(`toRow ${toRow} is out of bounds`);
		}

		const fromRowStart = fromRow * this.cols;
		const toRowStart = toRow * this.cols;

		for (let col = 0; col < this.cols; col++) {
			this._board[toRowStart + col] = this._board[fromRowStart + col];
		}
	}

	/**
	 * Clears the given row.
	 *
	 * @param row The row to clear.
	 * @throws Error if the row index is out of bounds.
	 */
	clearRow(row: number): void {
		// Validate row index
		if (row < 0 || row >= this.rows) {
			throw new Error(`Row ${row} is out of bounds`);
		}

		for (let col = 0; col < this.cols; col++) {
			this._board[row * this.cols + col] = 0;
		}
	}

	/**
	 * Determines whether the given row is empty.
	 *
	 * @param row The row to check.
	 * @returns True if the row is empty; otherwise false.
	 * @throws Error if the row index is out of bounds.
	 */
	isRowEmpty(row: number): boolean {
		// Validate row index
		if (row < 0 || row >= this.rows) {
			throw new Error(`Row ${row} is out of bounds`);
		}

		for (let i = row * this.cols; i < (row + 1) * this.cols; i++) {
			if (this._board[i] > 0) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Determines if the piece is sharing the same cell as any other block.
	 *
	 * @return True if the piece is overlapping with other blocks; otherwise false.
	 */
	pieceOverlapsBlocks(): boolean {
		return this.piece.isActive && this.piece.intersects(this);
	}

	/**
	 * Places the piece on the board at its current position.
	 */
	placePiece(): void {
		if (this.piece.isActive) {
      this.piece.blockCoords.forEach((coord: Coord) => this.setCell(coord, this.piece.shape.value));
			this.piece.disable();
			this._numPiecesDropped++;
		}
	}

	/**
	 * Resets the piece to the top of the board with the next shape from the queue.
	 */
	resetPiece(): void {
		this.piece.reset(this.entryCoord, this._nextShapes.poll());
	}

	/**
	 * Fast-forwards the shape queue so that the given shape is next in the queue.
	 *
	 * @param shape The Shape that will be next in the queue.
	 */
	setNextShape(shape: Shape): void {
		// Fast-forward so that the given shape is next in the queue.
		while (this._nextShapes.peek().value != shape.value) {
			this._nextShapes.poll();
		}
	}

	/**
	 * Returns whether the game has started and is in progress.
	 * TODO determine whether this should also take into account pausing
	 */
	isRunning(): boolean {
		return this.hasStarted && !this.isGameOver;
	}
}
