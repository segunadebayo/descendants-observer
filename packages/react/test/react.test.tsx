import { render, screen } from '@testing-library/react';
import * as React from 'react';
import { useDescendants } from '../src';

const Component = () => {
  const { ref, observer } = useDescendants();
  return (
    <>
      <pre data-testid="output">
        {JSON.stringify(observer.getValues(), null, 2)}
      </pre>
      <div ref={ref}>
        <button ref={observer.register} id="opt1">
          Option 1
        </button>
        <span>
          <button ref={observer.register} id="opt2">
            Option 2
          </button>
        </span>
        <div>
          <div>
            <button ref={observer.register} id="opt3">
              Option 3
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

describe('@descendants/react', () => {
  it('registers the node', () => {
    render(<Component />);
    const pre = screen.getByTestId('output');
    expect(pre).toMatchInlineSnapshot(`
      <pre
        data-testid="output"
      >
        []
      </pre>
    `);
  });
});
