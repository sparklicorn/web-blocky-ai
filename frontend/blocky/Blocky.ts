import Coord from '../structs/Coord';
import { Event, EventListener } from '../event/Event';
import EventBus from '../event/EventBus';
import Move from '../structs/Move';
import BlockyEvent from './BlockyEvent';
import BlockyState from './BlockyState';
import Timer from '../util/Timer';
import { bounded } from '../util/Util';
import IBlockyGame from './IBlockyGame';
import IEventBussy from '../event/IEventBussy';

export default class Blocky implements IBlockyGame, IEventBussy {
  static readonly PIECE_PLACED_DELAY_MS = 250;
  static readonly POINTS_BY_LINES_CLEARED = [0, 40, 100, 300, 1200];

  protected _state: BlockyState;
  protected eventBus: EventBus | null = null;
	protected usingGravity: boolean = true;
  protected gravityTimer: Timer;
  protected numTimerPushbacks: number = 0;
  protected ticksUntilNextGravity: number = 0;

  constructor(state: BlockyState = new BlockyState()) {
    this._state = state;
    this.gravityTimer = new Timer(this.gameloop.bind(this));
  }

	newGame(): void {
		this.reset();
		this.throwEvent(BlockyEvent.NEW_GAME(this));
	}

	start(level: number = 0, useGravity: boolean = true): void {
		if (this._state.hasStarted) {
			return;
		}

    this._state.level = bounded(level, 0, 19);
		this._state.hasStarted = true;

		this.nextPiece();

		if (useGravity) {
			this.enableGravity();
			this.updateGravityTimerDelayMs();
		}

		this.throwEvent(BlockyEvent.START(this));
	}

	stop(): void {
		this._state.isPaused = false;
		this._state.isGameOver = true;
		this._state.isClearingLines = false;
		this._state.placePiece();

		if (this.isGravityEnabled()) {
			this.gravityTimer.stop();
		}

		this.throwEvent(BlockyEvent.STOP(this));
	}

	pause(): void {
		if (this._state.isGameOver || this._state.isPaused || !this._state.hasStarted) {
			return;
		}

		this._state.isPaused = true;

		if (this.isGravityEnabled()) {
			this.gravityTimer.stop();
		}

		this.throwEvent(BlockyEvent.PAUSE());
	}

	resume(): void {
		if (this._state.hasStarted && !this._state.isGameOver) {
			this._state.isPaused = false;
			if (this.isGravityEnabled()) {
				this.gravityTimer.start(this.gravityDelayMsForLevel());
			}
			this.throwEvent(BlockyEvent.RESUME());
		}
	}

	moveLeft(): boolean {
		return this.shift(0, -1);
	}

	moveRight(): boolean {
		return this.shift(0, 1);
	}

	moveDown(): boolean {
		return this.shift(1, 0);
	}

	rotateClockwise(): boolean {
		return this.handleRotation(Move.CLOCKWISE);
	}

	rotateCounterClockwise(): boolean {
		return this.handleRotation(Move.COUNTERCLOCKWISE);
	}

	getState(): BlockyState {
		return BlockyState.copy(this._state);
	}

	/**
	 * Executes the game loop logic.
	 * If gravity is being used, this method is called automatically by the gravity timer.
	 * Otherwise, this method must be called manually.
	 */
	gameloop(): void {
		if (this._state.isGameOver || this._state.isPaused) {
			return;
		}

		this.numTimerPushbacks = 0;

		if (this._state.piece.isActive && !this._state.canPieceMove(Move.DOWN)) {
			//*kerplunk*
			//next loop should attempt to clear lines
			this.plotPiece();

			if (this.isGravityEnabled()) {
				this.gravityTimer.delay = Blocky.PIECE_PLACED_DELAY_MS;
				this.ticksUntilNextGravity = 2;
			}
		} else if (!this._state.piece.isActive) {	// The loop after piece kerplunks
			if (this.attemptClearLines()) {
				this.ticksUntilNextGravity += 2;
				//check if we need to update level
				if (this._state.linesUntilNextLevel <= 0) { //level up!!
					this.increaseLevel();
				}
			} else {
				this.nextPiece();
				if (this.checkGameOver()) {
					return;
				}
			}
		} else {	//piece alive && not at bottom
			if (this.isGravityEnabled()) {
				if (this.ticksUntilNextGravity == 0) {
					this.shiftPiece(Move.DOWN);
					// this.throwEvent(BlockyEvent.PIECE_SHIFT(this));
				} else {
					this.ticksUntilNextGravity = Math.max(0, this.ticksUntilNextGravity - 1);
					if (this.ticksUntilNextGravity == 0) {
						this.updateGravityTimerDelayMs();
					}
				}
			}
		}

		this.throwEvent(BlockyEvent.GAMELOOP(this));
	}

  /**
	 * Returns points rewarded for clearing lines at a given level.
	 *
	 * @param lines Number of lines cleared.
	 * @return Points to reward.
	 */
	calcPointsForClearing(lines: number): number {
		return Blocky.POINTS_BY_LINES_CLEARED[lines] * (this._state.level + 1);
	}

  /**
	 * Attempts to rotate the current piece clockwise.
	 * The piece may be shifted left or right to accomodate the rotation.
	 * TODO Clean up / consolidate the several rotation methods.
	 *
	 * @param move The rotation to attempt.
	 * Should be either Move.CLOCKWISE or Move.COUNTERCLOCKWISE.
	 * @return True if the piece was successfully rotated; otherwise false.
	 */
	rotate(move: Move): boolean {
		const _move = this._state.tryRotation(move);

		if (_move.equals(Move.STAND)) {
			return false;
		}

		this._state.piece.move(_move);
		this.throwEvent(BlockyEvent.PIECE_ROTATE(this));

		return true;
	}

	/**
	 * Attempts to shift the current piece with the given offset.
	 *
	 * @return True if the piece was successfully moved; otherwise false.
	 */
	//! NOTE: move.rotation is ignored
	shiftPiece(move: Move): boolean {
		if (this._state.canPieceMove(move)) {
			this._state.piece.move(move);
			this.throwEvent(BlockyEvent.PIECE_SHIFT(this));
			return true;
		}

		return false;
	}

	/**
	 * Plots the piece's block data to the board.
	 */
	plotPiece(): void {
		this._state.placePiece();
		this.throwEvent(BlockyEvent.PIECE_PLACED(this).add({
      _numPiecesDropped: this._state.numPiecesDropped
    }));
		this.throwEvent(BlockyEvent.BLOCKS(this));
	}

	/**
	 * Clears full lines and shift remaining blocks down.
	 *
	 * @return List of cleared rows, or null if no rows were cleared.
	 */
	clearLines(): number[] {
		const fullRows = this._state.getFullRows();

		if (fullRows.length > 0) {
			for (
				let row = fullRows[fullRows.length - 1] - 1, numRowsToDrop = 1;
				row >= 0;
				row--
			) {
				// If row is to be cleared, +1 to the amount of rows to drop
				if (fullRows.includes(row)) {
					numRowsToDrop++;
					continue;
				}

				// If row is empty, then all rows above are empty too.
				// Clear rows (row + 1) through (row + numRowsToDrop)
				if (this._state.isRowEmpty(row)) {
					for (let clearingRow = row + 1; clearingRow <= row + numRowsToDrop; clearingRow++) {
						this._state.clearRow(clearingRow);
					}

					break;
				}

				// Shift row down by 'numRowsToDrop'
				this._state.copyRow(row, row + numRowsToDrop);
			}
		}

		return (fullRows.length === 0) ? [] : fullRows;
	}

	/**
	 * Returns whether the game has gravity enabled.
	 */
	isGravityEnabled(): boolean {
		return this.usingGravity;
	}

	/**
	 * Disables gravity if it is currently enabled.
	 */
	disableGravity(): void {
		if (this.isGravityEnabled()) {
			this.usingGravity = false;
			this.gravityTimer.stop();
			this.throwEvent(BlockyEvent.GRAVITY_DISABLED());
		}
	}

	/**
	 * Enables gravity if it is currently disabled.
	 */
	enableGravity(): void {
		if (!this.isGravityEnabled()) {
			this.usingGravity = true;
      // this.gravityTimer.enable();
      this.throwEvent(BlockyEvent.GRAVITY_ENABLED());
		}

    if (this._state.hasStarted && !this._state.isGameOver && !this._state.isPaused) {
      this.gravityTimer.start(this.gravityDelayMsForLevel());
    }
	}

  gravityDelayMsForLevel(): number {
    return Math.round((Math.pow(0.8 - (this._state.level) * 0.007, this._state.level)) * 1000.0);
  }

	/**
	 * Calculates and updates the amount of time between gravity ticks for the current level.
	 *
	 * @return The calculated delay (ms).
	 */
	updateGravityTimerDelayMs(): number {
		const delay = this.gravityDelayMsForLevel();
		if (this.isGravityEnabled()) {
			this.gravityTimer.delay = delay;
		}
		return delay;
	}

	/**
	 * Attempts to clear full rows.
	 *
	 * @return True if any row was cleared; otherwise false.
	 */
	attemptClearLines(): boolean {
		// TODO Refactor after clearLines() is refactored
		const lines = this.clearLines();

		if (lines.length > 0) {
			this._state.linesCleared += lines.length;
			this._state.score += this.calcPointsForClearing(lines.length);
			this._state.linesUntilNextLevel -= lines.length;
			this._state.isClearingLines = true;

			this.throwEvent(BlockyEvent.LINE_CLEAR(this, lines));
			this.throwEvent(BlockyEvent.SCORE_UPDATE(this));
			this.throwEvent(BlockyEvent.BLOCKS(this));
		}

		return lines.length > 0;
	}

	/**
	 * Determines whether the active piece is overlapped with any other blocks,
	 * which is the lose condition. If detected, the gameOver handler is called.
	 *
	 * @return True if the game is over; otherwise false.
	 */
	checkGameOver(): boolean {
		if (this._state.isGameOver) {
			return true;
		}

		if (this._state.pieceOverlapsBlocks()) {
			this.gameOver();
			return true;
		}

		return false;
	}

	/**
	 * Increases the level by 1, and updates the gravity timer delay.
	 */
	increaseLevel(): void {
		this._state.level++;
		this._state.linesUntilNextLevel += this._state.linesPerLevel();
		this.updateGravityTimerDelayMs();
		this.throwEvent(BlockyEvent.LEVEL_UPDATE(this));
	}

	/**
	 * Resets the game state.
	 */
	reset(): void {
		this._state.reset();
		this.numTimerPushbacks = 0;
		this.throwEvent(BlockyEvent.RESET(this));
	}

	/**
	 * Ends the game.
	 * This method is called when the active piece overlaps with any other blocks.
	 * The gravity timer is stopped.
	 */
	gameOver(): void {
		this._state.isGameOver = true;
		this._state.isPaused = false;
		this._state.isClearingLines = false;
		this._state.placePiece();

		if (this.isGravityEnabled()) {
			this.gravityTimer.stop();
		}

		this.throwEvent(BlockyEvent.GAME_OVER(this));
	}

	/**
	 * If the piece is active, rotation is attempted. If the piece cannot rotate in place,
	 * then it may be shifted left or right by a couple blocks to allow rotation.
	 * If the piece cannot rotate at all, then nothing happens.
	 *
	 * @param direction The direction to rotate.
	 * Must be either Move.CLOCKWISE or Move.COUNTERCLOCKWISE.
	 * @return True if the piece was rotated; otherwise false.
	 */
	handleRotation(direction: Move): boolean {
		if (!this._state.piece.isActive || this._state.isPaused || this._state.isGameOver) {
			return false;
		}

		if (this.rotate(direction)) {
			// If next gravity tick will plop the piece, maybe rotation should delay that
			// a little to give the user time to make final adjustments.
			// This is an anti-frustration technique.
			if (!this._state.canPieceMove(Move.DOWN) && this.numTimerPushbacks < 4) {
				// if (gameTimer != null) {
				// 	gameTimer.resetTickDelay();
					// System.out.println(gameTimer.resetTickDelay());
				// }
				this.numTimerPushbacks++;
			}

			// this.throwEvent(BlockyEvent.PIECE_ROTATE(this));
			return true;
		}

		return false;
	}

	// TODO Clean up / consolidate the couple shift methods.
	shift(rowOffset: number, colOffset: number): boolean {
		const move = new Move(new Coord(rowOffset, colOffset), 0);
		if (this.shiftPiece(move)) {
			if (!this._state.canPieceMove(Move.DOWN) && this.numTimerPushbacks < 4) {
				this.numTimerPushbacks++;
			}

			if (this.isGravityEnabled() && rowOffset > 0) {
				if (this.ticksUntilNextGravity > 0) {
					this.ticksUntilNextGravity = 0;
					this.updateGravityTimerDelayMs();
				}

				this.gravityTimer.delayNextTick();
			}

			// this.throwEvent(BlockyEvent.PIECE_SHIFT(this));
			return true;
		}

		return false;
	}

	/*********************
		Event Handling
	**********************/

	registerEventListener(eventName: string, listener: EventListener): boolean {
		this.eventBus = this.eventBus || new EventBus();
		return this.eventBus.registerEventListener(eventName, listener);
	}

	unregisterEventListener(eventName: string, listener: EventListener): boolean {
		return (this.eventBus) ? this.eventBus.unregisterEventListener(eventName, listener) : false;
	}

	unregisterAllEventListeners(eventName: string): boolean {
		return (this.eventBus) ? this.eventBus.unregisterAllEventListeners(eventName) : false;
	}

	throwEvent(event: Event): void {
		if (this.eventBus) {
			this.eventBus.throwEvent(event);
		}
	}

	hasListeners(eventName: string): boolean {
		return (this.eventBus) ? this.eventBus.hasListeners(eventName) : false;
	}

	// static record PQEntry<T>(T data, int priority) implements Comparable<PQEntry<T>> {
	// 	@Override
	// 	public int compareTo(PQEntry<T> o) {
	// 		return (priority - o.priority);
	// 	}
	// }

	/**
	 * Helper to create a new search queue entry.
	 * The priority value is the sqrdist between given positions.
	 *
	 * @param newPosition Data value for the queue entry
	 * @param goalPosition Used to calculate the priority value.
	 * @return A new PQEntry with the given value and calculated priority.
	 */
	// PQEntry<Position> positionSearchEntry(Position newPosition, Position goalPosition) {
	// 	return new PQEntry<Position>(
	// 		new Position(newPosition),
	// 		newPosition.sqrdist(goalPosition)
	// 	);
	// }

	/**
	 * Resets the piece to the top of the board with the next shape.
	 */
	nextPiece(): void {
		this._state.resetPiece();
		this.throwEvent(BlockyEvent.PIECE_CREATE(this).add({
      _nextShapes: this._state.nextShapes
    }));
	}
}
