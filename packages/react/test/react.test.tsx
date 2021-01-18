import {} from '../src';

const DescendantContext = React.createContext({} as Ctx);
const MenuContext = React.createContext({} as any);

const Menu: React.FC = ({ children }) => {
  const descendant = useDescendants();
  const [selected, setSelected] = React.useState(1);

  const context = React.useMemo(() => ({ selected, setSelected }), [selected]);

  return (
    <DescendantContext.Provider value={descendant}>
      <MenuContext.Provider value={context}>
        <div role="menu" ref={descendant.ref} style={{ maxWidth: 320 }}>
          <button
            onClick={() => {
              const prev = descendant.observer.getPrev(selected, true);
              prev.node.focus();
              setSelected(prev.index);
            }}
          >
            Prev
          </button>
          <button
            onClick={() => {
              const next = descendant.observer.getNext(selected, true);
              next.node.focus();
              setSelected(next.index);
            }}
          >
            Next
          </button>
          {children}
        </div>
      </MenuContext.Provider>
    </DescendantContext.Provider>
  );
};

const MenuItem = React.memo(({ children }) => {
  const { selected, setSelected } = React.useContext(MenuContext);
  const ctx = React.useContext(DescendantContext);
  const { index, ref } = useDescendant(ctx);
  const isSelected = index === selected;

  return (
    <div
      role="menuitem"
      ref={ref}
      data-selected={isSelected}
      onMouseMove={() => setSelected(index)}
      style={{ color: isSelected ? 'red' : 'black' }}
    >
      {children} - {index}
    </div>
  );
});

const App = () => {
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

describe('@descendants/react', () => {
  it('works', () => {
    expect(true).toBe(true);
  });
});
