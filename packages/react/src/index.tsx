import * as React from 'react';
import DescendantsObserver from '@descendants/core';

export function useDescendants<
  RootElement extends HTMLElement = HTMLDivElement,
  DescendantElement extends HTMLElement = HTMLElement
>() {
  const [observer] = React.useState(
    () => new DescendantsObserver<DescendantElement>()
  );
  const ref = React.useRef<RootElement>(null);

  useIsomorphicLayoutEffect(() => {
    if (!ref.current) return;
    observer.attach(ref.current);
    return () => {
      observer.destroy();
    };
  }, [observer]);

  return { ref, observer };
}

export interface UseDescendantProps extends ReturnType<typeof useDescendants> {}
export interface UseDescendantsReturn
  extends ReturnType<typeof useDescendants> {}

export const DescendantsContext = React.createContext(
  {} as UseDescendantsReturn
);

DescendantsContext.displayName = 'DescendantsProvider';

export function useDescendantsContext() {
  const context = React.useContext(DescendantsContext);

  if (context == null) {
    throw new Error(
      'useDescendantsContext must be used within DescendantsProvider'
    );
  }

  return context;
}

export function useDescendant() {
  const { observer } = useDescendantsContext();
  const [index, setIndex] = React.useState(-1);
  const ref = React.useRef<HTMLElement>(null);

  useIsomorphicLayoutEffect(() => {
    if (!ref.current) return;
    const datasetIndex = Number(ref.current.dataset.index);
    if (datasetIndex !== index) {
      setIndex(datasetIndex);
    }
  });

  return {
    index,
    ref: mergeRefs(observer.register, ref),
  };
}

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' && window?.document?.createElement
    ? React.useLayoutEffect
    : React.useEffect;

function mergeRefs<T = any>(
  ...refs: Array<React.MutableRefObject<T> | React.LegacyRef<T>>
): React.RefCallback<T> {
  return value => {
    refs.forEach(ref => {
      if (typeof ref === 'function') {
        ref(value);
      } else if (ref != null) {
        (ref as React.MutableRefObject<T | null>).current = value;
      }
    });
  };
}
