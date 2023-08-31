import { Event, EventData } from './Event';
import Piece from './Piece';
import Tetris from './Tetris';

export default class TetrisEvent extends Event {
  // Events that transmit a copy of the whole game state:
  static NEW_GAME(tetris: Tetris): TetrisEvent { return new TetrisEvent('NEW_GAME').withState(tetris); }
  static START(tetris: Tetris): TetrisEvent { return new TetrisEvent('START').withState(tetris); }
  static STOP(tetris: Tetris): TetrisEvent { return new TetrisEvent('STOP').withState(tetris); }
  static RESET(tetris: Tetris): TetrisEvent { return new TetrisEvent('RESET').withState(tetris); }
  static GAMELOOP(tetris: Tetris): TetrisEvent { return new TetrisEvent('GAMELOOP').withState(tetris); }
  static GAME_OVER(tetris: Tetris): TetrisEvent { return new TetrisEvent('GAME_OVER').withState(tetris); }

  // Events that transmit no extra data:
  static PAUSE(): TetrisEvent { return new TetrisEvent('PAUSE'); }
  static RESUME(): TetrisEvent { return new TetrisEvent('RESUME'); }
  static GRAVITY_ENABLED(): TetrisEvent { return new TetrisEvent('GRAVITY_ENABLED'); }
  static GRAVITY_DISABLED(): TetrisEvent { return new TetrisEvent('GRAVITY_DISABLED'); }

  // Events that transmit a copy the current piece:
  static PIECE_CREATE(tetris: Tetris): TetrisEvent { return new TetrisEvent('PIECE_CREATE').withPieceData(tetris); }
  static PIECE_SHIFT(tetris: Tetris): TetrisEvent { return new TetrisEvent('PIECE_SHIFT').withPieceData(tetris); }
  static PIECE_ROTATE(tetris: Tetris): TetrisEvent { return new TetrisEvent('PIECE_ROTATE').withPieceData(tetris); }
  static PIECE_PLACED(tetris: Tetris): TetrisEvent { return new TetrisEvent('PIECE_PLACED').withPieceData(tetris); }

  // Events that transmit partial game state:
  // LINE_CLEAR, SCORE_UPDATE, LEVEL_UPDATE
  static LINE_CLEAR(tetris: Tetris, lines: number[]): TetrisEvent {
    return new TetrisEvent('LINE_CLEAR', {
      lines,
      _linesCleared: tetris.state.linesCleared,
      _linesUntilNextLevel: tetris.state.linesUntilNextLevel
    });
  }
  static SCORE_UPDATE(tetris: Tetris): TetrisEvent {
    return new TetrisEvent('SCORE_UPDATE').add({ _score: tetris.state.score });
  }
  static LEVEL_UPDATE(tetris: Tetris): TetrisEvent {
    return new TetrisEvent('LEVEL_UPDATE').add({ _level: tetris.state.level });
  }

  // Events that transmit a copy of the board:
  static BLOCKS(tetris: Tetris): TetrisEvent {
    return new TetrisEvent('BLOCKS').add({ _board: tetris.state.board });
  }

  static readonly ALL: string[] = [
    'NEW_GAME', 'START', 'STOP', 'RESET', 'GAMELOOP', 'GAME_OVER',
    'PAUSE', 'RESUME', 'GRAVITY_ENABLED', 'GRAVITY_DISABLED',
    'PIECE_CREATE', 'PIECE_SHIFT', 'PIECE_ROTATE', 'PIECE_PLACED',
    'LINE_CLEAR', 'SCORE_UPDATE', 'LEVEL_UPDATE', 'BLOCKS'
  ];

  constructor(name: string, data: EventData = {}) {
    super(name, data);
  }

  add(data: EventData): TetrisEvent {
    return super.add(data) as TetrisEvent;
  }

  hasState(): boolean { return this.hasData('state'); }

  withState(tetris: Tetris): TetrisEvent { return this.add({ state: tetris.state }); }
  withPieceData(tetris: Tetris): TetrisEvent { return this.add({ _piece: Piece.copy(tetris.state.piece) }); }
};
