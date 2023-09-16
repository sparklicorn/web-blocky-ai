import { useEffect, useRef, useState } from 'react';
import Tetris from '../tetris/Tetris';
import { EventListener } from '../event/Event';
import TetrisEvent from '../tetris/TetrisEvent';
import Coord from '../structs/Coord';
import TetrisState from '../tetris/TetrisState';
import ITetrisGame from '../tetris/ITetrisGame';
import { bounded } from '../util/Util';

const bgColor = '#000';

export default function TetrisBoard() {
  const [dimensions, setDimensions] = useState(defaultDimensions);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  let board : number[] = Array(dimensions.rows * dimensions.columns).fill(0);
  const game: ITetrisGame = new Tetris();
  let state: TetrisState = game.getState();

  const width = () => dimensions.columns * dimensions.blockSize;
  const height = () => dimensions.rows * dimensions.blockSize;
  const canvasContext = () => canvasRef.current?.getContext('2d');
  const render = () => {
    const ctx = canvasContext();
    if (!ctx) {
      console.log('No context');

      return;
    }

    // Fill black background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width(), height());

    // If the game is paused or hasn't yet started, don't draw anything
    if (!state.hasStarted || state.isPaused) {
      return;
    }

    // Draw blocks
    board.forEach((block, index) => {
      if (block !== 0) {
        drawBlockAtIndex(index);
      }
    });
  };
  const contextMenuListener = (event: MouseEvent) => event.preventDefault();
  let isMouseDown = false;
  const mouseUpListener = (_event: MouseEvent) => {
    isMouseDown = false;
  };
  const mouseMoveListener = (event: MouseEvent) => {
    if (!isMouseDown) {
      return;
    }

    mouseListener(event);
  };
  const mouseListener = (event: MouseEvent) => {
    isMouseDown = true;
    const rect = canvasRef.current?.getBoundingClientRect();
    const x = event.clientX - rect!.left;
    const y = event.clientY - rect!.top;
    const row = bounded(Math.floor(y / dimensions.blockSize), 0, dimensions.rows - 1);
    const col = bounded(Math.floor(x / dimensions.blockSize), 0, dimensions.columns - 1);
    const index = row * dimensions.columns + col;

    console.log(`Mouse ${event.button} at {${row}, ${col}} index ${index}`);

    // If right-click, remove block at index
    if (event.button === 2) {
      // Do nothing if there is no block at index
      if (board[index] === 0) {
        return;
      }

      console.log(`Removing block at {${row}, ${col}} index ${index}`);
      board[index] = 0;
      // setBlocks(blocks.map((block, i) => (i === index) ? 0 : block));
    } else {
      // Do nothing if there is already a block at index
      if (board[index] !== 0) {
        return;
      }

      // If left-click, add block at index
      console.log(`Adding block at {${row}, ${col}} index ${index}`);
      // setBlocks(blocks.map((block, i) => (i === index) ? 1 : block));
      board[index] = 1;
    }

    render();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    canvas.width = width();
    canvas.height = height();

    render();

    canvas.addEventListener('mousedown', mouseListener);
    canvas.addEventListener('mouseup', mouseUpListener);
    canvas.addEventListener('contextmenu', contextMenuListener);
    canvas.addEventListener('mousemove', mouseMoveListener);

    const keyListeners = {
      ArrowLeft: () => game.moveLeft(),
      ArrowRight: () => game.moveRight(),
      ArrowDown: () => game.moveDown(),
      Enter: () => {
        if (state.isGameOver) {
          game.newGame();
        } else if (!state.hasStarted) {
          game.start(0, true);
        } else if (state.isPaused) {
          game.resume();
        } else {
          game.pause();
        }
      },
      Space: () => {}, // Disable spacebar scrolling
      // Z to rotate clockwise
      z: () => {
        console.log('Rotating clockwise');
        if (!game.rotateClockwise()) {
          console.log('Cannot rotate clockwise');
          // log the game state
          console.log(JSON.stringify(game.getState()));
        }
      },
      x: () => game.rotateCounterClockwise(),
    } as { [key: string]: () => any };

    window.addEventListener('keydown', (event) => {
      if (keyListeners[event.key]) {
        keyListeners[event.key]();
        event.preventDefault();
      }
    });

    return () => {
      canvas.removeEventListener('mousedown', mouseListener);
      canvas.removeEventListener('mouseup', mouseUpListener);
      canvas.removeEventListener('contextmenu', contextMenuListener);
      canvas.removeEventListener('mousemove', mouseMoveListener);
    };
  }, [dimensions]);

  const drawBlockAtIndex = (index: number) => {
    drawBlock(
      Math.floor(index / dimensions.columns),
      index % dimensions.columns
    );
  }

  const drawBlock = (row: number, col: number) => {
    const canvas = canvasRef.current;
    const context = (canvas) ? canvas.getContext('2d') : null;

    // fill rectangle with the given shape color at given row and column
    if (context) {
      const shapeVal = board[row * state.cols + col];

      // Fill in the center of the rectangle
      context.fillStyle = shapeColors[shapeVal][1];
      context.fillRect(
        col * dimensions.blockSize,
        row * dimensions.blockSize,
        dimensions.blockSize,
        dimensions.blockSize
      );

    //   // draw top and left border lines
      context.fillStyle = shapeColors[shapeVal][0];
      context.fillRect(
        col * dimensions.blockSize,
        row * dimensions.blockSize,
        dimensions.blockSize,
        1
      );
      context.fillRect(
        col * dimensions.blockSize,
        row * dimensions.blockSize,
        1,
        dimensions.blockSize
      );

    //   // draw bottom and right border lines
      context.fillStyle = shapeColors[shapeVal][2];
      context.fillRect(
        col * dimensions.blockSize,
        (row + 1) * dimensions.blockSize - 1,
        dimensions.blockSize,
        1
      );
      context.fillRect(
        (col + 1) * dimensions.blockSize - 1,
        row * dimensions.blockSize,
        1,
        dimensions.blockSize
      );
    } else {
      console.warn('No context');
    }
  };

  const mapStateToBoard = (): void => {
    board = state.board.slice();

    if (!state.piece.isActive) {
      return;
    }

    state.piece.blockCoords.forEach((coord: Coord) => board[coord.row * state.cols + coord.col] = state.piece.shape.value);
  };

  const onEvent = ((event: TetrisEvent): void => {
    console.log(`Event: ${event.name}`);

    if (event.hasState()) {
      state = event.data.state;

      if (event.name === TetrisEvent.GAME_OVER.name) {
        console.log('Game over');
        console.log(JSON.stringify(state));
      }



    } else {
      Object.assign(state, event.data);
    }

		mapStateToBoard();
		render();
	}) as EventListener;

  TetrisEvent.ALL.forEach((eventName) => game.registerEventListener(eventName, onEvent));

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={width()}
        height={height()}
        className="border rounded-s border-contrast-50"
      />
    </div>
  );
}

const defaultDimensions = {
  rows: 20,
  columns: 10,
  blockSize: 24,
};

const shapeColors = [
  ['#000', '#000', '#000'], // empty
  // O = yellow
  ['#FFFF00', '#DFDF00', '#AFAF00'],
  // I = cyan
  ['#00FFFF', '#00DFDF', '#00AFAF'],
  // S = green
  ['#00FF00', '#00DF00', '#00AF00'],
  // Z = red
  ['#FF0000', '#DF0000', '#AF0000'],
  // L = orange
  ['#FFC500', '#FFA500', '#CF8500'],
  // J = blue
  ['#0000FF', '#0000DF', '#0000AF'],
  // T = purple
  ['#A000A0', '#800080', '#600060'],
];
