import { SHAPES, Shape } from './Shape';

export default class ShapeQueue {
  static readonly DEFAULT_SIZE = 14;

  static copy(other: ShapeQueue): ShapeQueue {
    const copy = new ShapeQueue(other.minSize);
    copy._shapes.push(...other._shapes);
    return copy;
  }

  private minSize: number;
  private _shapes: number[];

  constructor(minSize: number = ShapeQueue.DEFAULT_SIZE) {
    this.minSize = minSize;
    this._shapes = [];
  }

  get size(): number {
    return this._shapes.length;
  }

  isEmpty(): boolean {
    return this.size === 0;
  }

  ensureCapacity(capacity: number): void {
    while (this.size < capacity) {
      this._shapes.push(...randomizeShapeIndices());
    }
  }

  poll(): Shape {
    this.ensureCapacity(this.minSize + 1);
    const shapeIndex = this._shapes.shift();

    // shapeIndex is guaranteed to be defined because we just ensured capacity
    return Shape.byValue(shapeIndex || 0) as Shape;
  }

  peek(): Shape {
    this.ensureCapacity(this.minSize);
    const shapeIndex = this._shapes[0];

    // shapeIndex is guaranteed to be defined because we just ensured capacity
    return Shape.byValue(shapeIndex || 0) as Shape;
  }

  peekNext(n: number): Shape[] {
    this.ensureCapacity(this.minSize + n);
    return this._shapes.slice(0, n).map((shapeIndex) => {
      // shapeIndex is guaranteed to be defined because we just ensured capacity
      return Shape.byValue(shapeIndex || 0) as Shape;
    });
  }

  clear(): void {
    this._shapes = [];
  }
}

/**
 * Returns an array of shape indices in random order.
 */
const randomizeShapeIndices = (): number[] => {
  return shuffle(range(1, SHAPES.length));
};

/**
 * Shuffles the given array in place using the Fisher-Yates algorithm.
 */
const shuffle = (arr: any[]): any[] => {
  for (let i = arr.length - 1; i > 0; i--) {
    swap(arr, i, Math.floor(Math.random() * (i + 1)));
  }
  return arr;
};

/**
 * Swaps the elements at the given indices in the given array.
 */
const swap = (arr: any[], i: number, j: number): void => {
  const temp = arr[i];
  arr[i] = arr[j];
  arr[j] = temp;
};

/**
 * Returns an array of numbers from start to end, inclusive.
 */
const range = (start: number, end: number): number[] => {
  const result = [];
  for (let i = start; i <= end; i++) {
    result.push(i);
  }
  return result;
};
