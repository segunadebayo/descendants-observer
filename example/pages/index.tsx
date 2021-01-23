import {
  DescendantsContext,
  useDescendant,
  useDescendants,
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
              const prev = observer.prevEnabled(selected);
              prev.node.focus();
              setSelected(prev.index);
            }}
          >
            Prev
          </button>
          <button
            onClick={() => {
              const next = observer.nextEnabled(selected);
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
  debugger;
  const { enabledIndex, register } = useDescendant<HTMLDivElement>();
  const isSelected = enabledIndex === selected;

  return (
    <div
      role="menuitem"
      ref={register}
      aria-selected={isSelected}
      onMouseMove={() => setSelected(enabledIndex)}
      style={{ color: isSelected ? 'red' : 'black' }}
    >
      {children} - {enabledIndex}
    </div>
  );
});

const Component = () => {
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

const Page = () => {
  const items = Array.from({ length: 1000 }).map((_, i) => (
    <Component key={i} />
  ));
  return <div>{items}</div>;
};

export default Page;
