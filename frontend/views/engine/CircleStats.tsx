import { CircleElement } from "./CircleIntersectionToolView";

export default function CircleStats(props: {
  circleElement: CircleElement;
  name: string;
  onChangeHook?: () => void;
}) {
  const { circle, color, xRef, yRef, rRef } = props.circleElement;

  const createRow = (
    defaultValue: number,
    label: string,
    ref?: React.RefObject<HTMLInputElement>,
    onChangeHook?: (e: React.ChangeEvent<HTMLInputElement>) => void
  ) => (
    <div className='row center-y'>
      <label htmlFor={`${props.name}-${label}`}>{ label }:</label>
      <input
          id={`${props.name}-${label}`}
          ref={ref}
          type='number'
          defaultValue={defaultValue}
          onChange={(e) => {
            if (onChangeHook) {
              onChangeHook(e);
            }

            if (props.onChangeHook) {
              props.onChangeHook();
            }
          }}
        />
    </div>
  );

  return (
    <div className='vertical px2'>
      <h3>{props.name}</h3>

      { createRow(circle.x, 'x', xRef, (e) => circle.x = Number(e.target.value)) }
      { createRow(circle.y, 'y', yRef, (e) => circle.y = Number(e.target.value)) }
      { createRow(circle.r, 'r', rRef, (e) => circle.r = Number(e.target.value)) }

      <div className='row center-y'>
        <label htmlFor={`${props.name}-color`}>color:</label>
        <input
          id={`${props.name}-color`}
          type='color'
          defaultValue={color}
          style={{
            border: `2px solid ${color}`
          }}
          onChange={(e) => {
            props.circleElement.color = e.target.value;
            // Update the border color to match
            e.target.style.border = `2px solid ${e.target.value}`;
            if (props.onChangeHook) {
              props.onChangeHook();
            }
          }}
        />
      </div>
    </div>
  );
};
