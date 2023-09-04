import { SHAPES, Shape } from './Shape';

export default class ShapeQueue {
  static readonly DEFAULT_SIZE = 14;

  /**
   * Returns a new ShapeQueue with the same minimum size and shapes as the given ShapeQueue.
   *
   * @param other The ShapeQueue to copy.
   */
  static copy(other: ShapeQueue): ShapeQueue {
    const copy = new ShapeQueue(other._minSize);
    copy._shapes.push(...other._shapes);
    return copy;
  }

  private _minSize: number;
  private _shapes: number[];

  /**
   * Creates a new ShapeQueue with the given minimum size.
   */
  constructor(minSize: number = ShapeQueue.DEFAULT_SIZE) {
    this._minSize = minSize;
    this._shapes = [];
  }

  /**
   * Gets the number of elements currently in this ShapeQueue.
   */
  get size(): number {
    return this._shapes.length;
  }

  /**
   * Gets whether this ShapeQueue is empty.
   */
  isEmpty(): boolean {
    return this.size === 0;
  }

  /**
   * Removes the element at the front of this ShapeQueue.
   * If this ShapeQueue is empty or has fewer than minSize elements, more elements will be generated.
   *
   * @returns The element at the front of this ShapeQueue.
   */
  poll(): Shape {
    this._ensureCapacity(this._minSize + 1);
    const shapeIndex = this._shapes.shift();

    // shapeIndex is guaranteed to be defined because we just ensured capacity
    return Shape.byValue(shapeIndex || 0) as Shape;
  }

  /**
   * Returns the element at the front of this ShapeQueue without removing it.
   */
  peek(): Shape {
    this._ensureCapacity(this._minSize);
    const shapeIndex = this._shapes[0];

    // shapeIndex is guaranteed to be defined because we just ensured capacity
    return Shape.byValue(shapeIndex || 0) as Shape;
  }

  /**
   * Returns the next n elements in this ShapeQueue without removing them.
   *
   * @param n The number of elements to peek.
   * @returns An array of the next n elements in this ShapeQueue.
   */
  peekNext(n: number): Shape[] {
    this._ensureCapacity(this._minSize + n);
    return this._shapes.slice(0, n).map((shapeIndex) => {
      // shapeIndex is guaranteed to be defined because we just ensured capacity
      return Shape.byValue(shapeIndex || 0) as Shape;
    });
  }

  /**
   * Removes all elements from this ShapeQueue.
   */
  clear(): void {
    this._shapes = [];
  }

  /**
   * Ensures that this ShapeQueue has at least the given capacity.
   */
  private _ensureCapacity(capacity: number): void {
    while (this.size < capacity) {
      this._shapes.push(...randomizeShapeIndices());
    }
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
