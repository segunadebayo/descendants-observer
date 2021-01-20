import bindMethods from 'auto-bind';
import onDomRemove from './on-dom-remove';
import sortNodes from './sort-nodes';

interface Descendant<T> {
  node: T;
  index: number;
}

class DescendantsObserver<T extends HTMLElement> {
  private observer?: MutationObserver;
  private map = new Map<T, Descendant<T>>();

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

  private sort(nodes: Node[]) {
    this.map.forEach(descendant => {
      descendant.index = nodes.indexOf(descendant.node);
      descendant.node.dataset.index = descendant.index.toString();
    });
  }

  getCount() {
    return this.map.size;
  }

  getValues() {
    return Array.from(this.map.values());
  }

  getKeys() {
    return Array.from(this.map.keys());
  }

  getOrderedValues() {
    return this.getValues().sort((a, b) => a.index - b.index);
  }

  getFirst() {
    return this.getValueAtIndex(0);
  }

  getLast() {
    return this.getValueAtIndex(this.map.size - 1);
  }

  getValueAtIndex(index: number) {
    return this.getOrderedValues()[index];
  }

  getIndexByNode(node?: T) {
    if (!node) return -1;
    return this.map.get(node)?.index ?? -1;
  }

  getNext(index: number, loop = false) {
    let next = index + 1;
    if (loop && next >= this.map.size) {
      next = 0;
    }
    return this.getValueAtIndex(next);
  }

  getPrev(index: number, loop = false) {
    let next = index - 1;
    if (loop && next < 0) {
      next = this.map.size - 1;
    }
    return this.getValueAtIndex(next);
  }

  destroy() {
    this.observer?.disconnect();
    this.map.clear();
  }

  private registerNode(node: T | null, options: Record<string, any> = {}) {
    if (!node || this.map.has(node)) return;

    const sorted = sortNodes(this.getKeys().concat(node));

    this.map.set(node, {
      node,
      index: -1,
      ...options,
    });

    this.sort(sorted);
  }

  register(
    nodeOrOptions: T | null | { focusable: boolean; disabled: boolean }
  ) {
    if (nodeOrOptions == null) return;

    if (nodeOrOptions instanceof HTMLElement) {
      this.registerNode(nodeOrOptions);
      return;
    }

    return (node: T | null) => {
      const { focusable, disabled } = nodeOrOptions;

      const trulyDisabled = disabled && !focusable;

      if (!trulyDisabled) {
        this.registerNode(node, nodeOrOptions);
      }
    };
  }
}

export default DescendantsObserver;
