import Coord from "../structs/Coord";
import Move from "../structs/Move";
import Position from "../structs/Position";
import { Shape } from "./Shape";
import TetrisState from "./TetrisState";

describe('TetrisState', () => {
  let state: TetrisState;

  beforeEach(() => {
    state = new TetrisState();
  });

  describe('static', () => {
    describe('calcEntryColumn', () => {
      describe('when the number of columns is not a positive integer', () => {
        test('throws an error', () => {
          const badColses = [-10, -1, 0, 1.5, 5.5, 10.1];

          badColses.forEach((cols) => {
            expect(() => TetrisState.calcEntryColumn(cols)).toThrow();
          });
        });
      });

      describe('when the number of columns is even', () => {
        test('returns the column just left of center', () => {
          const colses = [
            { cols: 6, expectedEntry: 2},
            { cols: 8, expectedEntry: 3},
            { cols: 10, expectedEntry: 4},
            { cols: 20, expectedEntry: 9}
          ];

          colses.forEach((cols) => {
            expect(TetrisState.calcEntryColumn(cols.cols)).toEqual(cols.expectedEntry);
          });
        });
      });

      describe('when the number of columns is odd', () => {
        test('returns the center column', () => {
          const colses = [
            { cols: 5, expectedEntry: 2},
            { cols: 7, expectedEntry: 3},
            { cols: 9, expectedEntry: 4},
            { cols: 11, expectedEntry: 5},
            { cols: 21, expectedEntry: 10}
          ];

          colses.forEach((cols) => {
            expect(TetrisState.calcEntryColumn(cols.cols)).toEqual(cols.expectedEntry);
          });
        });
      });
    });
  });

  describe('constructor', () => {
    describe('when the number of rows is not a positive integer', () => {
      test('throws an error', () => {
        const badRowses = [-10, -1, 0, 1.5, 5.5, 10.1];

        badRowses.forEach((rows) => {
          expect(() => new TetrisState(rows, 10)).toThrow();
        });
      });
    });

    describe('when the number of columns is not a positive integer', () => {
      test('throws an error', () => {
        const badColses = [-10, -1, 0, 1.5, 5.5, 10.1];

        badColses.forEach((cols) => {
          expect(() => new TetrisState(10, cols)).toThrow();
        });
      });
    });

    describe('when the number of rows and columns are positive integers', () => {
      test('creates a state with the given number of rows and columns', () => {
        const rows = 10;
        const cols = 20;
        const state = new TetrisState(rows, cols);

        expect(state.rows).toEqual(rows);
        expect(state.cols).toEqual(cols);
      });
    });
  });

  describe('linesPerLevel', () => {
    describe('when linesPerLevel is a number', () => {
      test('returns the number', () => {
        expect(state.linesPerLevel()).toEqual(TetrisState.DEFAULT_LINES_PER_LEVEL);
      });
    });

    describe('when linesPerLevel is a function', () => {
      test('returns the result of the function', () => {
        const expectedVal = 42;
        const linesPerLevel = jest.fn(() => expectedVal);
        const state = new TetrisState(10, 20, TetrisState.DEFAULT_ENTRY_COORD, linesPerLevel);

        expect(state.linesPerLevel()).toEqual(expectedVal);
      });
    });
  });

  describe('getNextShapes', () => {
    test('returns the expected number of shapes', () => {
      const numShapes = 5;
      const shapes = state.getNextShapes(numShapes);

      expect(shapes.length).toEqual(numShapes);
    });
  });

  describe('get/set Cell', () => {
    let location: Coord;

    beforeEach(() => {
      location = new Coord(0, 0);
    });

    describe('when the given row is out of bounds', () => {
      test('throws an error', () => {
        [-1, state.rows].forEach((row) => {
          location.row = row;
          expect(() => state.getCell(location)).toThrow();
          expect(() => state.setCell(location, 0)).toThrow();
        });
      });
    });

    describe('when the given column is out of bounds', () => {
      test('throws an error', () => {
        [-1, state.cols].forEach((col) => {
          location.col = col;
          expect(() => state.getCell(location)).toThrow();
          expect(() => state.setCell(location, 0)).toThrow();
        });
      });
    });

    describe('when the given row and column are in bounds', () => {
      test('returns the expected value', () => {
        const expectedVal = 42;

        state.setCell(location, expectedVal);
        expect(state.getCell(location)).toEqual(expectedVal);
      });
    });
  });

  describe('get/set CellByIndex', () => {
    let index: number;

    beforeEach(() => {
      index = 0;
    });

    describe('when the given index is out of bounds', () => {
      test('throws an error', () => {
        [-1, state.rows * state.cols].forEach((index) => {
          expect(() => state.getCellByIndex(index)).toThrow();
          expect(() => state.setCellByIndex(index, 0)).toThrow();
        });
      });
    });

    describe('when the given index is in bounds', () => {
      test('returns the expected value', () => {
        const expectedVal = 42;

        state.setCellByIndex(index, expectedVal);
        expect(state.getCellByIndex(index)).toEqual(expectedVal);
      });
    });
  });

  describe('isCellEmpty', () => {
    describe('when the given location is out of bounds', () => {
      test('throws an error', () => {
        [
          new Coord(-1, 0),
          new Coord(state.rows, 0),
          new Coord(0, -1),
          new Coord(0, state.cols)
        ].forEach((location) => {
          expect(() => state.isCellEmpty(location)).toThrow();
        });
      });
    });

    describe('when the given location is in bounds', () => {
      test('returns true if the cell is empty', () => {
        const location = new Coord(0, 0);

        expect(state.isCellEmpty(location)).toEqual(true);
      });

      test('returns false if the cell is not empty', () => {
        const location = new Coord(0, 0);

        state.setCell(location, 42);
        expect(state.isCellEmpty(location)).toEqual(false);
      });
    });
  });

  describe('isLocationValid', () => {
    describe('when the given location is out of bounds', () => {
      test('returns false', () => {
        [
          new Coord(-1, 0),
          new Coord(state.rows, 0),
          new Coord(0, -1),
          new Coord(0, state.cols)
        ].forEach((location) => {
          expect(state.isLocationValid(location)).toEqual(false);
        });
      });
    });

    describe('when the given location is in bounds', () => {
      test('returns true', () => {
        [
          new Coord(0, 0),
          new Coord(state.rows - 1, 0),
          new Coord(0, state.cols - 1),
          new Coord(state.rows - 1, state.cols - 1)
        ].forEach((location) => {
          expect(state.isLocationValid(location)).toEqual(true);
        });
      });
    });
  });

  describe('isCurrentPieceLocationValid', () => {
    describe('delegates to isPositionValid with current piece position', () => {
      test('returns the expected value', () => {
        const expectedVal = true;
        state.isPositionValid = jest.fn(() => expectedVal);

        expect(state.isCurrentPieceLocationValid()).toEqual(expectedVal);
        expect(state.isPositionValid).toHaveBeenCalledWith(state.piece.position);
      });
    });
  });

  describe('isPositionValid', () => {
    let position: Position;
    let shape: Shape;

    beforeEach(() => {
      // Sets the piece to T block.
      shape = Shape.T;
      state.setNextShape(shape);
      state.resetPiece();

      position = new Position(new Coord(0, 0), 0, shape.numRotations);
    });

    describe('when the given location is invalid', () => {
      test('returns false', () => {
        position.row = -1;
        expect(state.isPositionValid(position)).toEqual(false);
      });
    });

    describe('when any of the piece block locations would be invalid at the given position', () => {
      test('returns false', () => {
        position.row = 1;
        // (0,0) is not a valid location for the T block
        // because one of the arms would clip the left wall.
        expect(state.isPositionValid(position)).toEqual(false);
      });
    });

    describe('when there is a block in the way', () => {
      test('returns false', () => {
        state.setCell(new Coord(1, 0), 42);
        expect(state.isPositionValid(position)).toEqual(false);
      });
    });

    describe('when the block locations would be valid and the board clear', () => {
      test('returns true', () => {
        position.row = 1;
        position.col = 1;
        expect(state.isPositionValid(position)).toEqual(true);
      });
    });
  });

  describe('canPieceMove', () => {
    let move: Move;

    beforeEach(() => {
      move = Move.DOWN;
    });

    describe('when the game is over', () => {
      test('returns false', () => {
        state.isGameOver = true;
        expect(state.canPieceMove(move)).toEqual(false);
      });
    });

    describe('when the piece is inactive', () => {
      test('returns false', () => {
        state.piece.disable();
        expect(state.canPieceMove(move)).toEqual(false);
      });
    });

    describe('when the game is paused', () => {
      test('returns false', () => {
        state.isPaused = true;
        expect(state.canPieceMove(move)).toEqual(false);
      });
    });

    describe('when the move is trying to hoist the piece up', () => {
      test('returns false', () => {
        move = Move.UP;
        expect(state.canPieceMove(move)).toEqual(false);
      });
    });

    describe('when the new piece block locations would be invalid', () => {
      test('returns false', () => {
        state.isPositionValid = jest.fn(() => false);
        expect(state.canPieceMove(move)).toEqual(false);
      });
    });

    describe(
      'when the game is active in progress, the piece is active, ' +
      'the move is not going UP, and the new piece block locations would be valid',
    () => {
      test('returns true', () => {
        expect(state.canPieceMove(move)).toEqual(true);
      });
    });
  });

  describe('validateRotation', () => {
    let move: Move;

    beforeEach(() => {
      move = Move.CLOCKWISE;
    });

    describe('when the move is not either CLOCKWISE or COUNTERCLOCKWISE', () => {
      test('returns STAND', () => {
        move = Move.LEFT;
        expect(state.validateRotation(move).equals(Move.STAND)).toEqual(true);
      });
    });

    describe('when the rotation is valid without needing shift adjustments', () => {
      test('returns a copy of the given move', () => {
        expect(state.validateRotation(move).equals(move)).toEqual(true);
      });
    });

    describe('when shifting the piece right or left would accomodate the rotation', () => {
      test('returns a move with the appropriate shift and rotation', () => {
        // The I block (rotation: 1) against the wall is a good example.
        state.piece.shape = Shape.I;
        state.piece.move(new Move(new Coord(0, -3), 1));

        const expectedMove = Move.copy(Move.RIGHT).add(Move.CLOCKWISE);
        expect(state.validateRotation(move)).toEqual(expectedMove);
      });
    });

    describe('when shifting the piece right or left would not accomodate the rotation', () => {
      test('returns STAND, (as in the piece cannot move)', () => {
        // Use the I block again, but block its rotation by placing a block in the way.
        state.piece.shape = Shape.I;
        state.piece.move(new Move(new Coord(0, -3), 1));
        state.setCell(new Coord(state.piece.position.row, 2), 1);

        expect(state.validateRotation(move).equals(Move.STAND)).toEqual(true);
      });
    });
  });

  describe('getShapeCoordsAtPosition', () => {
    test('returns the expected piece coordinates', () => {
      const testMap = [
        {
          shape: Shape.T,
          position: new Position(new Coord(3, 3), 0, Shape.T.numRotations),
          expectedCoords: [
            new Coord(3, 2),
            new Coord(3, 3),
            new Coord(3, 4),
            new Coord(4, 3)
          ]
        },
        {
          shape: Shape.T,
          position: new Position(new Coord(16, 0), 1, Shape.T.numRotations),
          expectedCoords: [
            new Coord(15, 0),
            new Coord(16, 0),
            new Coord(16, 1),
            new Coord(17, 0)
          ]
        },
        {
          shape: Shape.S,
          position: new Position(new Coord(5, 6), 1, Shape.S.numRotations),
          expectedCoords: [
            new Coord(5, 6),
            new Coord(4, 6),
            new Coord(5, 7),
            new Coord(6, 7)
          ]
        }
      ];

      testMap.forEach((test) => {
        state.piece.shape = test.shape;
        expect(state.getShapeCoordsAtPosition(test.position)).toEqual(test.expectedCoords);
      });
    });
  });

  describe('getFullRows', () => {
    describe('when no rows are full', () => {
      test('returns an empty array', () => {
        expect(state.getFullRows()).toEqual([]);
      });
    });

    describe('when some rows are full', () => {
      test('returns the expected full rows', () => {
        const expectedRows = [2, 4, 6];
        expectedRows.forEach((row) => {
          for (let col = 0; col < state.cols; col++) {
            state.setCell(new Coord(row, col), 42);
          }
        });

        expect(state.getFullRows()).toEqual(expectedRows);
      });
    });
  });

  describe('pieceOverlapsBlocks', () => {
    describe('when the piece is inactive', () => {
      test('returns false', () => {
        state.piece.disable();
        expect(state.pieceOverlapsBlocks()).toEqual(false);
      });
    });

    describe('when the piece is active', () => {
      describe('when the piece overlaps a block', () => {
        test('returns true', () => {
          jest.spyOn(state.piece, 'intersects').mockReturnValue(true);
          expect(state.pieceOverlapsBlocks()).toEqual(true);
        });
      });

      describe('when the piece does not overlap a block', () => {
        test('returns false', () => {
          jest.spyOn(state.piece, 'intersects').mockReturnValue(false);
          expect(state.pieceOverlapsBlocks()).toEqual(false);
        });
      });
    });
  });

  describe('placePiece', () => {
    describe('when the piece is inactive', () => {
      beforeEach(() => {
        state.piece.disable();
        jest.spyOn(state.piece, 'disable');
        jest.spyOn(state, 'setCell');
      });

      test('does nothing', () => {
        expect(state.setCell).not.toHaveBeenCalled();
        expect(state.piece.disable).not.toHaveBeenCalled();
      });
    });

    describe('when the piece is active', () => {
      test('sets the piece cells to the current shape value', () => {
        const expectedVal = state.piece.shape.value;
        state.placePiece();
        state.piece.blockCoords.forEach((coord) => {
          expect(state.getCell(coord)).toEqual(expectedVal);
        });
      });

      test('disables the piece', () => {
        jest.spyOn(state.piece, 'disable');
        jest.spyOn(state, 'setCell');

        const pieceBlocks = state.piece.blockCoords;

        state.placePiece();

        expect(state.piece.disable).toHaveBeenCalled();
        pieceBlocks.forEach((coord) => {
          expect(state.setCell).toHaveBeenCalledWith(coord, state.piece.shape.value);
        });
      });
    });
  });

  describe('resetPiece', () => {
    test('calls reset on piece with the entryCoord and next shape from the queue', () => {
      const expectedShape = Shape.T;
      state.setNextShape(expectedShape);
      jest.spyOn(state.piece, 'reset');

      state.resetPiece();

      expect(state.piece.reset).toHaveBeenCalledWith(state.entryCoord, expectedShape);
    });
  });

  describe('setNextShape', () => {
    test('sets the next shape', () => {
      const expectedShape = Shape.T;
      state.setNextShape(expectedShape);
      expect(state.getNextShape()).toEqual(expectedShape);
      expect(state.getNextShapes(1)).toEqual([expectedShape]);
    });
  });

  describe('isRunning', () => {
    describe('when the game has not yet started', () => {
      test('returns false', () => {
        expect(state.isRunning()).toEqual(false);
      });
    });

    describe('when the game has started', () => {
      beforeEach(() => {
        state.hasStarted = true;
      });

      describe('when the game is over', () => {
        test('returns false', () => {
          state.isGameOver = true;
          expect(state.isRunning()).toEqual(false);
        });
      });

      describe('when the game is not over', () => {
        test('returns true', () => {
          expect(state.isRunning()).toEqual(true);
        });
      });
    });
  });
});
