import {
  DescendantsContext,
  useDescendant,
  useDescendants,
  useDescendantsContext,
} from '@descendants/react';
import * as React from 'react';

const MenuContext = React.createContext({} as any);

const Menu: React.FC = ({ children }) => {
  const descendants = useDescendants();
  const { ref, observer } = descendants;

  const [selected, setSelected] = React.useState(1);
  const context = React.useMemo(() => ({ selected, setSelected }), [selected]);

  return (
    <DescendantsContext.Provider value={descendants}>
      <MenuContext.Provider value={context}>
        <div role="menu" ref={ref} style={{ maxWidth: 320 }}>
          <button
            onClick={() => {
              const prev = observer.getPrev(selected, true);
              prev.node.focus();
              setSelected(prev.index);
            }}
          >
            Prev
          </button>
          <button
            onClick={() => {
              const next = observer.getNext(selected, true);
              next.node.focus();
              setSelected(next.index);
            }}
          >
            Next
          </button>
          {children}
        </div>
      </MenuContext.Provider>
    </DescendantsContext.Provider>
  );
};

const MenuItem = React.memo(({ children }) => {
  const { selected, setSelected } = React.useContext(MenuContext);
  const ctx = useDescendantsContext();

  const { index, ref } = useDescendant(ctx);
  const isSelected = index === selected;

  return (
    <div
      role="menuitem"
      ref={ref}
      aria-selected={isSelected}
      onMouseMove={() => setSelected(index)}
      style={{ color: isSelected ? 'red' : 'black' }}
    >
      {children} - {index}
    </div>
  );
});

const Page = () => {
  const [show, setShow] = React.useState(false);
  const [show2, setShow2] = React.useState(false);

  const toggle = () => {
    setShow(!show);
    if (!show === true) {
      setTimeout(() => {
        setShow2(true);
      }, 1000);
    }
  };

  return (
    <div>
      <button onClick={toggle}>Toggle</button>
      <Menu>
        <MenuItem>One</MenuItem>
        {show && <MenuItem>Two</MenuItem>}
        <MenuItem>Three</MenuItem>
        <MenuItem>Four</MenuItem>
        <div>
          {show2 && <MenuItem>Testing 🌟</MenuItem>}
          <MenuItem>Five</MenuItem>
        </div>
      </Menu>
    </div>
  );
};

export default Page;
