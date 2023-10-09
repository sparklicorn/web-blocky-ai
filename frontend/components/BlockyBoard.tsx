import { useEffect, useRef } from 'react';
import Blocky from '../blocky/Blocky';
import { EventListener } from '../event/Event';
import BlockyEvent from '../blocky/BlockyEvent';
import Coord from '../structs/Coord';
import BlockyState from '../blocky/BlockyState';
import IBlockyGame from '../blocky/IBlockyGame';
import { bounded } from '../util/Util';

import { HorizontalLayout } from '@hilla/react-components/HorizontalLayout';
import { Icon } from '@hilla/react-components/Icon';
import { VerticalLayout } from '@hilla/react-components/VerticalLayout';

import '@vaadin/icons';

const bgColor = '#000';

type Props = {
  state?: BlockyState;
  blockSize?: number;
  previewBlockSize?: number;
  previewAmt?: number;
};

const defaultProps = {
  state: new BlockyState(),
  blockSize: 24,
  previewBlockSize: 16,
  previewAmt: 4,
};

export default function BlockyBoard(props: Props) {
  const mergedProps = Object.assign({}, defaultProps, props);
  const STATE = mergedProps.state;
  const ROWS = STATE.rows;
  const COLS = STATE.cols;
  const WIDTH = COLS * mergedProps.blockSize;
  const HEIGHT = ROWS * mergedProps.blockSize;

  const game: IBlockyGame = new Blocky(STATE);
  let board = STATE.board;

  const boardCanvasRef = useRef<HTMLCanvasElement>(null);
  const nextPieceCanvasRef = useRef<HTMLCanvasElement>(null);
  const scoreRef = useRef<HTMLDivElement>(null);
  const levelRef = useRef<HTMLDivElement>(null);

  const canvasContext = (canvasRef: React.RefObject<HTMLCanvasElement>) => canvasRef.current?.getContext('2d');

  const renderCenterText = (
    context: CanvasRenderingContext2D,
    text: string,
    fontSize: number = mergedProps.blockSize
  ) => {
    context.fillStyle = '#fff';
    context.font = `${fontSize}px Roboto Mono`;
    context.textAlign = 'center';
    context.fillText(text, WIDTH/2, HEIGHT/2);
  };

  const renderBoard = () => {
    const ctx = canvasContext(boardCanvasRef);
    if (!ctx) {
      console.log('No context to paint board canvas');
      return;
    }

    // Fill black background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // If the game is paused or hasn't yet started, don't draw anything
    if (!STATE.hasStarted) {
      renderCenterText(ctx, 'Press Enter to Start', mergedProps.blockSize/2);
      return;
    }

    if (STATE.isPaused) {
      renderCenterText(ctx, 'Paused');
      return;
    }

    // Draw blocks
    board.forEach((block, index) => {
      if (block !== 0) {
        drawBlockAtIndex(index);
      }
    });

    if (STATE.isGameOver) {
      renderCenterText(ctx, 'Game Over');
      return;
    }
  };

  const renderNextPiece = () => {
    const ctx = canvasContext(nextPieceCanvasRef);
    if (!ctx) {
      console.log('No context to paint next piece canvas');
      return;
    }

    ctx.clearRect(
      0, 0,
      5*mergedProps.previewBlockSize, 3*mergedProps.previewBlockSize*mergedProps.previewAmt
    );

    // If the game is paused or hasn't yet started, don't draw anything
    if (!STATE.hasStarted || STATE.isPaused) {
      return;
    }

    // Draw blocks
    const nextShapes = STATE.getNextShapes(mergedProps.previewAmt);

    let row = 1;
    const col = 2;

    nextShapes.forEach((shape) => {
      shape.getRotation(0).forEach((coord: Coord) => {
        // Fill main color
        ctx.fillStyle = shapeColors[shape.value][1];
        ctx.fillRect(
          (coord.col + col) * mergedProps.previewBlockSize,
          (coord.row + row) * mergedProps.previewBlockSize,
          mergedProps.previewBlockSize,
          mergedProps.previewBlockSize
        );

        // draw top and left border lines
        ctx.fillStyle = shapeColors[shape.value][0];
        ctx.fillRect(
          (coord.col + col) * mergedProps.previewBlockSize,
          (coord.row + row) * mergedProps.previewBlockSize,
          mergedProps.previewBlockSize,
          1
        );
        ctx.fillRect(
          (coord.col + col) * mergedProps.previewBlockSize,
          (coord.row + row) * mergedProps.previewBlockSize,
          1,
          mergedProps.previewBlockSize
        );

        // draw bottom and right border lines
        ctx.fillStyle = shapeColors[shape.value][2];
        ctx.fillRect(
          (coord.col + col) * mergedProps.previewBlockSize,
          ((coord.row + row) + 1) * mergedProps.previewBlockSize - 1,
          mergedProps.previewBlockSize,
          1
        );
        ctx.fillRect(
          ((coord.col + col) + 1) * mergedProps.previewBlockSize - 1,
          (coord.row + row) * mergedProps.previewBlockSize,
          1,
          mergedProps.previewBlockSize
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
    const row = bounded(Math.floor(y / mergedProps.blockSize), 0, ROWS - 1);
    const col = bounded(Math.floor(x / mergedProps.blockSize), 0, COLS - 1);
    const index = row * COLS + col;

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

  const keyListenersMap = {
    ArrowLeft: () => game.moveLeft(),
    ArrowRight: () => game.moveRight(),
    ArrowDown: () => game.moveDown(),
    Enter: () => {
      if (STATE.isGameOver) {
        game.setup();
      } else if (!STATE.hasStarted) {
        game.start();
      } else if (STATE.isPaused) {
        game.resume();
      } else {
        game.pause();
      }
    },
    Space: () => {}, // Disable spacebar scrolling
    z: () => game.rotateClockwise(),
    x: () => game.rotateCounterClockwise(),
  } as { [key: string]: () => any };

  const keyDownListener = (event: KeyboardEvent) => {
    if (keyListenersMap[event.key]) {
      keyListenersMap[event.key]();
      event.preventDefault();
    }
  };

  const mapStateToBoard = (): void => {
    board = STATE.board;

    if (STATE.piece.isActive) {
      STATE.piece.blockCoords.forEach(
        (coord: Coord) => board[coord.row * COLS + coord.col] = STATE.piece.shape.value
      );
    }
  };

  const updateLevelLabel = (): void => {
    levelRef.current!.innerText = `Level\n${STATE.level}`;
  };

  const updateScoreLabel = (): void => {
    scoreRef.current!.innerText = `Score\n${STATE.score}`;
  };

  const onEvent = ((event: BlockyEvent): void => {
    if (event.name === BlockyEvent.GAME_OVER.name) {
      console.log(JSON.stringify(event.data.state));
    }

    if (
      event.name === BlockyEvent.LEVEL_UPDATE.name ||
      event.name === BlockyEvent.SCORE_UPDATE.name ||
      event.name === BlockyEvent.START.name
    ) {
      updateLevelLabel();
      updateScoreLabel();
    }

		mapStateToBoard();
		renderBoard();
    renderNextPiece();
	}) as EventListener;

  useEffect(() => {
    console.log('BlockyBoard mounted');

    const boardCanvas = boardCanvasRef.current;
    if (!boardCanvas) {
      return;
    }

    // TODO pass in options
    game.setup();

    renderBoard();

    // boardCanvas.addEventListener('mousedown', mouseListener);
    // boardCanvas.addEventListener('mouseup', mouseUpListener);
    boardCanvas.addEventListener('contextmenu', contextMenuListener);
    // boardCanvas.addEventListener('mousemove', mouseMoveListener);

    window.addEventListener('keydown', keyDownListener);

    BlockyEvent.ALL.forEach((eventName) => game.registerEventListener(eventName, onEvent));

    return () => {
      // boardCanvas.removeEventListener('mousedown', mouseListener);
      // boardCanvas.removeEventListener('mouseup', mouseUpListener);
      boardCanvas.removeEventListener('contextmenu', contextMenuListener);
      // boardCanvas.removeEventListener('mousemove', mouseMoveListener);
      window.removeEventListener('keydown', keyDownListener);
      game.dispose();
    };
  }, [mergedProps]);

  const drawBlockAtIndex = (index: number) => {
    drawBlock(
      Math.floor(index / COLS),
      index % COLS
    );
  }

  const drawBlock = (row: number, col: number) => {
    const canvas = boardCanvasRef.current;
    const context = (canvas) ? canvas.getContext('2d') : null;

    // fill rectangle with the given shape color at given row and column
    if (context) {
      const shapeVal = board[row * COLS + col];

      // Fill in the center of the rectangle
      context.fillStyle = shapeColors[shapeVal][1];
      // If the game is over, add partial transparency to fillStyle
      if (STATE.isGameOver) {
        context.fillStyle += '40';
      }
      context.fillRect(
        col * mergedProps.blockSize,
        row * mergedProps.blockSize,
        mergedProps.blockSize,
        mergedProps.blockSize
      );

      // draw top and left border lines
      context.fillStyle = shapeColors[shapeVal][0];
      if (STATE.isGameOver) {
        context.fillStyle += '40';
      }
      context.fillRect(
        col * mergedProps.blockSize,
        row * mergedProps.blockSize,
        mergedProps.blockSize,
        1
      );
      context.fillRect(
        col * mergedProps.blockSize,
        row * mergedProps.blockSize,
        1,
        mergedProps.blockSize
      );

      // draw bottom and right border lines
      context.fillStyle = shapeColors[shapeVal][2];
      if (STATE.isGameOver) {
        context.fillStyle += '40';
      }
      context.fillRect(
        col * mergedProps.blockSize,
        (row + 1) * mergedProps.blockSize - 1,
        mergedProps.blockSize,
        1
      );
      context.fillRect(
        (col + 1) * mergedProps.blockSize - 1,
        row * mergedProps.blockSize,
        1,
        mergedProps.blockSize
      );
    } else {
      console.warn('No graphics context to draw block');
    }
  };

  const labelStyle = {
    font: '16px Roboto Mono',
    color: '#fff',
  };

  return (
    <VerticalLayout theme="spacing">
      <HorizontalLayout theme="spacing">
        <canvas
          ref={boardCanvasRef}
          width={WIDTH}
          height={HEIGHT}
          className="border rounded-s border-contrast-50"
          style={{ alignSelf: 'start' }} // Prevents the canvas from stretching to fill the parent div
        />
        <canvas
          ref={nextPieceCanvasRef}
          width={mergedProps.previewBlockSize * 5}
          height={mergedProps.previewBlockSize * 4 * mergedProps.previewAmt}
          style={{ alignSelf: 'start' }} // Prevents the canvas from stretching to fill the parent div
        />
        <VerticalLayout theme="spacing">
          <div ref={scoreRef} style={labelStyle}></div>
          <div ref={levelRef} style={labelStyle}></div>
        </VerticalLayout>
      </HorizontalLayout>
      <VerticalLayout
        id='controls'
        theme='spacing padding'
        className='border rounded-s border-contrast-50'
        style={labelStyle}
      >
        <HorizontalLayout theme='spacing' style={{ width: '100%' }}>
          <div><strong>Controls</strong></div>
          <div style={{ flexGrow: 1 }}>
            <Icon
              icon="vaadin:close"
              style={{ color: 'darkred', float: 'right' }}
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

BlockyBoard.defaultProps = defaultProps;

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
