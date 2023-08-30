import { useEffect, useRef, useState } from 'react';

export default function TetrisAiView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState(defaultDimensions);
  const [board, setBoard] = useState(demoBoard);

  const width = (): number => dimensions.cols * dimensions.blockSize;
  const height = (): number => dimensions.rows * dimensions.blockSize;

  const getContext = (): CanvasRenderingContext2D => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) {
      throw new Error('No context');
    }

    return ctx;
  };

  const drawBlock = (row: number, col: number) => {
    const context = getContext();
    const shapeVal = board[row * dimensions.cols + col];
    const blockSize = dimensions.blockSize;
    const topLeft = {
      x: col * blockSize,
      y: row * blockSize
    };
    const bottomRight = {
      x: (col + 1) * blockSize - 1,
      y: (row + 1) * blockSize - 1
    };

    // Fill the rectangle
    context.fillStyle = shapeColors[shapeVal][1];
    context.fillRect(topLeft.x, topLeft.y, blockSize, blockSize);
    // For texture, draw top and left border lines in a lighter color
    context.fillStyle = shapeColors[shapeVal][0];
    context.fillRect(topLeft.x, topLeft.y, blockSize, 1);
    context.fillRect(topLeft.x, topLeft.y, 1, blockSize);
    // Bottom and right border lines, in a darker color
    context.fillStyle = shapeColors[shapeVal][2];
    context.fillRect(bottomRight.x, topLeft.y, 1, blockSize);
    context.fillRect(topLeft.x, bottomRight.y, blockSize, 1);
  };

  useEffect(() => {
    const ctx = getContext();

    // Draw background
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width(), height());

    // Draw blocks
    board.forEach((block, index) => {
      if (block !== 0) {
        drawBlock(
          Math.floor(index / dimensions.cols),
          index % dimensions.cols
        );
      }
    });
  }, [dimensions, board]);

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
  blockSize: 20,
  rows: 20,
  cols: 10,
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

const demoBoard = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 2,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 2,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 2,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 2,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 6, 6, 6, 0, 0, 3, 3, 0,
  0, 0, 3, 3, 6, 0, 3, 3, 2, 0,
  7, 3, 3, 7, 6, 6, 1, 1, 2, 0,
  7, 7, 7, 7, 6, 2, 1, 1, 2, 0,
  7, 4, 4, 7, 6, 2, 5, 4, 2, 0,
  1, 1, 4, 4, 5, 2, 5, 4, 4, 0,
  1, 1, 5, 5, 5, 2, 5, 5, 4, 0
];
