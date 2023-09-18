import { Event, EventData } from '../event/Event';
import Piece from './Piece';
import Tetris from './Tetris';

/**
 * Represents an event that can be emitted by a Tetris instance.
 */
export default class TetrisEvent extends Event {
  // Events that transmit a copy of the whole game state:
  /** Creates a new TetrisEvent with the given game's state. */
  static NEW_GAME(tetris: Tetris): TetrisEvent { return new TetrisEvent('NEW_GAME').withState(tetris); }
  /** Creates a new TetrisEvent with the given game's state. */
  static START(tetris: Tetris): TetrisEvent { return new TetrisEvent('START').withState(tetris); }
  /** Creates a new TetrisEvent with the given game's state. */
  static STOP(tetris: Tetris): TetrisEvent { return new TetrisEvent('STOP').withState(tetris); }
  /** Creates a new TetrisEvent with the given game's state. */
  static RESET(tetris: Tetris): TetrisEvent { return new TetrisEvent('RESET').withState(tetris); }
  /** Creates a new TetrisEvent with the given game's state. */
  static GAMELOOP(tetris: Tetris): TetrisEvent { return new TetrisEvent('GAMELOOP').withState(tetris); }
  /** Creates a new TetrisEvent with the given game's state. */
  static GAME_OVER(tetris: Tetris): TetrisEvent { return new TetrisEvent('GAME_OVER').withState(tetris); }

  // Events that transmit no extra data:
  /** Creates a new TetrisEvent with no extra data. */
  static PAUSE(): TetrisEvent { return new TetrisEvent('PAUSE'); }
  /** Creates a new TetrisEvent with no extra data. */
  static RESUME(): TetrisEvent { return new TetrisEvent('RESUME'); }
  /** Creates a new TetrisEvent with no extra data. */
  static GRAVITY_ENABLED(): TetrisEvent { return new TetrisEvent('GRAVITY_ENABLED'); }
  /** Creates a new TetrisEvent with no extra data. */
  static GRAVITY_DISABLED(): TetrisEvent { return new TetrisEvent('GRAVITY_DISABLED'); }

  // Events that transmit a copy the current piece:
  /** Creates a new TetrisEvent with the given game's current piece data. */
  static PIECE_CREATE(tetris: Tetris): TetrisEvent { return new TetrisEvent('PIECE_CREATE').withPieceData(tetris); }
  /** Creates a new TetrisEvent with the given game's current piece data. */
  static PIECE_SHIFT(tetris: Tetris): TetrisEvent { return new TetrisEvent('PIECE_SHIFT').withPieceData(tetris); }
  /** Creates a new TetrisEvent with the given game's current piece data. */
  static PIECE_ROTATE(tetris: Tetris): TetrisEvent { return new TetrisEvent('PIECE_ROTATE').withPieceData(tetris); }
  /** Creates a new TetrisEvent with the given game's current piece data. */
  static PIECE_PLACED(tetris: Tetris): TetrisEvent { return new TetrisEvent('PIECE_PLACED').withPieceData(tetris); }

  // Events that transmit partial game state:
  /**
   * Creates a new TetrisEvent with the given game's line clear data.
   *
   * @param tetris The Tetris instance to get the line clear data from.
   * @param lines The lines that were cleared.
   */
  static LINE_CLEAR(tetris: Tetris, lines: number[]): TetrisEvent {
    const state = tetris.getState();
    return new TetrisEvent('LINE_CLEAR', {
      lines,
      _linesCleared: state.linesCleared,
      _linesUntilNextLevel: state.linesUntilNextLevel
    });
  }

  /** Creates a new TetrisEvent with the given game's score data. */
  static SCORE_UPDATE(tetris: Tetris): TetrisEvent {
    return new TetrisEvent('SCORE_UPDATE').add({ _score: tetris.getState().score });
  }

  /** Creates a new TetrisEvent with the given game's level data. */
  static LEVEL_UPDATE(tetris: Tetris): TetrisEvent {
    return new TetrisEvent('LEVEL_UPDATE').add({ _level: tetris.getState().level });
  }

  /** Creates a new TetrisEvent with the given game's board data. */
  static BLOCKS(tetris: Tetris): TetrisEvent {
    return new TetrisEvent('BLOCKS').add({ _board: tetris.getState().board });
  }

  /** Contains the names of all TetrisEvents. */
  static readonly ALL: string[] = [
    'NEW_GAME', 'START', 'STOP', 'RESET', 'GAMELOOP', 'GAME_OVER',
    'PAUSE', 'RESUME', 'GRAVITY_ENABLED', 'GRAVITY_DISABLED',
    'PIECE_CREATE', 'PIECE_SHIFT', 'PIECE_ROTATE', 'PIECE_PLACED',
    'LINE_CLEAR', 'SCORE_UPDATE', 'LEVEL_UPDATE', 'BLOCKS'
  ];

  /**
   * Creates a new TetrisEvent with the given name and optional data.
   */
  constructor(name: string, data: EventData = {}) {
    super(name, data);
  }

  /**
   * Adds the given data to the event.
   *
   * @param data The data to add.
   * @returns This TetrisEvent.
   */
  add(data: EventData): TetrisEvent {
    return super.add(data) as TetrisEvent;
  }

  /**
   * Gets whether the event has 'state' as a data property.
   *
   * @returns True if the event has 'state' as a data property; false otherwise.
   */
  hasState(): boolean {
    return this.hasData('state');
  }

  /**
   * Adds the game state of the given Tetris instance to the event.
   *
   * @param tetris The Tetris instance to get the game state from.
   * @returns This TetrisEvent.
   */
  withState(tetris: Tetris): TetrisEvent {
    return this.add({ state: tetris.getState() });
  }

  /**
   * Adds the current piece of the given Tetris instance to the event.
   *
   * @param tetris The Tetris instance to get the current piece from.
   * @returns This TetrisEvent.
   */
  withPieceData(tetris: Tetris): TetrisEvent {
    return this.add({ _piece: Piece.copy(tetris.getState().piece) });
  }
};

/** Contains the names of all TetrisEvents. */
export type TetrisEventNames =
  'NEW_GAME' | 'START' | 'STOP' | 'RESET' | 'GAMELOOP' | 'GAME_OVER' |
  'PAUSE' | 'RESUME' | 'GRAVITY_ENABLED' | 'GRAVITY_DISABLED' |
  'PIECE_CREATE' | 'PIECE_SHIFT' | 'PIECE_ROTATE' | 'PIECE_PLACED' |
  'LINE_CLEAR' | 'SCORE_UPDATE' | 'LEVEL_UPDATE' | 'BLOCKS';
