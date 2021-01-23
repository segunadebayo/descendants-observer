export function isElement(el: any): el is HTMLElement {
  return (
    typeof el == 'object' &&
    'nodeType' in el &&
    el.nodeType === Node.ELEMENT_NODE
  );
}

function isNodeDetached(el: Node | null): boolean {
  if (!el) return true;

  if (!isElement(el) || el.nodeType === Node.DOCUMENT_NODE) {
    return false;
  }

  return isNodeDetached(el.parentNode);
}

interface DomRemoveOptions {
  target: HTMLElement;
  map: Map<any, any>;
  forEach: (item: any) => void;
  onMutation?: () => void;
}

export default function onDomRemove(options: DomRemoveOptions) {
  const { target, map, forEach, onMutation } = options;

  const observer = new MutationObserver(() => {
    map.forEach(item => {
      if (item && isNodeDetached(item.node)) {
        forEach(item);
      }
    });
    onMutation?.();
  });

  observer.observe(target, {
    childList: true,
    subtree: true,
  });

  return observer;
}
