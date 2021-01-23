import bind from 'auto-bind';
import onDomRemove, { isElement } from './on-dom-remove';
import sortNodes from './sort-nodes';

export interface RegisterOptions {
  disabled?: boolean;
  id?: string;
}
export interface Descendant<T> extends RegisterOptions {
  node: T;
  index: number;
}

export interface AttachOptions {
  target: HTMLElement;
  onMutation?: () => void;
}

function nextIndex(current: number, max: number, loop: boolean) {
  let next = current + 1;
  if (loop && next >= max) next = 0;
  return next;
}

function prevIndex(current: number, max: number, loop: boolean) {
  let next = current - 1;
  if (loop && next < 0) next = max;
  return next;
}

class DescendantsObserver<T extends HTMLElement> {
  private observer?: MutationObserver;
  private nodes = new Map<T, Descendant<T>>();

  constructor() {
    bind(this);
  }

  /**
   * Method to attach the MutatationObserver to the target
   * and invokes the function when a child is removed.
   */
  attach(options: AttachOptions) {
    const { target, onMutation } = options;

    this.observer = onDomRemove({
      target,
      map: this.nodes,
      onMutation,
      forEach: descendant => {
        this.nodes.delete(descendant.node);
        const sorted = sortNodes(Array.from(this.nodes.keys()));
        this.assignIndex(sorted);
      },
    });
  }

  /**
   * Method to detach and cleanup the MutationObserver and nodelist
   */
  destroy() {
    this.observer?.disconnect();
    this.nodes.clear();
  }

  private assignIndex(nodes: Node[]) {
    this.nodes.forEach(descendant => {
      descendant.index = nodes.indexOf(descendant.node);
      descendant.node.dataset.index = descendant.index.toString();
    });
  }

  count() {
    return this.nodes.size;
  }

  enabledCount() {
    return this.enabledValues().length;
  }

  values() {
    const values = Array.from(this.nodes.values());
    return values.sort((a, b) => a.index - b.index);
  }

  enabledValues() {
    return this.values()
      .filter(descendant => !descendant.disabled)
      .map((descendant, index) => ({ ...descendant, index }));
  }

  item(index: number) {
    return this.values()[index];
  }

  enabledItem(index: number) {
    return this.enabledValues()[index];
  }

  first() {
    return this.item(0);
  }

  firstEnabled() {
    return this.enabledItem(0);
  }

  last() {
    return this.item(this.nodes.size - 1);
  }

  lastEnabled() {
    const lastIndex = this.enabledValues().length - 1;
    return this.enabledItem(lastIndex);
  }

  indexOf(node: T | null) {
    if (!node) return -1;
    return this.nodes.get(node)?.index ?? -1;
  }

  enabledIndexOf(node: T | null) {
    if (!node) return -1;
    return this.enabledValues().findIndex(i => i.node.isSameNode(node));
  }

  next(index: number, loop = true) {
    const next = nextIndex(index, this.count(), loop);
    return this.item(next);
  }

  nextEnabled(index: number, loop = true) {
    const next = nextIndex(index, this.enabledCount(), loop);
    return this.enabledItem(next);
  }

  prev(index: number, loop = true) {
    const prev = prevIndex(index, this.count() - 1, loop);
    return this.item(prev);
  }

  prevEnabled(index: number, loop = true) {
    const prev = prevIndex(index, this.enabledCount() - 1, loop);
    return this.enabledItem(prev);
  }

  private registerNode(node: T | null, options: RegisterOptions = {}) {
    if (!node || this.nodes.has(node)) return;

    const keys = Array.from(this.nodes.keys()).concat(node);
    const sorted = sortNodes(keys);

    this.nodes.set(node, {
      node,
      index: -1,
      disabled: !!options.disabled,
    });

    this.assignIndex(sorted);
  }

  register(nodeOrOptions: T | null | RegisterOptions) {
    if (nodeOrOptions == null) return;

    if (isElement(nodeOrOptions)) {
      return this.registerNode(nodeOrOptions);
    }

    return (node: T | null) => {
      this.registerNode(node, nodeOrOptions);
    };
  }
}

export default DescendantsObserver;
