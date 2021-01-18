import * as React from 'react';
import {
  createDescendantContext,
  DescendantProvider,
  useDescendant,
  useDescendantsInit,
} from '@reach/descendants';
import { useId } from '@reach/auto-id';

let DescendantContext = createDescendantContext('DescendantContext');
let MenuContext = React.createContext({} as any);

function Menu({ id, children }: any) {
  let [descendants, setDescendants] = useDescendantsInit();
  let [activeIndex, setActiveIndex] = React.useState(1);
  return (
    <DescendantProvider
      context={DescendantContext}
      items={descendants}
      set={setDescendants}
    >
      <MenuContext.Provider
        value={{ buttonId: `button-${useId(id)}`, activeIndex, setActiveIndex }}
      >
        {children}
      </MenuContext.Provider>
    </DescendantProvider>
  );
}

function MenuList(props: any) {
  let { buttonId, activeIndex } = React.useContext(MenuContext);
  return (
    <div
      role="menu"
      aria-labelledby={buttonId}
      aria-activedescendant={activeIndex}
      tabIndex={-1}
    >
      {props.children}
    </div>
  );
}

function MenuItem({ index: explicitIndex, ...props }: any) {
  let { activeIndex, setActiveIndex } = React.useContext(MenuContext);
  let ref = React.useRef(null);
  let index = useDescendant(
    //@ts-ignore
    { element: ref.current, key: props.label },
    DescendantContext,
    explicitIndex
  );

  let isSelected = index === activeIndex;

  function select() {
    if (!isSelected) {
      setActiveIndex(index);
    }
  }

  return (
    <div
      role="menuitem"
      ref={ref}
      data-selected={isSelected ? '' : undefined}
      style={{ color: isSelected ? 'red' : 'black' }}
      tabIndex={-1}
      onMouseEnter={select}
      {...props}
    />
  );
}

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
        <MenuList>
          <MenuItem>One</MenuItem>
          {show && <MenuItem>Two</MenuItem>}
          <MenuItem>Three</MenuItem>
          <MenuItem>Four</MenuItem>
          <div>
            {show2 && <MenuItem>Testing 🌟</MenuItem>}
            <MenuItem>Five</MenuItem>
          </div>
        </MenuList>
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
