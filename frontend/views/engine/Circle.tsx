const EPSILON = 1e-10;

export type Point = {
  x: number,
  y: number
};

export enum CircleIntersectionState {
  UNKNOWN = 'unknown',
  IDENTICAL_CIRCLES = 'identical circles',
  TOO_FAR_APART = 'too far apart',
  CONTAINED_CIRCLE = 'contained circle',
  SINGLE_POINT = 'single point',
  TWO_POINTS = 'two points'
};

export type CircleIntersectionResult = {
  intersects: boolean,
  distBetween: number,
  points: Point[],
  state: CircleIntersectionState
};

export class Circle {
  x: number;
  y: number;
  r: number;

  constructor(x: number, y: number, r: number) {
    this.x = x;
    this.y = y;
    this.r = r;
  }

  intersection(other: Circle, epsilon: number = EPSILON) {
    const distX = other.x - this.x;
    const distY = other.y - this.y;
    const distBetween = Math.sqrt(distX**2 + distY**2);
    const sumOfRadii = this.r + other.r;

    const points: Point[] = [];
    const result: CircleIntersectionResult = {
      intersects: false,
      distBetween,
      points,
      state: CircleIntersectionState.UNKNOWN
    };

    // Too far apart
    if (distBetween > sumOfRadii) {
      result.state = CircleIntersectionState.TOO_FAR_APART;
      return result;
    }

    // One envelopes the other
    if (distBetween < Math.abs(this.r - other.r)) {
      result.state = CircleIntersectionState.CONTAINED_CIRCLE;
      return result;
    }

    // The circles are the same - Infinite points of intersection
    if (this.equals(other)) {
      result.state = CircleIntersectionState.IDENTICAL_CIRCLES;
      result.intersects = true;
      return result;
    }

    // At this point, there is at least one point of intersection.
    result.intersects = true;

    // Distance from the center of this circle to the center of the intersection
    const a = (this.r**2 - other.r**2 + distBetween**2) / (2 * distBetween);
    // The center of the intersection, on the line between the two circle centers
    const midPt = {
      x: this.x + (a * distX / distBetween),
      y: this.y + (a * distY / distBetween)
    };

    // Single point of intersection
    if (
      Math.abs(distBetween - sumOfRadii) < epsilon ||
      Math.abs(distBetween - Math.abs(this.r - other.r)) < epsilon
    ) {
      result.state = CircleIntersectionState.SINGLE_POINT;
      points.push({
        x: this.x + (a * distX / distBetween),
        y: this.y + (a * distY / distBetween)
      });
      return result;
    }

    // Distance from the center of the intersection to the intersection point(s)
    const c = Math.sqrt(this.r**2 - a**2);

    result.state = CircleIntersectionState.TWO_POINTS;
    points.push({
      x: midPt.x - (c * distY / distBetween),
      y: midPt.y + (c * distX / distBetween)
    });
    points.push({
      x: midPt.x + (c * distY / distBetween),
      y: midPt.y - (c * distX / distBetween)
    });

    return result;
  }

  equals(other: Circle) {
    return (this.x === other.x && this.y === other.y && this.r === other.r);
  }

  toString() {
    return `Circle{(${this.x}, ${this.y}), r: ${this.r}}`;
  }
}
