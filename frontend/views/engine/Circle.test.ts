import { Circle } from "./Circle";

describe('Circle', () => {
  describe('intersection', () => {
    const cases = [
      {
        desc: 'Two circles on x-axis, same radius, spaced apart by the radius',
        c1: new Circle(0, 0, 1),
        c2: new Circle(1, 0, 1),
        expected: [
          { x: 0.5, y: Math.sqrt(3) / 2 },
          { x: 0.5, y: -Math.sqrt(3) / 2 }
        ]
      }
    ];

    // All circles are too far apart from one another to intersect
    const farApart = [
      new Circle(0, 0, 1),
      new Circle(5, 5, 2),
      new Circle(10, 10, 3),
      new Circle(15, 15, 4),
      new Circle(25, 25, 5),
    ];

    const contained = [
      {
        circle: new Circle(0, 0, 10),
        contained: [
          new Circle(0, 0, 0.001),
          new Circle(0, 0, 5),
          new Circle(0, 0, 9),
          new Circle(0, 0, 9.999),

          new Circle(1, 1, 8),
          new Circle(-1, 1, 8),
          new Circle(1, -1, 8),
          new Circle(-1, -1, 8),

          new Circle(3, 4, 4),
          new Circle(-3, 4, 4),
          new Circle(3, -4, 4),
          new Circle(-3, -4, 4),
        ],
      }
    ];

    test('identical circles intersect everywhere', () => {
      farApart.forEach((c1, i) => {
        const c2 = new Circle(c1.x, c1.y, c1.r);
        const intersections = c1.intersection(c2);

        // If circles are same, they intersect everywhere
        // No points are returned as there are infinitely many
        expect(intersections.points.length).toBe(0);
        expect(intersections.intersects).toBe(true);
        expect(intersections.state).toBe('identical circles');
      });
    });

    test('circles too far apart have no intersections', () => {
      farApart.forEach((c1, i) => {
        farApart.slice(i + 1).forEach((c2) => {
          const intersections = c1.intersection(c2);

          const points = intersections.points.map((p) => `(${p.x}, ${p.y})`).join(', ');
          const msg = `
            Expected no intersection
            ${c1.toString()}
            ${c2.toString()}
            Found points:
            ${points}
          `.replace(/^\s+/gm, '');
          if (intersections.points.length > 0) {
            console.log(msg);
          }

          expect(intersections.points.length).toBe(0);
        });
      });
    });

    test('contained circles have no intersections', () => {
      contained.forEach((testCase) => {
        const { circle, contained } = testCase;
        contained.forEach((c) => {
          const intersections = circle.intersection(c);

          const points = intersections.points.map((p) => `(${p.x}, ${p.y})`).join(', ');
          const msg = `
            Expected no intersection
            ${circle.toString()}
            ${c.toString()}
            Found points:
            ${points}
          `.replace(/^\s+/gm, '');
          if (
            intersections.points.length > 0 ||
            intersections.intersects !== false ||
            intersections.state !== 'contained circle'
          ) {
            console.log(msg);
            fail(msg);
          }

          // expect(intersections.points.length).toBe(0);
          // expect(intersections.intersects).toBe(false);
          // expect(intersections.state).toBe('contained circle');
        });
      });
    });

    test('calculates the expected intersection', () => {
      cases.forEach((testCase) => {
        const intersections = testCase.c1.intersection(testCase.c2);

        // Has the expected number of intersections
        expect(intersections.points.length).toBe(testCase.expected.length);

        // Each intersection is close to the expected point
        // !Note this may fail if the points are out of order
        intersections.points.forEach((intersection, i) => {
          expect(intersection.x).toBeCloseTo(testCase.expected[i].x, 10);
          expect(intersection.y).toBeCloseTo(testCase.expected[i].y, 10);
        });
      });
    });
  });
});
