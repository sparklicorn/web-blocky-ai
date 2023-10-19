// import Card from '../components/Card';
import Page from '../components/Page';
// import { ALIGNMENTS } from '../components/constants';
import { useEffect, useRef } from 'react';

export const pageHeaderLinks = [
  {
    icon: 'fa-solid fa-home',
    href: '/',
  },
  {
    text: 'About',
    href: '/about',
  },
  {
    text: 'Projects',
    href: '/projects',
  },
  {
    text: 'Posts',
    href: '/posts',
  },
  {
    text: 'Demos',
    dropdown: [
      {
        icon: 'fa-solid fa-cubes',
        text: 'Blocky AI',
        href: '/demos/blocky',
      },
      {
        icon: 'fa-solid fa-gears',
        text: 'Engine',
        href: '/demos/engine',
      },
      {
        icon: 'fa-regular fa-circle',
        text: 'Circle Intersection',
        href: '/demos/circle-intersection',
      },
    ]
  },
];

export const pageFooter = (<p>&copy; Jeff Gibson</p>);

export default function Main() {
  const canvasBackgroundRef = useRef<HTMLCanvasElement>(null);

  const canvasContext = (canvasRef: React.RefObject<HTMLCanvasElement>) => canvasRef.current?.getContext('2d');

  const renderBackground = (canvas: HTMLCanvasElement) => {
    const ctx = canvasContext(canvasBackgroundRef);
    if (!ctx) {
      console.log('Could not get canvas context.');
      return;
    }

    ctx.fillStyle = 'black';

  };

  useEffect(() => {
    const boardCanvas = canvasBackgroundRef.current;
    if (!boardCanvas) {
      return;
    }

    renderBackground(boardCanvas);
  }, []);

  return (
    <Page
      className=''
      navLinks={pageHeaderLinks}
      footer={pageFooter}
    >
      <div className='banner'>
        <canvas
          id='banner-canvas-background'
          ref={canvasBackgroundRef}
          className='canvas-bg w-full h-full'
        ></canvas>
        Banner
      </div>
      {/* <Card
        className='m3'

        headerIcon='fa-heart'
        header={<h2>Card Header</h2>}

        contentAlignment={ALIGNMENTS.HORIZONTAL.CENTER}

        footer={<button>Card Footer</button>}
        footerAlignment={ALIGNMENTS.HORIZONTAL.CENTER}
      >
        Card content.
      </Card> */}
    </Page>
  );
}
