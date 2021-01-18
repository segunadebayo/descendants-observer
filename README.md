# Descendants Observer

Keep track of descendant components and their relative indices

## Motivation

Descendants observer is an utility hook for keeping track of descendant components and their relative indeces. It's based off the @reach/descendants package, but is much faster and smaller.

If you want to understand more about what this package does or why we need it, read the Problem Complex from the @reach/descendants package.

In short, this package allows each item in a list to know it's relative index and the parent of the list can keep track of each child, without needing to render in a loop and pass each component an index.

This enables component composition:

```jsx
<List>
  <Item /> // I'm index 0
  <Item /> // I'm index 1<div>
    <div>
      <Item /> // I'm arbitrarily nested, but still know that I'm index 2
    </div>
  </div>
</List>
```

## Installation

```sh
yarn add descendants-observer
```
