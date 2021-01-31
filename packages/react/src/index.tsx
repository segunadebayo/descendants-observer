import Observer, { RegisterOptions } from '@descendants/core';
import * as React from 'react';

export function useDescendants<T extends HTMLElement = HTMLElement>() {
  const [observer] = React.useState(() => new Observer<T>());
  useIsomorphicLayoutEffect(() => {
    return () => observer.destroy();
  }, []);
  return { observer };
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

export function useDescendant<T extends HTMLElement = HTMLElement>(
  options: RegisterOptions = {}
) {
  const { observer } = useDescendantsContext();
  const [index, setIndex] = React.useState(-1);
  const ref = React.useRef<T>(null);

  useIsomorphicLayoutEffect(() => {
    return () => {
      if (!ref.current) return;
      observer.unregister(ref.current);
    };
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (!ref.current) return;
    const dataIndex = Number(ref.current.dataset.index);
    if (index != dataIndex && !Number.isNaN(dataIndex)) {
      setIndex(dataIndex);
    }
  });

  const refCallback = options ? observer.register(options) : observer.register;

  return {
    observer,
    index,
    enabledIndex: observer.enabledIndexOf(ref.current),
    ref,
    //@ts-ignore
    register: mergeRefs(refCallback, ref),
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
