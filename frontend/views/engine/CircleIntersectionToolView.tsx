import Page from "../../components/Page";
import { pageFooter, pageHeaderLinks } from "../Main";
import { createRef, useEffect, useRef } from "react";

import CircleStats from "./CircleStats";
import { Circle, CircleIntersectionResult, CircleIntersectionState } from "./Circle";

const P = 8;
const W = 512;
const H = 512;

const distFromCircle = (circle: Circle, x: number, y: number) => {
  const dX = circle.x - x;
  const dY = circle.y - y;
  return Math.sqrt(dX**2 + dY**2);
}

export type CircleElement = {
  circle: Circle;
  color: string;
  xRef: React.RefObject<HTMLInputElement>;
  yRef: React.RefObject<HTMLInputElement>;
  rRef: React.RefObject<HTMLInputElement>;
};

export default function CircleIntersectionToolView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const iIntersectsRef = createRef<HTMLSpanElement>();
  const iDRef = createRef<HTMLSpanElement>();
  const iPointsRef = createRef<HTMLTextAreaElement>();
  const iIconRef = createRef<HTMLElement>();
  const circleElements: CircleElement[] = [
    {
      circle: new Circle(200, 200, 150),
      color: '#ff0000',
      xRef: createRef<HTMLInputElement>(),
      yRef: createRef<HTMLInputElement>(),
      rRef: createRef<HTMLInputElement>()
    },
    {
      circle: new Circle(325, 325, 130),
      color: '#0000ff',
      xRef: createRef<HTMLInputElement>(),
      yRef: createRef<HTMLInputElement>(),
      rRef: createRef<HTMLInputElement>()
    }
  ];

  let target: {
    cwr: typeof circleElements[0] | null;
    context: 'resize' | 'move' | 'none';
    x: number;
    y: number;
    offsetX?: number;
    offsetY?: number;
  } = {
    cwr: null,
    context: 'none',
    x: 0,
    y: 0,
  };

  let intersection: CircleIntersectionResult = {
    intersects: false,
    distBetween: 0,
    points: [],
    state: CircleIntersectionState.UNKNOWN
  };

  const syncAndRender = (circleElement?: CircleElement) => {
    intersection = circleElements[0].circle.intersection(circleElements[1].circle);

    // Update input elements
    if (circleElement) {
      circleElement.xRef!.current!.value = circleElement.circle.x.toString();
      circleElement.yRef!.current!.value = circleElement.circle.y.toString();
      circleElement.rRef!.current!.value = circleElement.circle.r.toString();
    }

    // Update intersection display values
    const points = intersection.points.map(point => (
      `(${point.x.toFixed(4)}, ${point.y.toFixed(4)})`
    )).join(', ');
    iIntersectsRef!.current!.textContent = intersection.state;
    iDRef!.current!.textContent = intersection.distBetween.toFixed(4).toString();
    iPointsRef!.current!.textContent = points;
    iIconRef!.current!.className = `fa-solid fa-circle-${intersection.intersects ? 'check success' : 'xmark error'}`;

    render();
  }

  const render = () => {
    const ctx = canvasRef?.current?.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas not found. Cannot render.');
    }

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Draw circles
    circleElements.forEach(circleElement => {
      const { circle, color, xRef, yRef, rRef } = circleElement;

      // Draw circle border
      ctx.beginPath();
      ctx.arc(circle.x, H - circle.y, circle.r, 0, 2 * Math.PI);
      ctx.strokeStyle = color;
      ctx.stroke();

      // Draw circle center as a plus sign
      ctx.beginPath();
      ctx.moveTo(circle.x - circle.r/16, H - circle.y);
      ctx.lineTo(circle.x + circle.r/16, H - circle.y);
      ctx.moveTo(circle.x, H - circle.y - circle.r/16);
      ctx.lineTo(circle.x, H - circle.y + circle.r/16);
      ctx.strokeStyle =color;
      ctx.stroke();
    });

    // Draw intersection as smaller circles
    intersection.points.forEach(point => {
      ctx.beginPath();
      ctx.arc(point.x, H - point.y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = 'white';
      ctx.fill();
    });

    // If there is a target circle, fill it with a dimmer color
    const circleElement = target.cwr;
    if (circleElement) {
      const { circle, color } = circleElement;
      ctx.beginPath();
      ctx.arc(circle.x, H - circle.y, circle.r, 0, 2 * Math.PI);
      ctx.fillStyle = `${color}80`;
      ctx.fill();
    }
  };

  const mouseDownListener = (e: MouseEvent) => {
    const rect = canvasRef?.current?.getBoundingClientRect();
    // x and y normalized to canvas in cartesian coordinates
    const x = e.clientX - rect!.left;
    const y = H - (e.clientY - rect!.top);

    // if out of canvas bounds, return
    if (x < 0 || x > W || y < 0 || y > H) {
      return;
    }

    // If clicked within P of circle radius, set target to that circle with context 'resize'
    const cwr = circleElements.find(cwr => {
      const dist = distFromCircle(cwr.circle, x, y);
      return dist < cwr.circle.r + P && dist > cwr.circle.r - P;
    });

    if (cwr) {
      target = {
        cwr,
        context: 'resize',
        x,
        y,
        offsetX: x - cwr.circle.x,
        offsetY: y - cwr.circle.y
      };
      return;
    }

    // If no circle has a border there, set target to the closest circle with context 'move'
    const closest = circleElements.filter(cwr => {
      // Filter out circles that are too far away from click
      return distFromCircle(cwr.circle, x, y) < cwr.circle.r + P;
    }).reduce((closest, cwr) => {
      // Find the closest one
      const dist = distFromCircle(cwr.circle, x, y);
      return dist < closest.dist ? { cwr: cwr, dist } : closest;
    }, { cwr: null as typeof circleElements[0] | null, dist: Infinity });

    if (closest.cwr) {
      target = {
        cwr: closest.cwr,
        context: 'move',
        x,
        y,
        offsetX: x - closest.cwr.circle.x,
        offsetY: y - closest.cwr.circle.y
      };
    }
  };

  const mouseUpListener = (e: MouseEvent) => {
    target = {
      cwr: null,
      context: 'none',
      x: 0,
      y: 0
    };
    render();
  };

  const mouseMoveListener = (e: MouseEvent) => {
    const rect = canvasRef?.current?.getBoundingClientRect();
    // x and y normalized to canvas
    const x = e.clientX - rect!.left;
    const y = H - (e.clientY - rect!.top);

    // if out of canvas bounds, return
    if (x < 0 || x > W || y < 0 || y > H) {
      return;
    }

    if (target.cwr) {
      if (target.context === 'resize') {
        const dX = x - target.cwr.circle.x;
        const dY = y - target.cwr.circle.y;
        target.cwr.circle.r = Math.sqrt(dX**2 + dY**2);
      } else if (target.context === 'move') {
        target.cwr.circle.x = x - (target.offsetX || 0);
        target.cwr.circle.y = y - (target.offsetY || 0);
      }

      syncAndRender(target.cwr);
    }
  };

  useEffect(() => {
    syncAndRender();
    window.addEventListener('mousedown', mouseDownListener);
    window.addEventListener('mouseup', mouseUpListener);
    window.addEventListener('mousemove', mouseMoveListener);
    return () => {
      window.removeEventListener('mousedown', mouseDownListener);
      window.removeEventListener('mouseup', mouseUpListener);
      window.removeEventListener('mousemove', mouseMoveListener);
    };
  }, []);

  return (
    <Page navLinks={pageHeaderLinks} footer={pageFooter}>
      <div className='mt2 center vertical'>
        <canvas
          id='circle-intersection-tool-canvas'
          ref={canvasRef}
          width={W}
          height={H}
        ></canvas>
        <div className='row mt2 w-half'>
          {
            circleElements.map((circleElement, index) => (
              <CircleStats
                key={`circle-stats-${index + 1}`}
                circleElement={circleElement}
                name={`Circle ${index + 1}`}
                onChangeHook={() => syncAndRender(circleElement)}
              />
            ))
          }

          <div className='p2 vertical'>
            <h3>Intersection</h3>
            <div className='row center-y'>
              <span>Intersects?:</span>
              <i className='fa-solid fa-circle-xmark error' ref={iIconRef}></i>
              <span id='intersection-intersects' ref={iIntersectsRef}></span>
            </div>
            <div className='row center-y'>
              <span>Distance between:</span>
              <span id={`intersection-distance`} ref={iDRef}></span>
            </div>
            <span>Points:</span>
            <textarea id={`intersection-points`} ref={iPointsRef}></textarea>
          </div>
        </div>
      </div>
    </Page>
  );
}
