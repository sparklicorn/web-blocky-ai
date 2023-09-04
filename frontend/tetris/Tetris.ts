import Coord from './Coord';
import { Event, EventListener } from './Event';
import EventBus from './EventBus';
import Move from './Move';
import TetrisEvent from './TetrisEvent';
import TetrisState from './TetrisState';
import Timer from './Timer';
import { bounded } from './Util';

export default class Tetris {
  static readonly PIECE_PLACED_DELAY_MS = 250;
  static readonly POINTS_BY_LINES_CLEARED = [0, 40, 100, 300, 1200];

  protected _state: TetrisState;
  protected eventBus: EventBus | null = null;
	protected usingGravity: boolean = true;
  protected gravityTimer: Timer;
  protected numTimerPushbacks: number = 0;
  protected ticksUntilNextGravity: number = 0;

  constructor(state: TetrisState = new TetrisState()) {
    this._state = state;
    this.gravityTimer = new Timer(this.gameloop.bind(this));
  }

  /**
   * Returns a copy current game state.
   */
  get state(): TetrisState {
		return TetrisState.copy(this._state);
	}

  /**
	 * Returns points rewarded for clearing lines at a given level.
	 *
	 * @param lines Number of lines cleared.
	 * @return Points to reward.
	 */
	protected calcPointsForClearing(lines: number): number {
		return Tetris.POINTS_BY_LINES_CLEARED[lines] * (this._state.level + 1);
	}

  /**
	 * Attempts to rotate the current piece clockwise.
	 * The piece may be shifted left or right to accomodate the rotation.
	 *
	 * @param move The rotation to attempt.
	 * Should be either Move.CLOCKWISE or Move.COUNTERCLOCKWISE.
	 * @return True if the piece was successfully rotated; otherwise false.
	 */
	protected rotate(move: Move): boolean {
		const _move = this._state.validateRotation(move);

		if (_move.equals(Move.STAND)) {
			return false;
		}

		this._state.piece.move(_move);
		this.throwEvent(TetrisEvent.PIECE_ROTATE(this));

		return true;
	}

	/**
	 * Attempts to shift the current piece with the given offset.
	 *
	 * @return True if the piece was successfully moved; otherwise false.
	 */
	//! NOTE: move.rotation is ignored
	protected shiftPiece(move: Move): boolean {
		if (this._state.canPieceMove(move)) {
			this._state.piece.move(move);
			this.throwEvent(TetrisEvent.PIECE_SHIFT(this));
			return true;
		}

		return false;
	}

	/**
	 * Plots the piece's block data to the board.
	 */
	protected plotPiece(): void {
		this._state.placePiece();
		this.throwEvent(TetrisEvent.PIECE_PLACED(this).add({
      _numPiecesDropped: this._state.numPiecesDropped
    }));
		this.throwEvent(TetrisEvent.BLOCKS(this));
	}

	// TODO #44 Removes full rows from the board, shifting remaining rows down.
	protected removeRows(rows: number[]): void {
		// TODO #44 implement and use below
	}

	/**
	 * Clears full lines and shift remaining blocks down.
	 *
	 * @return List of cleared rows, or null if no rows were cleared.
	 */
	protected clearLines(): number[] {
		const fullRows = this._state.getFullRows();

		if (fullRows.length > 0) {
			let numRowsToDrop = 1;
			let i = fullRows.length - 1;
			//start above the last row in the clearing list
			for (let row = fullRows[i--] - 1; row > 0; row--) {
				//if this row is in the clearing list too...
				if (i >= 0 && row == fullRows[i]) {
					numRowsToDrop++;
					i--;
				} else {
					//Row 'row' needs to be shifted down.
					let k = row * this._state.cols; //starting index for blocks in row 'row'.

					//j = starting index for blocks in row 'row + numRowsToDrop'.
					//replace blocks in 'row + numRowsToDrop' with blocks in 'row'
					for (
            let j = (row + numRowsToDrop) * this._state.cols;
            j < (row + numRowsToDrop + 1) * this._state.cols;
            j++
          ) {
						this._state.board[j] = this._state.board[k];
						this._state.board[k++] = 0;
					}
				}
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
	protected disableGravity(): void {
		if (this.isGravityEnabled()) {
			this.usingGravity = false;
			this.gravityTimer.stop();
			this.throwEvent(TetrisEvent.GRAVITY_DISABLED());
		}
	}

	/**
	 * Enables gravity if it is currently disabled.
	 */
	protected enableGravity(): void {
		if (!this.isGravityEnabled()) {
			this.usingGravity = true;
      // this.gravityTimer.enable();
      this.throwEvent(TetrisEvent.GRAVITY_ENABLED());
		}

    if (this._state.hasStarted && !this._state.isGameOver && !this._state.isPaused) {
      this.gravityTimer.start(this.gravityDelayMsForLevel());
    }
	}

  protected gravityDelayMsForLevel(): number {
    return Math.round((Math.pow(0.8 - (this._state.level) * 0.007, this._state.level)) * 1000.0);
  }

	/**
	 * Calculates and updates the amount of time between gravity ticks for the current level.
	 *
	 * @return The calculated delay (ms).
	 */
	protected updateGravityTimerDelayMs(): number {
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
	protected attemptClearLines(): boolean {
		// TODO #44 refactor after clearLines() is refactored
		const lines = this.clearLines();

		if (lines.length > 0) {
			this._state.linesCleared += lines.length;
			this._state.score += this.calcPointsForClearing(lines.length);
			this._state.linesUntilNextLevel -= lines.length;
			this._state.isClearingLines = true;

			this.throwEvent(TetrisEvent.LINE_CLEAR(this, lines));
			this.throwEvent(TetrisEvent.SCORE_UPDATE(this));
			this.throwEvent(TetrisEvent.BLOCKS(this));
		}

		return lines.length > 0;
	}

	/**
	 * Executes the game loop logic.
	 * If gravity is being used, this method is called automatically by the gravity timer.
	 * Otherwise, this method must be called manually.
	 */
	public gameloop(): void {
		if (this._state.isGameOver || this._state.isPaused) {
			return;
		}

		this.numTimerPushbacks = 0;

		if (this._state.piece.isActive && !this._state.canPieceMove(Move.DOWN)) {
			//*kerplunk*
			//next loop should attempt to clear lines
			this.plotPiece();

			if (this.isGravityEnabled()) {
				this.gravityTimer.delay = Tetris.PIECE_PLACED_DELAY_MS;
				this.ticksUntilNextGravity = 3;
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
					// this.throwEvent(TetrisEvent.PIECE_SHIFT(this));
				} else {
					this.ticksUntilNextGravity = Math.max(0, this.ticksUntilNextGravity - 1);
					if (this.ticksUntilNextGravity == 0) {
						this.updateGravityTimerDelayMs();
					}
				}
			}
		}

		this.throwEvent(TetrisEvent.GAMELOOP(this));
	}

	/**
	 * Determines whether the active piece is overlapped with any other blocks,
	 * which is the lose condition. If detected, the gameOver handler is called.
	 *
	 * @return True if the game is over; otherwise false.
	 */
	protected checkGameOver(): boolean {
		if (this._state.isGameOver) {
			return true;
		}

		if (this._state.pieceOverlapsBlocks()) {
			this.gameOver();
			return true;
		}

		return false;
	}

	newGame(): void {
		this.reset();
		this.throwEvent(TetrisEvent.NEW_GAME(this));
	}

	/**
	 * Increases the level by 1, and updates the gravity timer delay.
	 */
	protected increaseLevel(): void {
		this._state.level++;
		this._state.linesUntilNextLevel += this._state.linesPerLevel();
		this.updateGravityTimerDelayMs();
		this.throwEvent(TetrisEvent.LEVEL_UPDATE(this));
	}

	/**
	 * Resets the game state.
	 */
	protected reset(): void {
		this._state = new TetrisState(this._state.rows, this._state.cols);
		this.numTimerPushbacks = 0;
		this.throwEvent(TetrisEvent.RESET(this));
	}

	start(level: number, useGravity: boolean): void {
		if (this._state.hasStarted) {
			return;
		}

    this._state.level = bounded(0, 19, level);
		this._state.hasStarted = true;

		this.nextPiece();

		if (useGravity) {
			this.enableGravity();
			this.updateGravityTimerDelayMs();
		}

		this.throwEvent(TetrisEvent.START(this));
	}

	stop(): void {
		this._state.isPaused = false;
		this._state.isGameOver = true;
		this._state.isClearingLines = false;
		this._state.placePiece();

		if (this.isGravityEnabled()) {
			this.gravityTimer.stop();
		}

		this.throwEvent(TetrisEvent.STOP(this));
	}

	pause(): void {
		if (this._state.isGameOver || this._state.isPaused || !this._state.hasStarted) {
			return;
		}

		this._state.isPaused = true;

		if (this.isGravityEnabled()) {
			this.gravityTimer.stop();
		}

		this.throwEvent(TetrisEvent.PAUSE());
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

		this.throwEvent(TetrisEvent.GAME_OVER(this));
	}

	resume(): void {
		if (this._state.hasStarted && !this._state.isGameOver) {
			this._state.isPaused = false;
			if (this.isGravityEnabled()) {
				this.gravityTimer.start(this.gravityDelayMsForLevel());
			}
			this.throwEvent(TetrisEvent.RESUME());
		}
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

			// this.throwEvent(TetrisEvent.PIECE_ROTATE(this));
			return true;
		}

		return false;
	}

	rotateClockwise(): boolean {
		return this.handleRotation(Move.CLOCKWISE);
	}

	rotateCounterClockwise(): boolean {
		return this.handleRotation(Move.COUNTERCLOCKWISE);
	}

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

			// this.throwEvent(TetrisEvent.PIECE_SHIFT(this));
			return true;
		}

		return false;
	}

	/*********************
		Event Handling
	**********************/

	/**
	 * Registers an event listener for the given event.
	 * Initializes the event bus if it has not been initialized yet.
	 *
	 * @param eventName The event to listen for.
	 * @param listener The listener to register.
	 * @return True if the listener was registered; otherwise false.
	 */
	registerEventListener(eventName: string, listener: EventListener): boolean {
		if (!this.eventBus) {
			this.eventBus = new EventBus();
		}

		return this.eventBus.registerEventListener(eventName, listener);
	}

	/**
	 * Unregisters an event listener for the given event.
	 * If the event bus has not been initialized, then nothing happens.
	 *
	 * @param event The event to unregister from.
	 * @param listener The listener to unregister.
	 * @return True if the listener was unregistered; otherwise false.
	 */
	unregisterEventListener(event: TetrisEvent, listener: EventListener): boolean {
		if (!this.eventBus) {
			return false;
		}

		return this.eventBus.unregisterEventListener(event.name, listener);
	}

	/**
	 * Unregisters all listeners for the given event.
	 * If the event bus has not been initialized, then nothing happens.
	 *
	 * @param event The event to unregister from.
	 * @return True if the event was unregistered; otherwise false.
	 */
	unregisterAllEventListeners(event: TetrisEvent): boolean {
		if (!this.eventBus) {
			return false;
		}

		return this.eventBus.unregisterAllEventListeners(event.name);
	}

	/**
	 * Throws an event if the eventBus has been initialized.
	 *
	 * @param event The event to throw.
	 */
	throwEvent(event: Event): void {
		if (!this.eventBus) {
			return;
		}

		this.eventBus.throwEvent(event);
	}

	// protected static record PQEntry<T>(T data, int priority) implements Comparable<PQEntry<T>> {
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
	// protected PQEntry<Position> positionSearchEntry(Position newPosition, Position goalPosition) {
	// 	return new PQEntry<Position>(
	// 		new Position(newPosition),
	// 		newPosition.sqrdist(goalPosition)
	// 	);
	// }

	/**
	 * Resets the piece to the top of the board with the next shape.
	 */
	protected nextPiece(): void {
		this._state.resetPiece();
		this.throwEvent(TetrisEvent.PIECE_CREATE(this).add({
      _nextShapes: this._state.nextShapes
    }));
	}
}
