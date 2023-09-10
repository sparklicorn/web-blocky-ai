import Tetris from "./Tetris";
import TetrisEvent from "./TetrisEvent";
import TetrisState from "./TetrisState";

describe("Tetris", () => {
  let tetris: Tetris;

  beforeEach(() => {
    tetris = new Tetris();
  });

  describe('state', () => {
    test('returns a copy of the game state', () => {
      const expectedState = new TetrisState();
      jest.spyOn(TetrisState, 'copy').mockReturnValue(expectedState);

      const state = tetris.state;

      expect(state).toBe(expectedState);
      expect(TetrisState.copy).toHaveBeenCalled();
    });
  });

  describe('calcPointsForClearing', () => {
    test('returns the expected points for the given number of lines cleared', () => {
      for (let lines = 0; lines <= 4; lines++) {
        for (let level = 0; level < 20; level++) {
          expect(tetris['calcPointsForClearing'](lines)).toBe(
            Tetris.POINTS_BY_LINES_CLEARED[lines] * (level + 1)
          );
          tetris['increaseLevel']();
        }
      }
    });
  });

  describe('plotPiece', () => {
    test('plots the piece blocks to the board', () => {
      fail('NYI');
    });

    test('throws the PIECE_PLACED and BLOCKS events', () => {
      fail('NYI');
    });
  });

  describe('clearLines', () => {
    describe('when there are no full rows', () => {
      test('returns an empty array', () => {
        fail('NYI');
      });

      test('does not modify the board', () => {
        fail('NYI');
      });
    });

    describe('when there are full rows', () => {
      test('returns an array of the full row indices', () => {
        fail('NYI');
      });

      test('shifts the above non-full rows down', () => {
        fail('NYI');
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
    beforeEach(() => {
      jest.spyOn(tetris, 'throwEvent');
    });

    describe('when gravity is already disabled', () => {
      beforeEach(() => {
        jest.spyOn(tetris, 'isGravityEnabled').mockReturnValue(false);
      });

      test('has no effect', () => {
        expect(tetris.throwEvent).not.toHaveBeenCalled();
      });
    });

    describe('when gravity is enabled', () => {
      beforeEach(() => {
        jest.spyOn(tetris, 'isGravityEnabled').mockReturnValue(true);
      });

      test('disables gravity', () => {
        tetris.disableGravity();
        expect(tetris.throwEvent).toHaveBeenCalled();
        // expect(tetris.isGravityEnabled()).toBe(false);
        // TODO make way to assert what kind of event was thrown
      });
    });
  });

  describe('enableGravity', () => {
    beforeEach(() => {
      jest.spyOn(tetris, 'throwEvent');
    });

    describe('when gravity is already enabled', () => {
      beforeEach(() => {
        jest.spyOn(tetris, 'isGravityEnabled').mockReturnValue(true);
      });

      test('has no effect', () => {
        expect(tetris.throwEvent).not.toHaveBeenCalled();
      });
    });

    describe('when gravity is disabled', () => {
      beforeEach(() => {
        jest.spyOn(tetris, 'isGravityEnabled').mockReturnValue(false);
      });

      test('enables gravity', () => {
        tetris.enableGravity();
        expect(tetris.throwEvent).toHaveBeenCalled();
        // expect(tetris.isGravityEnabled()).toBe(true);
        // TODO make way to assert what kind of event was thrown
      });
    });

    // TODO this method does more
  });

  describe('gravityDelayMsForLevel', () => {
    test('returns the expected delay for the current level', () => {
      fail('NYI');
    });
  });

  describe('updateGravityTimerDelayMs', () => {
    test('gets and returns the delay amount for the current level', () => {
      fail('NYI');
    });

    describe('if gravity is enabled', () => {
      test('sets the gravity timer to the delay', () => {
        fail('NYI');
      });
    });
  });

  describe('attemptClearLines', () => {
    describe('when there are no full rows', () => {
      test('returns false', () => {
        fail('NYI');
      });
    });

    describe('when there are some full rows', () => {
      test('updates linesCleared', () => {
        fail('NYI');
      });

      test('updates score', () => {
        fail('NYI');
      });

      test('updates linesUntilNextLevel', () => {
        fail('NYI');
      });

      test('updates isClearingLines', () => {
        fail('NYI');
      });

      test('throws the appropriate events', () => {
        fail('NYI');
      });

      test('returns true', () => {
        fail('NYI');
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
        tetris.gameOver();
      });

      test('does nothing, does not throw GAMELOOP event', () => {
        jest.spyOn(tetris, 'throwEvent');
        tetris.gameloop();
        expect(tetris.throwEvent).not.toHaveBeenCalled();
      });
    });

    describe('when the game is paused', () => {
      beforeEach(() => {
        tetris.pause();
      });

      test('does nothing, does not throw GAMELOOP event', () => {
        jest.spyOn(tetris, 'throwEvent');
        tetris.gameloop();
        expect(tetris.throwEvent).not.toHaveBeenCalled();
      });
    });

    describe('when the game is in progress', () => {
      test('throws GAMELOOP event', () => {
        const expectedGameloopEvent = new TetrisEvent('GAMELOOP');
        jest.spyOn(tetris, 'throwEvent');
        jest.spyOn(TetrisEvent, 'GAMELOOP').mockReturnValue(expectedGameloopEvent);

        tetris.gameloop();

        expect(TetrisEvent.GAMELOOP).toHaveBeenCalledWith(tetris);
        expect(tetris.throwEvent).toHaveBeenCalledWith(expectedGameloopEvent);
      });

      describe('when the piece is not active', () => {
        describe('when there are no lines to clear', () => {
          test('does not clear any lines or advance the level', () => {

          });

          test('Sets up the next piece', () => {

          });

          test('checks for game over', () => {

          });
        });

        describe('when there are full lines', () => {
          test('clears the lines', () => {

          });

          describe('when enough lines have cleared', () => {
            test('increases the level', () => {

            });
          });

          describe('when more lines are needed to advance to the next level', () => {
            test('does not increase the level', () => {

            });
          });
        });
      });

      describe('when the piece is active', () => {
        describe('when the piece cannot move DOWN anymore', () => {
          test('plots the piece blocks to the board', () => {

          });

          describe('if gravity is enabled', () => {
            test('delays the gravity effect for 3 gameloop calls', () => {

            });
          });
        });

        describe('when the piece can move DOWN', () => {
          test('does not plot the piece blocks', () => {

          });

          describe('when gravity is enabled', () => {
            describe('when the gravity effect is delayed', () => {
              test('decrements the gravity effect delay by one gameloop', () => {

              });

              describe('when the gravity effect delay decreases 0', () => {
                test('updates the gravity timer delay', () => {

                });
              });

              describe('when the gravity effect delay is still > 0', () => {
                test('does not update the gravity timer delay', () => {

                });
              });
            });

            describe('when the gravity effect is not under delay', () => {
              test('shifts the piece DOWN', () => {

              });
            });
          });

          describe('when gravity is disabled', () => {
            test('does not shift the piece', () => {

            });

            test('does not update the gravity timer delay', () => {

            });
          });
        });
      });
    });
  });

  describe('checkGameOver', () => {
    describe('when the game is already over', () => {
      test('returns true', () => {
        fail('NYI');
      });
    });

    describe('when the piece blocks overlap existing board blocks', () => {
      test('calls gameOver and returns true', () => {
        fail('NYI');
      });
    });

    describe('when the piece blocks do not overlap board blocks', () => {
      test('returns false', () => {
        fail('NYI');
      });
    });
  });

  describe('newGame', () => {
    test('calls reset', () => {
      fail('NYI');
    });

    test('throws the NEW_GAME event', () => {
      fail('NYI');
    });
  });

  describe('increaseLevel', () => {
    test('updates level', () => {
      fail('NYI');
    });

    test('updates linesUntilNextLevel', () => {
      fail('NYI');
    });

    test('updates the gravity delay timer', () => {
      fail('NYI');
    });

    test('throws the LEVEL_UPDATE event', () => {
      fail('NYI');
    });
  });

  describe('reset', () => {
    test('resets the game state', () => {
      fail('NYI');
    });

    test('throws the RESET event', () => {
      fail('NYI');
    });
  });

  describe('start', () => {
    describe('when the game has already started', () => {
      test('does nothing; Does not call the START event', () => {
        fail('NYI');
      });
    });

    describe('when the game has not yet started', () => {
      test('sets to the given level', () => {
        fail('NYI');
      });

      test('sets up the next piece', () => {
        fail('NYI');
      });

      test('throws the START event', () => {
        fail('NYI');
      });

      describe('when useGravity is true', () => {
        test('enables gravity and sets the gravity delay', () => {
          fail('NYI');
        });
      });

      describe('when useGravity is false', () => {
        test('does not enable gravity', () => {
          fail('NYI');
        });
      });
    });
  });

  describe('stop', () => {
    test('sets isPaused', () => {
      fail('NYI');
    });

    test('sets isGameOver', () => {
      fail('NYI');
    });

    test('sets isClearingLines', () => {
      fail('NYI');
    });

    test('places the current piece wherever it currently is', () => {
      fail('NYI');
    });

    test('throws the STOP event', () => {
      fail('NYI');
    });

    describe('when gravity is enabled', () => {
      test('stops the gravity timer', () => {
        fail('NYI');
      });
    });
  });

  describe('pause', () => {
    describe('when the game is over, paused, or has not yet started', () => {
      test('does nothing; does not throw the PAUSE event', () => {
        fail('NYI');
      });
    });

    describe('when the game is started, not yet over, and not paused', () => {
      test('sets isPaused', () => {
        fail('NYI');
      });

      test('throws the PAUSE event', () => {
        fail('NYI');
      });

      describe('when gravity is enabled', () => {
        test('stops the garvity timer', () => {
          fail('NYI');
        });
      });
    });
  });

  describe('gameOver', () => {
    test('sets isGameOver, isPaused, isClearingLines', () => {
      fail('NYI');
    });

    test('places the piece on the board wherever it currently is', () => {
      fail('NYI');
    });

    test('throws the GAME_OVER event', () => {
      fail('NYI');
    });
  });

  describe('resume', () => {
    describe('when the game has not yet started', () => {
      test('does nothing; does not throw the RESUME event', () => {
        fail('NYI');
      });
    });

    describe('when the game has been started', () => {
      describe('when the game is over', () => {
        test('does nothing; does not throw the RESUME event', () => {
          fail('NYI');
        });
      });

      describe('when the game is not over', () => {
        test('sets isPaused', () => {
          fail('NYI');
        });

        test('throws the RESUME event', () => {
          fail('NYI');
        });

        describe('when gravity is enabled', () => {
          test('starts the gravity timer', () => {
            fail('NYI');
          });
        });
      });
    });
  });

  describe('handleRotation', () => {
    describe('when the piece is inactive, or the game is over or paused', () => {
      test('returns false', () => {
        fail('NYI');
      });
    });

    describe('when the piece is active, and game is in progress', () => {
      describe('when the rotation is valid', () => {
        test('returns true', () => {
          fail('NYI');
        });
      });

      describe('when the rotation is invalid', () => {
        test('returns false', () => {
          fail('NYI');
        });
      });
    });
  });

  describe('rotateClockwise', () => {
    test('calls handleRotation', () => {
      fail('NYI');
    });
  });

  describe('rotateCounterClockwise', () => {
    test('calls handleRotation', () => {
      fail('NYI');
    });
  });

  describe('shift', () => {
    describe('when the shift is valid', () => {
      test('moves the piece in the designated direction', () => {
        fail('NYI');
      });

      test('returns true', () => {
        fail('NYI');
      });

      describe('when shifting DOWN and gravity is enabled', () => {
        test('clears any gravity effect delay and updates the gravity timer', () => {
          fail('NYI');
        });
      });
    });

    describe('when the shift is not valid', () => {
      test('returns false', () => {
        fail('NYI');
      });
    });
  });

  describe('registerEventListener', () => {
    test('initializes eventBus if it has not been yet', () => {
      fail('NYI');
    });

    test('registers the given listener', () => {
      fail('NYI');
    });
  });

  describe('unregisterEventListener', () => {
    describe('when the eventBus has not yet been initialized', () => {
      test('returns false', () => {
        fail('NYI');
      });
    });

    describe('when the eventBus was previously initialized', () => {
      test('calls unregisterEventListener on eventBus and returns the result', () => {
        fail('NYI');
      });
    });
  });

  describe('unregisterAllEventListeners', () => {
    describe('when the eventBus has not yet been initialized', () => {
      test('returns false', () => {
        fail('NYI');
      });
    });

    describe('when the eventBus was previously initialized', () => {
      test('calls unregisterAllEventListeners on eventBus and returns the result', () => {
        fail('NYI');
      });
    });
  });

  describe('throwEvent', () => {
    describe('when the eventBus has not yet been initialized', () => {
      test('does nothing; does not call throwEvent on eventBus', () => {
        fail('NYI');
      });
    });

    describe('when the eventBus was previously initialized', () => {
      test('calls throwEvent on eventBus and returns the result', () => {
        fail('NYI');
      });
    });
  });

  describe('nextPiece', () => {
    test('resets the piece on the state', () => {
      fail('NYI');
    });

    test('throws the PIECE_CREATE event', () => {
      fail('NYI');
    });
  });
});
