import Tetris from "./Tetris";
import TetrisEvent from "./TetrisEvent";
import TetrisState from "./TetrisState";

describe('TetrisEvent', () => {
  let event: TetrisEvent;

  beforeEach(() => {
    event = new TetrisEvent('TEST');
  });

  describe('constructor', () => {
    test('creates an event with the given name and no extra data', () => {
      const event = new TetrisEvent('TEST');
      expect(event.name).toBe('TEST');
      expect(event.data).toEqual({});
    });

    test('creates an event with the given name and data', () => {
      const event = new TetrisEvent('TEST', { a: 1, b: 2 });
      expect(event.name).toBe('TEST');
      expect(event.data).toEqual({ a: 1, b: 2 });
    });
  });

  describe('add', () => {
    test('adds the given data to the event', () => {
      event.add({ a: 1, b: 2 });
      expect(event.data).toEqual({ a: 1, b: 2 });
    });

    test('overwrites existing data', () => {
      event.add({ a: 1, b: 2 });
      expect(event.data).toEqual({ a: 1, b: 2 });
      event.add({ b: 3 });
      expect(event.data).toEqual({ a: 1, b: 3 });
    });

    test('returns itself', () => {
      expect(event.add({})).toBe(event);
    });
  });

  describe('withState', () => {
    test('adds the given game state to the event', () => {
      const tetris = new Tetris();
      const state = new TetrisState();
      jest.spyOn(tetris, 'state', 'get').mockReturnValue(state);

      event.withState(tetris);
      expect(event.data).toEqual({ state });
    });

    test('returns itself', () => {
      expect(event.withState(new Tetris())).toBe(event);
    });
  });

  describe('withPieceData', () => {
    test('adds the given piece data to the event', () => {
      const tetris = new Tetris();
      const state = new TetrisState();
      const piece = state.piece;
      jest.spyOn(tetris, 'state', 'get').mockReturnValue(state);
      jest.spyOn(state, 'piece', 'get').mockReturnValue(piece);

      event.withPieceData(tetris);
      expect(event.data).toEqual({ _piece: piece });
    });

    test('returns itself', () => {
      expect(event.withPieceData(new Tetris())).toBe(event);
    });
  });
});
