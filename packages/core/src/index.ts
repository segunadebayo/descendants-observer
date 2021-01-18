import bindMethods from 'auto-bind';

interface Descendant<T> {
  node: T;
  index: number;
}

class DescendantsObserver<T extends HTMLElement> {
  observer?: MutationObserver;
  map = new Map<T, Descendant<T>>();

  constructor() {
    bindMethods(this);
  }

  attach(rootEl: HTMLElement) {
    this.destroy();
    this.observer = onDomRemove(rootEl, this.map, descendant => {
      this.map.delete(descendant.node);
      const sorted = sortNodes(Array.from(this.map.keys()));
      this.sort(sorted);
    });
  }

  sort(nodes: Node[]) {
    this.map.forEach(descendant => {
      descendant.index = nodes.indexOf(descendant.node);
      descendant.node.dataset.index = descendant.index.toString();
    });
  }

  getValues() {
    return Array.from(this.map.values());
  }

  getKeys() {
    return Array.from(this.map.keys());
  }

  getOrdered() {
    return this.getValues().sort((a, b) => a.index - b.index);
  }

  getFirst() {
    return this.getAtIndex(0);
  }

  getLast() {
    return this.getAtIndex(this.map.size - 1);
  }

  getAtIndex(index: number) {
    return this.getOrdered()[index];
  }

  getIndex(node?: T) {
    if (!node) return -1;
    return this.map.get(node)?.index ?? -1;
  }

  getNext(index: number, loop = false) {
    let next = index + 1;
    if (loop && next >= this.map.size) {
      next = 0;
    }
    return this.getAtIndex(next);
  }

  getPrev(index: number, loop = false) {
    let next = index - 1;
    if (loop && next < 0) {
      next = this.map.size - 1;
    }
    return this.getAtIndex(next);
  }

  destroy() {
    this.observer?.disconnect();
    this.map.clear();
  }

  registerNode(node: T | null, options: Record<string, any> = {}) {
    if (!node || this.map.has(node)) return;

    const sorted = sortNodes(this.getKeys().concat(node));

    this.map.set(node, {
      node,
      index: -1,
      ...options,
    });

    this.sort(sorted);
  }

  register(nodeOrOptions: T | null | Record<string, any>) {
    if (nodeOrOptions == null) return;

    if (nodeOrOptions instanceof HTMLElement) {
      this.registerNode(nodeOrOptions);
      return;
    }

    return (node: T | null) => {
      this.registerNode(node, nodeOrOptions);
    };
  }
}

export default DescendantsObserver;

/**
 * Sort an array of DOM nodes according to the HTML tree order
 * @see http://www.w3.org/TR/html5/infrastructure.html#tree-order
 */
function sortNodes(nodes: Node[]) {
  return nodes.sort((a, b) => {
    const compare = a.compareDocumentPosition(b);
    if (
      compare & Node.DOCUMENT_POSITION_FOLLOWING ||
      compare & Node.DOCUMENT_POSITION_CONTAINED_BY
    ) {
      // a < b
      return -1;
    } else if (
      compare & Node.DOCUMENT_POSITION_PRECEDING ||
      compare & Node.DOCUMENT_POSITION_CONTAINS
    ) {
      // a > b
      return 1;
    } else if (
      compare & Node.DOCUMENT_POSITION_DISCONNECTED ||
      compare & Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC
    ) {
      throw Error('Cannot sort the given nodes.');
    } else {
      return 0;
    }
  });
}

function isNodeDetached(el: Node | null): boolean {
  if (!el) return true;

  if (!(el instanceof HTMLElement) || el.nodeType === Node.DOCUMENT_NODE) {
    return false;
  }

  return isNodeDetached(el.parentNode);
}

function onDomRemove(
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
