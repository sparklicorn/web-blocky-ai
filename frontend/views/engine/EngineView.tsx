import { useEffect, useRef } from "react";

import { VerticalLayout } from "@hilla/react-components/VerticalLayout";
import { HorizontalLayout } from "@hilla/react-components/HorizontalLayout";
import { Icon } from "@hilla/react-components/Icon";
import "@vaadin/icons";

import Engine from "./Engine";

type Props = {
  engine: Engine;
};

export default function EngineView(props: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef?.current;

    if (!canvas) {
      throw new Error('Canvas not found. Cannot initialize engine.');
    }

    props.engine.connect(canvas);

    return () => {
      props.engine.stop();
    };
  }, []);

  const updateFps = () => {
    const fpsInput = document.getElementById('fps')! as HTMLInputElement;
    const fpsValue = document.getElementById('fps-value')!;
    const fps = fpsInput.value;

    props.engine.fps = parseInt(fps);
    fpsInput.value = fps;
    fpsValue!.innerHTML = fps;
  }

  return (
    <>
      <VerticalLayout>
        <HorizontalLayout
          id="title-bar"
          theme="spacing padding"
          className="border rounded-s border-contrast-50"
          style={{ width: '100%' }}
        >
          <div>
            Canvas2D Game Engine
          </div>
          {/* <div style={{ flexGrow: 1 }}>
            <Icon
              icon="vaadin:close"
              style={{ color: 'darkred', float: 'right' }}
              // On click, hide the controls VerticalLayout
              onClick={() => document.getElementById('title-bar')!.style.display = 'none'}
            />
          </div> */}
          <button
            className="btn btn-primary"
            onClick={() => props.engine.start()}
          >
            Start
          </button>
          <button
            className="btn btn-primary"
            onClick={() => props.engine.stop()}
          >
            Stop
          </button>
          <button
            className="btn btn-primary"
            onClick={() => props.engine.goToMainScene()}
          >
            Start Without Timer
          </button>
          <button
            className="btn btn-primary"
            onClick={() => props.engine.gameloop()}
          >
            Gameloop
          </button>
          {
            // Range input from Engine.MIN_FPS to Engine.MAX_FPS
          }
          <label
            htmlFor="fps"
            style={{ marginRight: '0.5rem' }}
          >
            FPS:
          </label>
          <input
            id="fps"
            type="range"
            min={Engine.MIN_FPS}
            max={Engine.MAX_FPS}
            defaultValue={props.engine.fps}
            onChange={updateFps}
            onInput={updateFps}
          />
          <p id="fps-value">{props.engine.fps}</p>
        </HorizontalLayout>

        <canvas
          id="engine-canvas"
          ref={canvasRef}
          width="100"
          height="100"
        />
      </VerticalLayout>
    </>
  );
}

EngineView.defaultProps = {
  engine: new Engine(),
};
