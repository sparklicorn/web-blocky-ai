import EventBus from "../event/EventBus";
import { Event, EventListener } from "../event/Event";
import Move from "../structs/Move";
import Tetris from "./Tetris";
import TetrisEvent, { TetrisEventName } from "./TetrisEvent";
import TetrisState from "./TetrisState";

const mockTimer = {
  delayNextTick: jest.fn(),
  start: jest.fn(),
  stop: jest.fn(),
};

jest.mock('../util/Timer', () => jest.fn().mockImplementation(() => mockTimer));

describe("Tetris", () => {
  let state: TetrisState;
  let tetris: Tetris;

  beforeEach(() => {
    jest.clearAllMocks();
    state = new TetrisState();
    tetris = new Tetris(state);
    tetris.newGame();
  });

  const expectEventsThrown = (eventNames: TetrisEventName[], exe: () => any) => {
    const mockEvents = eventNames.map(eventName => new TetrisEvent(eventName));
    eventNames.forEach((eventName, index) => {
      jest.spyOn(TetrisEvent, eventName).mockReturnValue(mockEvents[index]);
    });
    jest.spyOn(tetris, 'throwEvent');
    exe();
    eventNames.forEach((eventName, index) => {
      expect(TetrisEvent[eventName]).toHaveBeenCalled();
      expect(tetris.throwEvent).toHaveBeenCalledWith(mockEvents[index]);
    });
  };

  const expectEventThrown = (eventName: TetrisEventName, exe: () => any) => expectEventsThrown([eventName], exe);

  const expectEventNotThrown = (eventName: TetrisEventName, exe: () => any) => {
    const mockEvent = new TetrisEvent(eventName);
    jest.spyOn(TetrisEvent, eventName).mockReturnValue(mockEvent);
    jest.spyOn(tetris, 'throwEvent');
    exe();
    expect(TetrisEvent[eventName]).not.toHaveBeenCalled();
    expect(tetris.throwEvent).not.toHaveBeenCalledWith(mockEvent);
  };

  const expectNoEventsThrown = (exe: () => any) => {
    jest.spyOn(tetris, 'throwEvent');
    exe();
    expect(tetris.throwEvent).not.toHaveBeenCalled();
  };

  const expectMethodsCalled = (methodNames: string[], exe: () => any) => {
    const _tetris = tetris as any;
    methodNames.forEach(methodName => jest.spyOn(_tetris, methodName));
    exe();
    methodNames.forEach(methodName => expect(_tetris[methodName]).toHaveBeenCalled());
  };

  const expectMethodsNotCalled = (methodNames: string[], exe: () => any) => {
    const _tetris = tetris as any;
    methodNames.forEach(methodName => jest.spyOn(_tetris, methodName));
    exe();
    methodNames.forEach(methodName => expect(_tetris[methodName]).not.toHaveBeenCalled());
  };

  const expectMethodCalled = (methodName: string, exe: () => any) => expectMethodsCalled([methodName], exe);
  const expectMethodNotCalled = (methodName: string, exe: () => any) => expectMethodsNotCalled([methodName], exe);

  const expectStateMethodsCalled = (methodNames: string[], exe: () => any) => {
    const _state = state as any;
    methodNames.forEach(methodName => jest.spyOn(_state, methodName));
    exe();
    methodNames.forEach(methodName => expect(_state[methodName]).toHaveBeenCalled());
  };

  const expectStateMethodsNotCalled = (methodNames: string[], exe: () => any) => {
    const _state = state as any;
    methodNames.forEach(methodName => jest.spyOn(_state, methodName));
    exe();
    methodNames.forEach(methodName => expect(_state[methodName]).not.toHaveBeenCalled());
  };

  const expectStateMethodCalled = (methodName: string, exe: () => any) => expectStateMethodsCalled([methodName], exe);
  const expectStateMethodNotCalled = (methodName: string, exe: () => any) => expectStateMethodsNotCalled([methodName], exe);

  describe('newGame', () => {
    test('defers to reset and throws NEW_GAME event', () => {
      expectMethodCalled('reset', () => tetris.newGame());
      expectEventThrown('NEW_GAME', () => tetris.newGame());
    });
  });

  describe('start', () => {
    describe('when the game has already started', () => {
      beforeEach(() => {
        jest.spyOn(state, 'hasStarted', 'get').mockReturnValue(true);
      });

      test('does not throw an event', () => {
        expectNoEventsThrown(() => tetris.start(0, false));
      });
    });

    describe('when the game has not yet started', () => {
      test('sets to the given level', () => {
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(level => {
          tetris.newGame();
          tetris.start(level, false);
          expect(state.level).toBe(level);
        });
      });

      const startWithoutGravity = () => tetris.start(0, false);

      test('defers to nextPiece', () => {
        expectMethodCalled('nextPiece', startWithoutGravity);
      });

      test('throws START event', () => {
        expectEventThrown('START', startWithoutGravity);
      });

      describe('when useGravity is true', () => {
        test('enables gravity and sets the timer delay', () => {
          expectMethodsCalled(
            [ 'enableGravity', 'updateGravityTimerDelayMs' ],
            () => tetris.start(0, true)
          );
        });
      });

      describe('when useGravity is false', () => {
        test('does not enable gravity or update the timer delay', () => {
          expectMethodsNotCalled(
            [ 'enableGravity', 'updateGravityTimerDelayMs' ],
            startWithoutGravity
          );
        });
      });
    });
  });

  describe('stop', () => {
    test('sets isPaused, isGameOver, isClearingLines', () => {
      tetris.stop();
      expect(state.isPaused).toBe(false);
      expect(state.isGameOver).toBe(true);
      expect(state.isClearingLines).toBe(false);
    });

    test('defers to state placePiece and throws STOP event', () => {
      expectStateMethodCalled('placePiece', () => tetris.stop());
      expectEventThrown('STOP', () => tetris.stop());
    });

    describe('when gravity is enabled', () => {
      beforeEach(() => {
        jest.spyOn(tetris, 'isGravityEnabled').mockReturnValue(true);
      });

      test('stops the gravity timer', () => {
        tetris.stop();
        expect(mockTimer.stop).toHaveBeenCalled();
      });
    });
  });

  describe('pause', () => {
    describe('when the game is over', () => {
      beforeEach(() => {
        jest.spyOn(state, 'isGameOver', 'get').mockReturnValue(true);
      });

      test('does not throw PAUSE event', () => {
        expectNoEventsThrown(() => tetris.pause());
      });
    });

    describe('when the game is already paused', () => {
      beforeEach(() => {
        jest.spyOn(state, 'isPaused', 'get').mockReturnValue(true);
      });

      test('does not throw PAUSE event', () => {
        expectNoEventsThrown(() => tetris.pause());
      });
    });

    describe('when the game has not yet started', () => {
      beforeEach(() => {
        jest.spyOn(state, 'hasStarted', 'get').mockReturnValue(false);
      });

      test('does not throw PAUSE event', () => {
        expectNoEventsThrown(() => tetris.pause());
      });
    });

    describe('when the game is started, not yet over, and not paused', () => {
      beforeEach(() => {
        jest.spyOn(state, 'isGameOver', 'get').mockReturnValue(false);
        jest.spyOn(state, 'isPaused', 'get').mockReturnValueOnce(false);
        jest.spyOn(state, 'hasStarted', 'get').mockReturnValue(true);
      });

      test('sets isPaused on state', () => {
        tetris.pause();
        expect(state.isPaused).toBe(true);
      });

      test('throws PAUSE event', () => {
        expectEventThrown('PAUSE', () => tetris.pause());
      });

      describe('when gravity is enabled', () => {
        beforeEach(() => {
          jest.spyOn(tetris, 'isGravityEnabled').mockReturnValue(true);
        });

        test('stops the gravity timer', () => {
          tetris.pause();
          expect(mockTimer.stop).toHaveBeenCalled();
        });
      });
    });
  });

  describe('resume', () => {
    describe('when the game has not yet started', () => {
      beforeEach(() => {
        jest.spyOn(state, 'hasStarted', 'get').mockReturnValue(false);
      });

      test('does not throw RESUME event', () => {
        expectNoEventsThrown(() => tetris.resume());
      });
    });

    describe('when the game has been started', () => {
      beforeEach(() => {
        jest.spyOn(state, 'hasStarted', 'get').mockReturnValue(true);
      });

      describe('when the game is over', () => {
        beforeEach(() => {
          jest.spyOn(state, 'isGameOver', 'get').mockReturnValue(true);
        });

        test('does not throw RESUME event', () => {
          expectNoEventsThrown(() => tetris.resume());
        });
      });

      describe('when the game is not over', () => {
        beforeEach(() => {
          jest.spyOn(state, 'isGameOver', 'get').mockReturnValue(false);
        });

        test('sets isPaused', () => {
          tetris.resume();
          expect(state.isPaused).toBe(false);
        });

        test('throws RESUME event', () => {
          expectEventThrown('RESUME', () => tetris.resume());
        });

        describe('when gravity is enabled', () => {
          beforeEach(() => {
            jest.spyOn(tetris, 'isGravityEnabled').mockReturnValue(true);
          });

          test('starts the gravity timer', () => {
            const gravityDelayMs = 1234;
            jest.spyOn(tetris, 'gravityDelayMsForLevel').mockReturnValue(gravityDelayMs);
            tetris.resume();
            expect(mockTimer.start).toHaveBeenCalledWith(gravityDelayMs);
          });
        });
      });
    });
  });

  describe('moveLeft', () => {
    test('defers to shift with the appropriate offset', () => {
      jest.spyOn(tetris, 'shift');
      tetris.moveLeft();
      expect(tetris.shift).toHaveBeenCalledWith(0, -1);
    });
  });

  describe('moveRight', () => {
    test('defers to shift with the appropriate offset', () => {
      jest.spyOn(tetris, 'shift');
      tetris.moveRight();
      expect(tetris.shift).toHaveBeenCalledWith(0, 1);
    });
  });

  describe('moveDown', () => {
    test('defers to shift with the appropriate offset', () => {
      jest.spyOn(tetris, 'shift');
      tetris.moveDown();
      expect(tetris.shift).toHaveBeenCalledWith(1, 0);
    });
  });

  describe('rotateClockwise', () => {
    test('defers to handleRotation with the appropriate rotation', () => {
      jest.spyOn(tetris, 'handleRotation');
      tetris.rotateClockwise();
      expect(tetris.handleRotation).toHaveBeenCalledWith(Move.CLOCKWISE);
    });
  });

  describe('rotateCounterClockwise', () => {
    test('defers to handleRotation with the appropriate rotation', () => {
      jest.spyOn(tetris, 'handleRotation');
      tetris.rotateCounterClockwise();
      expect(tetris.handleRotation).toHaveBeenCalledWith(Move.COUNTERCLOCKWISE);
    });
  });

  describe('getState', () => {
    test('returns a copy of the game state', () => {
      const expectedState = new TetrisState();
      jest.spyOn(TetrisState, 'copy').mockReturnValue(expectedState);

      const state = tetris.getState();

      expect(state).toBe(expectedState);
      expect(TetrisState.copy).toHaveBeenCalled();
    });
  });

  describe('calcPointsForClearing', () => {
    test('returns the expected points for the given number of lines cleared', () => {
      for (let lines = 0; lines <= 4; lines++) {
        for (let level = 0; level < 20; level++) {
          jest.spyOn(state, 'level', 'get').mockReturnValue(level);
          expect(tetris.calcPointsForClearing(lines)).toBe(
            Tetris.POINTS_BY_LINES_CLEARED[lines] * (level + 1)
          );
        }
      }
    });
  });

  describe('rotate', () => {
    let move: Move;

    beforeEach(() => {
      move = Move.CLOCKWISE;
      jest.spyOn(state, 'tryRotation').mockReturnValue(move);
    });

    test('checks the rotation against the state', () => {
      tetris.rotate(move);
      expect(state.tryRotation).toHaveBeenCalledWith(move);
    });

    describe('when the rotation is not possible', () => {
      beforeEach(() => {
        jest.spyOn(state, 'tryRotation').mockReturnValue(Move.STAND);
      });

      test('returns false', () => {
        expect(tetris.rotate(move)).toBe(false);
      });
    });

    describe('when the rotation is possible', () => {
      test('throws PIECE_ROTATE event and returns true', () => {
        expectEventThrown('PIECE_ROTATE', () => tetris.rotate(move));
        expect(tetris.rotate(move)).toBe(true);
      });

      test('rotates the piece', () => {
        jest.spyOn(state.piece, 'move');
        tetris.rotate(move);
        expect(state.piece.move).toHaveBeenCalledWith(move);
      });
    });
  });

  describe('shiftPiece', () => {
    let move: Move;

    beforeEach(() => {
      move = Move.DOWN;
    });

    describe('when the piece can move', () => {
      beforeEach(() => {
        jest.spyOn(state, 'canPieceMove').mockReturnValue(true);
      });

      test('throws PIECE_SHIFT event and returns true', () => {
        expectEventThrown('PIECE_SHIFT', () => tetris.shiftPiece(move));
        expect(tetris.shiftPiece(move)).toBe(true);
      });

      test('shifts the piece', () => {
        jest.spyOn(state.piece, 'move');
        tetris.shiftPiece(move);
        expect(state.piece.move).toHaveBeenCalledWith(move);
      });
    });

    describe('when the piece cannot move', () => {
      beforeEach(() => {
        jest.spyOn(state, 'canPieceMove').mockReturnValue(false);
      });

      test('does not throw PIECE_SHIFT event returns false', () => {
        expectNoEventsThrown(() => tetris.shiftPiece(move));
        expect(tetris.shiftPiece(move)).toBe(false);
      });
    });
  });

  describe('plotPiece', () => {
    test('defers to state placePiece', () => {
      expectStateMethodCalled('placePiece', () => tetris.plotPiece());
    });

    test('throws PIECE_PLACED, BLOCKS events', () => {
      expectEventThrown('PIECE_PLACED', () => tetris.plotPiece());
      expectEventThrown('BLOCKS', () => tetris.plotPiece());
    });
  });

  describe('clearLines', () => {
    describe('when there are no full rows', () => {
      beforeEach(() => {
        jest.spyOn(state, 'getFullRows').mockReturnValue([]);
      });

      test('returns an empty array', () => {
        expect(tetris.clearLines()).toEqual([]);
      });

      test('does not modify the board', () => {
        const boardBefore = state.board;
        tetris.clearLines();
        expect(state.board).toEqual(boardBefore);
      });
    });

    describe('when there are full rows', () => {
      const cols = 5;
      const fullRows = [6, 7, 9];
      const board = [
        0,0,0,0,0,
        0,0,0,0,0,
        0,0,0,0,0,
        0,0,0,0,1,
        1,1,0,0,0,
        0,1,1,0,0,
        1,1,1,1,1, //
        1,1,1,1,1, //
        0,0,1,1,0,
        1,1,1,1,1  //
      ];

      const expectedBoardAfterClearing = [
        0,0,0,0,0,
        0,0,0,0,0,
        0,0,0,0,0,
        0,0,0,0,0,
        0,0,0,0,0,
        0,0,0,0,0,
        0,0,0,0,1,
        1,1,0,0,0,
        0,1,1,0,0,
        0,0,1,1,0
      ];

      beforeEach(() => {
        state = new TetrisState(board.length / cols, cols);
        tetris = new Tetris(state);
        board.forEach((block, index) => {
          state.setCellByIndex(index, block);
        });
      });

      test('returns an array of the full row indices', () => {
        expect(tetris.clearLines()).toEqual(fullRows);
      });

      test('shifts the appropriate non-full rows down', () => {
        tetris.clearLines();
        expect(state.board).toEqual(expectedBoardAfterClearing);
      });
    });
  });

  describe('isGravityEnabled', () => {
    test('returns whether gravity is enabled', () => {
      expect(tetris.isGravityEnabled()).toBe(true);
      tetris.disableGravity();
      expect(tetris.isGravityEnabled()).toBe(false);
      tetris.enableGravity();
      expect(tetris.isGravityEnabled()).toBe(true);
    });
  });

  describe('disableGravity', () => {
    describe('when gravity is already disabled', () => {
      beforeEach(() => {
        jest.spyOn(tetris, 'isGravityEnabled').mockReturnValue(false);
      });

      test('does not throw GRAVITY_DISABLED event', () => {
        expectNoEventsThrown(() => tetris.disableGravity());
      });
    });

    describe('when gravity is enabled', () => {
      beforeEach(() => {
        jest.spyOn(tetris, 'isGravityEnabled').mockReturnValue(true);
      });

      test('throws GRAVITY_DISABLED event', () => {
        expectEventThrown('GRAVITY_DISABLED', () => tetris.disableGravity());
      });

      test('stops the gravity timer', () => {
        tetris.disableGravity();
        expect(mockTimer.stop).toHaveBeenCalled();
      });
    });
  });

  describe('enableGravity', () => {
    describe('when gravity is already enabled', () => {
      beforeEach(() => {
        jest.spyOn(tetris, 'isGravityEnabled').mockReturnValue(true);
      });

      test('does not throw any events', () => {
        expectNoEventsThrown(() => tetris.enableGravity());
      });
    });

    describe('when gravity is disabled', () => {
      beforeEach(() => {
        jest.spyOn(tetris, 'isGravityEnabled').mockReturnValue(false);
      });

      describe('when the game is over', () => {
        beforeEach(() => {
          jest.spyOn(state, 'isGameOver', 'get').mockReturnValue(true);
        });

        test('does not start the gravity timer', () => {
          tetris.enableGravity();
          expect(mockTimer.start).not.toHaveBeenCalled();
        });
      });

      describe('when the game is not over', () => {
        beforeEach(() => {
          jest.spyOn(state, 'isGameOver', 'get').mockReturnValue(false);
        });

        describe('when the game has not yet started', () => {
          beforeEach(() => {
            jest.spyOn(state, 'hasStarted', 'get').mockReturnValue(false);
          });

          test('does not start the gravity timer', () => {
            tetris.enableGravity();
            expect(mockTimer.start).not.toHaveBeenCalled();
          });
        });

        describe('when the game has started', () => {
          beforeEach(() => {
            jest.spyOn(state, 'hasStarted', 'get').mockReturnValue(true);
          });

          describe('when the game is paused', () => {
            beforeEach(() => {
              jest.spyOn(state, 'isPaused', 'get').mockReturnValue(true);
            });

            test('does not start the gravity timer', () => {
              tetris.enableGravity();
              expect(mockTimer.start).not.toHaveBeenCalled();
            });
          });

          describe('when the game is not paused', () => {
            beforeEach(() => {
              jest.spyOn(state, 'isPaused', 'get').mockReturnValue(false);
            });

            test('starts the gravity timer', () => {
              const gravityDelayMs = 1234;
              jest.spyOn(tetris, 'gravityDelayMsForLevel').mockReturnValue(gravityDelayMs);
              tetris.enableGravity();
              expect(mockTimer.start).toHaveBeenCalledWith(gravityDelayMs);
            });
          });
        });
      });
    });
  });

  describe('updateGravityTimerDelayMs', () => {
    const gravityDelayMs = 1234;

    beforeEach(() => {
      jest.spyOn(tetris, 'gravityDelayMsForLevel').mockReturnValue(gravityDelayMs);
    });

    test('returns the delay', () => {
      expect(tetris.updateGravityTimerDelayMs()).toBe(gravityDelayMs);
    });

    // TODO Test that the timer delay is set
    // describe('when gravity is enabled', () => {
    //   beforeEach(() => {
    //     jest.spyOn(tetris, 'isGravityEnabled').mockReturnValue(true);
    //   });

    //   test('sets the delay appropriately', () => {
    //     // expect(mockTimer.delay.set).toHaveBeenCalledWith(gravityDelayMs);
    //   });
    // });
  });

  describe('attemptClearLines', () => {
    describe('when there are no full rows', () => {
      beforeEach(() => {
        jest.spyOn(state, 'getFullRows').mockReturnValue([]);
      });

      test('returns false', () => {
        expect(tetris.attemptClearLines()).toBe(false);
      });
    });

    describe('when there are some full rows', () => {
      let fullRows: number[];

      beforeEach(() => {
        fullRows = [1, 2, 3];
        jest.spyOn(state, 'getFullRows').mockReturnValue(fullRows);
        jest.spyOn(tetris, 'calcPointsForClearing').mockReturnValue(fullRows.length);
      });

      test('updates state linesCleared, score, linesUntilNextLevel, and isClearingLines', () => {
        const linesClearedBefore = state.linesCleared;
        const scoreBefore = state.score;
        const linesUntilNextLevelBefore = state.linesUntilNextLevel;
        const isClearingLinesBefore = state.isClearingLines;

        tetris.attemptClearLines();

        expect(state.linesCleared).toBe(linesClearedBefore + fullRows.length);
        expect(state.score).toBe(scoreBefore + fullRows.length);
        expect(state.linesUntilNextLevel).toBe(linesUntilNextLevelBefore - fullRows.length);
        expect(state.isClearingLines).toBe(true);
      });

      test('throws LINE_CLEAR, SCORE_UPDATE, and BLOCKS events', () => {
        expectEventsThrown(['LINE_CLEAR', 'SCORE_UPDATE', 'BLOCKS'], () => tetris.attemptClearLines());
      });

      test('returns true', () => {
        expect(tetris.attemptClearLines()).toBe(true);
      });
    });
  });

  describe('gameloop', () => {
    beforeEach(() => {
      tetris.disableGravity();
      tetris.start(0, false);
    });

    describe('when the game is over', () => {
      beforeEach(() => {
        jest.spyOn(state, 'isGameOver', 'get').mockReturnValue(true);
      });

      test('does not throw GAMELOOP event', () => {
        expectEventNotThrown('GAMELOOP', () => tetris.gameloop());
      });
    });

    describe('when the game is paused', () => {
      beforeEach(() => {
        jest.spyOn(state, 'isPaused', 'get').mockReturnValue(true);
      });

      test('does nothing, does not throw GAMELOOP event', () => {
        expectEventNotThrown('GAMELOOP', () => tetris.gameloop());
      });
    });

    describe('when the game is in progress', () => {
      beforeEach(() => {
        jest.spyOn(state, 'isGameOver', 'get').mockReturnValue(false);
        jest.spyOn(state, 'isPaused', 'get').mockReturnValue(false);
      });

      test('throws GAMELOOP event', () => {
        expectEventThrown('GAMELOOP', () => tetris.gameloop());
      });

      describe('when the piece is not active', () => {
        beforeEach(() => {
          jest.spyOn(state.piece, 'isActive', 'get').mockReturnValue(false);
        });

        describe('when there are no lines to clear', () => {
          beforeEach(() => {
            jest.spyOn(tetris, 'attemptClearLines').mockReturnValue(false);
          });

          test('Sets up the next piece', () => {
            expectMethodCalled('nextPiece', () => tetris.gameloop());
          });

          describe('when the gameover condition is true', () => {
            beforeEach(() => {
              jest.spyOn(tetris, 'checkGameOver').mockReturnValue(true);
            });

            test('returns without throwing GAMELOOP event', () => {
              expectEventNotThrown('GAMELOOP', () => tetris.gameloop());
            });
          });

          describe('when the gameover condition is false', () => {
            beforeEach(() => {
              jest.spyOn(tetris, 'checkGameOver').mockReturnValue(false);
            });

            test('throws GAMELOOP event', () => {
              expectEventThrown('GAMELOOP', () => tetris.gameloop());
            });
          });
        });

        describe('when there are full lines', () => {
          beforeEach(() => {
            jest.spyOn(tetris, 'attemptClearLines').mockReturnValue(true);
          });

          describe('when enough lines have cleared', () => {
            beforeEach(() => {
              jest.spyOn(state, 'linesUntilNextLevel', 'get').mockReturnValue(0);
            });

            test('increases the level', () => {
              expectMethodCalled('increaseLevel', () => tetris.gameloop());
            });
          });

          describe('when more lines are needed to advance to the next level', () => {
            beforeEach(() => {
              jest.spyOn(state, 'linesUntilNextLevel', 'get').mockReturnValue(1);
            });

            test('does not increase the level', () => {
              expectMethodNotCalled('increaseLevel', () => tetris.gameloop());
            });
          });
        });
      });

      describe('when the piece is active', () => {
        beforeEach(() => {
          jest.spyOn(state.piece, 'isActive', 'get').mockReturnValue(true);
        });

        describe('when the piece cannot move DOWN', () => {
          beforeEach(() => {
            jest.spyOn(state, 'canPieceMove').mockReturnValue(false);
          });

          test('plots the piece blocks to the board', () => {
            expectMethodCalled('plotPiece', () => tetris.gameloop());
          });

          // TODO Test that the timer is delayed appropriately
          // describe('when gravity is enabled', () => {
          //   beforeEach(() => {
          //     jest.spyOn(tetris, 'isGravityEnabled').mockReturnValue(true);
          //   });

          //   test('delays the gravity effect for 3 gameloop calls', () => {
          //     // Test gravityTimer delay setter is called
          //   });
          // });

          test('throws GAMELOOP event', () => {
            expectEventThrown('GAMELOOP', () => tetris.gameloop());
          });
        });

        describe('when the piece can move DOWN', () => {
          beforeEach(() => {
            jest.spyOn(state, 'canPieceMove').mockReturnValue(true);
          });

          describe('when gravity is enabled', () => {
            beforeEach(() => {
              jest.spyOn(tetris, 'isGravityEnabled').mockReturnValue(true);
            });

            describe('when the gravity effect is delayed', () => {
              beforeEach(() => {
                // TODO Find a better way to test this.
                tetris['ticksUntilNextGravity'] = 2;
              });

              test('decrements the gravity effect delay by one gameloop', () => {
                tetris.gameloop();
                expect(tetris['ticksUntilNextGravity']).toBe(1);
              });

              describe('when the gravity effect delay decreases 0', () => {
                beforeEach(() => {
                  tetris['ticksUntilNextGravity'] = 1;
                });

                test('updates the gravity timer delay', () => {
                  expectMethodCalled('updateGravityTimerDelayMs', () => tetris.gameloop());
                });
              });

              describe('when the gravity effect delay is still > 0', () => {
                test('does not update the gravity timer delay', () => {
                  expectMethodNotCalled('updateGravityTimerDelayMs', () => tetris.gameloop());
                });
              });
            });

            describe('when the gravity effect is not under delay', () => {
              beforeEach(() => {
                // TODO Find a better way to test this.
                tetris['ticksUntilNextGravity'] = 0;
              });

              test('shifts the piece DOWN', () => {
                jest.spyOn(tetris, 'shiftPiece');
                tetris.gameloop();
                expect(tetris.shiftPiece).toHaveBeenCalledWith(Move.DOWN);
              });
            });
          });

          describe('when gravity is disabled', () => {
            beforeEach(() => {
              jest.spyOn(tetris, 'isGravityEnabled').mockReturnValue(false);
            });

            test('does not shift the piece', () => {
              expectMethodNotCalled('shiftPiece', () => tetris.gameloop());
            });

            test('does not update the gravity timer delay', () => {
              expectMethodNotCalled('updateGravityTimerDelayMs', () => tetris.gameloop());
            });
          });
        });
      });
    });
  });

  describe('checkGameOver', () => {
    describe('when the game is already over', () => {
      beforeEach(() => {
        jest.spyOn(state, 'isGameOver', 'get').mockReturnValue(true);
      });

      test('returns true', () => {
        expect(tetris.checkGameOver()).toBe(true);
      });
    });

    describe('when the game is not over', () => {
      beforeEach(() => {
        jest.spyOn(state, 'isGameOver', 'get').mockReturnValue(false);
      });

      describe('when the piece blocks overlap existing board blocks', () => {
        beforeEach(() => {
          jest.spyOn(state, 'pieceOverlapsBlocks').mockReturnValue(true);
        });

        test('calls gameOver and returns true', () => {
          jest.spyOn(tetris, 'gameOver');
          const result = tetris.checkGameOver();
          expect(tetris.gameOver).toHaveBeenCalled();
          expect(result).toBe(true);
        });
      });

      describe('when the piece blocks do not overlap board blocks', () => {
        beforeEach(() => {
          jest.spyOn(state, 'pieceOverlapsBlocks').mockReturnValue(false);
        });

        test('returns false', () => {
          jest.spyOn(tetris, 'gameOver');
          const result = tetris.checkGameOver();
          expect(tetris.gameOver).not.toHaveBeenCalled();
          expect(result).toBe(false);
        });
      });
    });
  });

  describe('increaseLevel', () => {
    let linesPerLevel: number;

    beforeEach(() => {
      linesPerLevel = 10;
      jest.spyOn(state, 'linesPerLevel').mockReturnValue(linesPerLevel);
    });

    test('increments state level', () => {
      const levelBefore = state.level;
      tetris.increaseLevel();
      expect(state.level).toBe(levelBefore + 1);
    });

    test('adds to the linesUntilNextLevel counter', () => {
      const linesUntilNextLevelBefore = state.linesUntilNextLevel;
      tetris.increaseLevel();
      expect(state.linesUntilNextLevel).toBe(linesUntilNextLevelBefore + linesPerLevel);
    });

    test('updates the gravity delay timer', () => {
      expectMethodCalled('updateGravityTimerDelayMs', () => tetris.increaseLevel());
    });

    test('throws the LEVEL_UPDATE event', () => {
      expectEventThrown('LEVEL_UPDATE', () => tetris.increaseLevel());
    });
  });

  describe('reset', () => {
    test('resets the game state', () => {
      expectStateMethodCalled('reset', () => tetris.reset());
    });

    test('throws the RESET event', () => {
      expectEventThrown('RESET', () => tetris.reset());
    });
  });

  describe('gameOver', () => {
    test('sets state isGameOver, isPaused, isClearingLines', () => {
      tetris.gameOver();
      expect(state.isGameOver).toBe(true);
      expect(state.isPaused).toBe(false);
      expect(state.isClearingLines).toBe(false);
    });

    test('places the piece on the board wherever it currently is', () => {
      expectStateMethodCalled('placePiece', () => tetris.gameOver());
    });

    test('throws the GAME_OVER event', () => {
      expectEventThrown('GAME_OVER', () => tetris.gameOver());
    });

    describe('when gravity is enabled', () => {
      beforeEach(() => {
        jest.spyOn(tetris, 'isGravityEnabled').mockReturnValue(true);
      });

      test('stops the gravity timer', () => {
        tetris.gameOver();
        expect(mockTimer.stop).toHaveBeenCalled();
      });
    });
  });

  describe('handleRotation', () => {
    let move: Move;

    beforeEach(() => {
      move = Move.CLOCKWISE;
    });

    describe('when the piece is inactive', () => {
      beforeEach(() => {
        jest.spyOn(state.piece, 'isActive', 'get').mockReturnValue(false);
      });

      test('returns false', () => {
        expect(tetris.handleRotation(move)).toBe(false);
      });
    });

    describe('when the game is paused', () => {
      beforeEach(() => {
        jest.spyOn(state, 'isPaused', 'get').mockReturnValue(true);
      });

      test('returns false', () => {
        expect(tetris.handleRotation(move)).toBe(false);
      });
    });

    describe('when the game is over', () => {
      beforeEach(() => {
        jest.spyOn(state, 'isGameOver', 'get').mockReturnValue(true);
      });

      test('returns false', () => {
        expect(tetris.handleRotation(move)).toBe(false);
      });
    });

    describe('when the piece is active, and game is unpaused in progress', () => {
      beforeEach(() => {
        jest.spyOn(state.piece, 'isActive', 'get').mockReturnValue(true);
        jest.spyOn(state, 'isPaused', 'get').mockReturnValue(false);
        jest.spyOn(state, 'isGameOver', 'get').mockReturnValue(false);
      });

      describe('when the rotation is valid', () => {
        beforeEach(() => {
          jest.spyOn(tetris, 'rotate').mockReturnValue(true);
        });

        test('returns true', () => {
          expect(tetris.handleRotation(move)).toBe(true);
        });
      });

      describe('when the rotation is invalid', () => {
        beforeEach(() => {
          jest.spyOn(tetris, 'rotate').mockReturnValue(false);
        });

        test('returns false', () => {
          expect(tetris.handleRotation(move)).toBe(false);
        });
      });
    });
  });

  describe('shift', () => {
    let rowOffset: number;
    let colOffset: number;

    beforeEach(() => {
      rowOffset = 1;
      colOffset = 1;
    });

    describe('when the shift is valid', () => {
      beforeEach(() => {
        jest.spyOn(tetris, 'shiftPiece').mockReturnValue(true);
      });

      test('returns true', () => {
        expect(tetris.shift(rowOffset, colOffset)).toBe(true);
      });

      describe('when the given rowOffset is positive and gravity is enabled', () => {
        beforeEach(() => {
          jest.spyOn(tetris, 'isGravityEnabled').mockReturnValue(true);
        });

        test('delays the gravity timer tick', () => {
          tetris.shift(rowOffset, colOffset);
          expect(mockTimer.delayNextTick).toHaveBeenCalled();
        });

        // Note: To avoid confusion:
        // - The gravity timer is a repeating timer with a given delay (time between ticks).
        // - The gravity effect is the part of the gameloop that shifts the piece down.
        // The effect can be delayed by setting ticksUntilNextGravity counter, which tracks
        // the amount of timer ticks (gameloop calls) that the gravity effect will be ignored.
        describe('when the gravity effect is delayed', () => {
          beforeEach(() => {
            tetris['ticksUntilNextGravity'] = 2;
          });

          test('clears the effect delay and updates the timer delay', () => {
            jest.spyOn(tetris, 'updateGravityTimerDelayMs');
            tetris.shift(rowOffset, colOffset);
            expect(tetris['ticksUntilNextGravity']).toBe(0);
            expect(tetris.updateGravityTimerDelayMs).toHaveBeenCalled();
          });
        });
      });
    });

    describe('when the shift is not valid', () => {
      beforeEach(() => {
        jest.spyOn(tetris, 'shiftPiece').mockReturnValue(false);
      });

      test('returns false', () => {
        expect(tetris.shift(rowOffset, colOffset)).toBe(false);
      });
    });
  });

  describe('event methods', () => {
    let eventName: string;
    let listener: EventListener;
    let event: Event;

    beforeEach(() => {
      eventName = 'TEST_EVENT';
      listener = jest.fn();
      event = new Event(eventName);
    });

    describe('when the eventBus has not yet been initialized', () => {
      beforeEach(() => {
        tetris['eventBus'] = null;
      });

      describe('registerEvent', () => {
        test('initializes eventBus and registers the event with it', () => {
          jest.spyOn(EventBus.prototype, 'registerEventListener');
          tetris.registerEventListener(eventName, listener);

          const eventBus = tetris['eventBus'];
          if (!eventBus) {
            fail('eventBus was not initialized as expected');
          } else {
            expect(eventBus).toBeInstanceOf(EventBus);
            expect(eventBus.registerEventListener).toHaveBeenCalledWith(eventName, listener);
          }
        });
      });

      describe('unregisterEventListener', () => {
        test('returns false', () => {
          expect(tetris.unregisterEventListener(eventName, listener)).toBe(false);
        });
      });

      describe('unregisterAllEventListeners', () => {
        test('returns false', () => {
          expect(tetris.unregisterAllEventListeners(eventName)).toBe(false);
        });
      });

      describe('throwEvent', () => {
        test('does nothing; does not call throwEvent on eventBus', () => {
          jest.spyOn(EventBus.prototype, 'throwEvent');
          tetris.throwEvent(event);
          expect(EventBus.prototype.throwEvent).not.toHaveBeenCalled();
        });
      });

      describe('hasListeners', () => {
        test('returns false', () => {
          expect(tetris.hasListeners(eventName)).toBe(false);
        });
      });
    });

    describe('when eventBus has been initialized', () => {
      let eventBus: EventBus;

      beforeEach(() => {
        eventBus = new EventBus();
        tetris['eventBus'] = eventBus;
      });

      describe('registerEventListener', () => {
        test('defers to the eventBus registerEventListener', () => {
          const result = true;
          jest.spyOn(eventBus, 'registerEventListener').mockReturnValue(result);
          expect(tetris.registerEventListener(eventName, listener)).toBe(result);
          expect(eventBus.registerEventListener).toHaveBeenCalledWith(eventName, listener);
        });
      });

      describe('unregisterEventListener', () => {
        test('defers to the eventBus unregisterEventListener', () => {
          const result = true;
          jest.spyOn(eventBus, 'unregisterEventListener').mockReturnValue(result);
          expect(tetris.unregisterEventListener(eventName, listener)).toBe(result);
          expect(eventBus.unregisterEventListener).toHaveBeenCalledWith(eventName, listener);
        });
      });

      describe('unregisterAllEventListeners', () => {
        test('defers to the eventBus unregisterAllEventListeners', () => {
          const result = true;
          jest.spyOn(eventBus, 'unregisterAllEventListeners').mockReturnValue(result);
          expect(tetris.unregisterAllEventListeners(eventName)).toBe(result);
          expect(eventBus.unregisterAllEventListeners).toHaveBeenCalledWith(eventName);
        });
      });

      describe('throwEvent', () => {
        test('defers to the eventBus throwEvent', () => {
          jest.spyOn(eventBus, 'throwEvent');
          tetris.throwEvent(event);
          expect(eventBus.throwEvent).toHaveBeenCalledWith(event);
        });
      });

      describe('hasListeners', () => {
        test('defers to the eventBus hasListeners', () => {
          const result = true;
          jest.spyOn(eventBus, 'hasListeners').mockReturnValue(result);
          expect(tetris.hasListeners(eventName)).toBe(result);
          expect(eventBus.hasListeners).toHaveBeenCalledWith(eventName);
        });
      });
    });
  });

  describe('nextPiece', () => {
    test('resets the piece on the state', () => {
      expectStateMethodCalled('resetPiece', () => tetris.nextPiece());
    });

    test('throws the PIECE_CREATE event', () => {
      expectEventThrown('PIECE_CREATE', () => tetris.nextPiece());
    });
  });
});
