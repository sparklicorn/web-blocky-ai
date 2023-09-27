import { useEffect, useRef, useState } from 'react';
import Tetris from '../tetris/Tetris';
import { EventListener } from '../event/Event';
import TetrisEvent from '../tetris/TetrisEvent';
import Coord from '../structs/Coord';
import TetrisState from '../tetris/TetrisState';
import ITetrisGame from '../tetris/ITetrisGame';
import { bounded } from '../util/Util';

import { HorizontalLayout } from '@hilla/react-components/HorizontalLayout';
import { Icon } from '@hilla/react-components/Icon';
import { VerticalLayout } from '@hilla/react-components/VerticalLayout';

import '@vaadin/icons';

const bgColor = '#000';

export default function TetrisBoard() {
  const [dimensions, setDimensions] = useState(defaultDimensions);
  const boardCanvasRef = useRef<HTMLCanvasElement>(null);
  const nextPieceCanvasRef = useRef<HTMLCanvasElement>(null);
  const scoreRef = useRef<HTMLDivElement>(null);
  const levelRef = useRef<HTMLDivElement>(null);

  let board : number[] = Array(dimensions.rows * dimensions.columns).fill(0);
  const state: TetrisState = new TetrisState();
  const game: ITetrisGame = new Tetris(state);

  const width = () => dimensions.columns * dimensions.blockSize;
  const height = () => dimensions.rows * dimensions.blockSize;
  const canvasContext = (canvasRef: React.RefObject<HTMLCanvasElement>) => canvasRef.current?.getContext('2d');

  const renderCenterText = (
    context: CanvasRenderingContext2D,
    text: string,
    fontSize: number = dimensions.blockSize
  ) => {
    context.fillStyle = '#fff';
    context.font = `${fontSize}px Roboto Mono`;
    context.textAlign = 'center';
    context.fillText(text, width() / 2, height() / 2);
  };

  const renderBoard = () => {
    const ctx = canvasContext(boardCanvasRef);
    if (!ctx) {
      console.log('No context to paint board canvas');
      return;
    }

    // Fill black background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width(), height());

    // If the game is paused or hasn't yet started, don't draw anything
    if (!state.hasStarted) {
      renderCenterText(ctx, 'Press Enter to Start', dimensions.blockSize/2);
      return;
    }

    if (state.isPaused) {
      renderCenterText(ctx, 'Paused');
      return;
    }

    // Draw blocks
    board.forEach((block, index) => {
      if (block !== 0) {
        drawBlockAtIndex(index);
      }
    });

    if (state.isGameOver) {
      renderCenterText(ctx, 'Game Over');
    }
  };

  const renderNextPiece = () => {
    const ctx = canvasContext(nextPieceCanvasRef);
    if (!ctx) {
      console.log('No context to paint next piece canvas');
      return;
    }

    ctx.clearRect(0, 0, dimensions.previewSize*5, dimensions.previewSize*3*dimensions.previewAmt);

    // If the game is paused or hasn't yet started, don't draw anything
    if (!state.hasStarted || state.isPaused) {
      return;
    }

    // Draw blocks
    const nextShapes = state.getNextShapes(dimensions.previewAmt);

    let row = 1;
    const col = 2;

    nextShapes.forEach((shape, index) => {
      shape.getRotation(0).forEach((coord: Coord) => {
        // Fill main color
        ctx.fillStyle = shapeColors[shape.value][1];
        ctx.fillRect(
          (coord.col + col) * dimensions.previewSize,
          (coord.row + row) * dimensions.previewSize,
          dimensions.previewSize,
          dimensions.previewSize
        );

        // draw top and left border lines
        ctx.fillStyle = shapeColors[shape.value][0];
        ctx.fillRect(
          (coord.col + col) * dimensions.previewSize,
          (coord.row + row) * dimensions.previewSize,
          dimensions.previewSize,
          1
        );
        ctx.fillRect(
          (coord.col + col) * dimensions.previewSize,
          (coord.row + row) * dimensions.previewSize,
          1,
          dimensions.previewSize
        );

        // draw bottom and right border lines
        ctx.fillStyle = shapeColors[shape.value][2];
        ctx.fillRect(
          (coord.col + col) * dimensions.previewSize,
          ((coord.row + row) + 1) * dimensions.previewSize - 1,
          dimensions.previewSize,
          1
        );
        ctx.fillRect(
          ((coord.col + col) + 1) * dimensions.previewSize - 1,
          (coord.row + row) * dimensions.previewSize,
          1,
          dimensions.previewSize
        );
      });

      row += 3;
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
    const rect = boardCanvasRef.current?.getBoundingClientRect();
    const x = event.clientX - rect!.left;
    const y = event.clientY - rect!.top;
    const row = bounded(Math.floor(y / dimensions.blockSize), 0, dimensions.rows - 1);
    const col = bounded(Math.floor(x / dimensions.blockSize), 0, dimensions.columns - 1);
    const index = row * dimensions.columns + col;

    // console.log(`Mouse ${event.button} at {${row}, ${col}} index ${index}`);

    // If right-click, remove block at index
    if (event.button === 2) {
      // Do nothing if there is no block at index
      if (board[index] === 0) {
        return;
      }

      // console.log(`Removing block at {${row}, ${col}} index ${index}`);
      board[index] = 0;
      // setBlocks(blocks.map((block, i) => (i === index) ? 0 : block));
    } else {
      // Do nothing if there is already a block at index
      if (board[index] !== 0) {
        return;
      }

      // If left-click, add block at index
      // console.log(`Adding block at {${row}, ${col}} index ${index}`);
      // setBlocks(blocks.map((block, i) => (i === index) ? 1 : block));
      board[index] = 1;
    }

    renderBoard();
  };

  useEffect(() => {
    const boardCanvas = boardCanvasRef.current;
    if (!boardCanvas) {
      return;
    }

    renderBoard();

    // boardCanvas.addEventListener('mousedown', mouseListener);
    // boardCanvas.addEventListener('mouseup', mouseUpListener);
    boardCanvas.addEventListener('contextmenu', contextMenuListener);
    // boardCanvas.addEventListener('mousemove', mouseMoveListener);

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
        if (!game.rotateClockwise()) {
          // log the game state to see what happened
          console.log('Cannot rotate clockwise');
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
      // boardCanvas.removeEventListener('mousedown', mouseListener);
      // boardCanvas.removeEventListener('mouseup', mouseUpListener);
      boardCanvas.removeEventListener('contextmenu', contextMenuListener);
      // boardCanvas.removeEventListener('mousemove', mouseMoveListener);
    };
  }, [dimensions]);

  const drawBlockAtIndex = (index: number) => {
    drawBlock(
      Math.floor(index / dimensions.columns),
      index % dimensions.columns
    );
  }

  const drawBlock = (row: number, col: number) => {
    const canvas = boardCanvasRef.current;
    const context = (canvas) ? canvas.getContext('2d') : null;

    // fill rectangle with the given shape color at given row and column
    if (context) {
      const shapeVal = board[row * state.cols + col];

      // Fill in the center of the rectangle
      context.fillStyle = shapeColors[shapeVal][1];
      // If the game is over, add partial transparency to fillStyle
      if (state.isGameOver) {
        context.fillStyle += '40';
      }
      context.fillRect(
        col * dimensions.blockSize,
        row * dimensions.blockSize,
        dimensions.blockSize,
        dimensions.blockSize
      );

      // draw top and left border lines
      context.fillStyle = shapeColors[shapeVal][0];
      if (state.isGameOver) {
        context.fillStyle += '40';
      }
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

      // draw bottom and right border lines
      context.fillStyle = shapeColors[shapeVal][2];
      if (state.isGameOver) {
        context.fillStyle += '40';
      }
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
      console.warn('No graphics context to draw block');
    }
  };

  const mapStateToBoard = (): void => {
    board = state.board;

    if (state.piece.isActive) {
      state.piece.blockCoords.forEach(
        (coord: Coord) => board[coord.row * state.cols + coord.col] = state.piece.shape.value
      );
    }
  };

  const updateLevelLabel = (): void => {
    levelRef.current!.innerText = `Level\n${state.level}`;
  };

  const updateScoreLabel = (): void => {
    scoreRef.current!.innerText = `Score\n${state.score}`;
  };

  const onEvent = ((event: TetrisEvent): void => {
    console.log(`Event: ${event.name}`);

    if (event.name === TetrisEvent.GAME_OVER.name) {
      console.log(JSON.stringify(event.data.state));
    }

    if (
      event.name === TetrisEvent.LEVEL_UPDATE.name ||
      event.name === TetrisEvent.SCORE_UPDATE.name ||
      event.name === TetrisEvent.START.name
    ) {
      updateLevelLabel();
      updateScoreLabel();
    }

		mapStateToBoard();
		renderBoard();
    renderNextPiece();
	}) as EventListener;

  TetrisEvent.ALL.forEach((eventName) => game.registerEventListener(eventName, onEvent));

  const labelStyle = {
    font: '16px Roboto Mono',
    color: '#fff',
  };

  return (
    <VerticalLayout theme="spacing">
      <HorizontalLayout theme="spacing">
        <canvas
          ref={boardCanvasRef}
          width={width()}
          height={height()}
          className="border rounded-s border-contrast-50"
          style={{ alignSelf: 'start' }} // Prevents the canvas from stretching to fill the parent div
        />
        <canvas
          ref={nextPieceCanvasRef}
          width={dimensions.previewSize * 5}
          height={dimensions.previewSize * 4 * dimensions.previewAmt}
          style={{ alignSelf: 'start' }} // Prevents the canvas from stretching to fill the parent div
        />
        <VerticalLayout theme="spacing">
          <div
            ref={scoreRef}
            style={labelStyle}
          ></div>
          <div
            ref={levelRef}
            style={labelStyle}
          ></div>
        </VerticalLayout>
      </HorizontalLayout>
      <VerticalLayout
        id='controls'
        theme='spacing padding'
        className='border rounded-s border-contrast-50'
        style={labelStyle}
      >
        <HorizontalLayout
          theme='spacing'
          style={{ width: '100%' }}
        >
          <div><strong>Controls</strong></div>
          <div
            style={{ flexGrow: 1 }}
          >
            { /* Icon that is right-aligned in its parent div */ }
            <Icon
              icon="vaadin:close"
              style={{
                color: 'darkred',
                float: 'right'
              }}
              // On click, hide the controls VerticalLayout
              onClick={() => document.getElementById('controls')!.style.display = 'none'}
            />
          </div>
        </HorizontalLayout>
        <div>[ <strong>ENTER</strong> ] Start / Pause / Resume</div>
        <div>[ <strong>ARROW KEYS &#8592; &#8593; &#8594;</strong> ] Move</div>
        <div>[ <strong>Z, X</strong> ]: Rotate Clockwise, or Counterclockwise</div>
      </VerticalLayout>
    </VerticalLayout>
  );
}

const defaultDimensions = {
  rows: 20,
  columns: 10,
  blockSize: 24,
  previewSize: 16,
  previewAmt: 4,
};

const shapeColors = [
  ['#000000', '#000000', '#000000'], // empty
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
