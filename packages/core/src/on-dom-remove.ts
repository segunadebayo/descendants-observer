function isNodeDetached(el: Node | null): boolean {
  if (!el) return true;

  if (!(el instanceof HTMLElement) || el.nodeType === Node.DOCUMENT_NODE) {
    return false;
  }

  return isNodeDetached(el.parentNode);
}

export default function onDomRemove(
  node: HTMLElement,
  map: Map<any, any>,
  fn: (item: any) => void
) {
  const observer = new MutationObserver(() => {
    map.forEach(item => {
      if (item && isNodeDetached(item.node)) {
        fn(item);
      }
    });
  });

  observer.observe(node, {
    childList: true,
    subtree: true,
  });

  return observer;
}
