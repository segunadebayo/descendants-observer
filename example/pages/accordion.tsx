import {
  DescendantsContext,
  useDescendant,
  useDescendants,
} from '@descendants/react';
import * as React from 'react';

const AccordionContext = React.createContext({} as any);

const Accordion: React.FC = ({ children }) => {
  const descendants = useDescendants<HTMLDivElement, HTMLButtonElement>();

  const [selected, setSelected] = React.useState(1);
  const context = React.useMemo(() => ({ selected, setSelected }), [selected]);

  return (
    <DescendantsContext.Provider value={descendants}>
      <AccordionContext.Provider value={context}>
        <div ref={descendants.ref} style={{ maxWidth: 320 }}>
          {children}
        </div>
      </AccordionContext.Provider>
    </DescendantsContext.Provider>
  );
};

const AccordionPanels: React.FC = ({ children }) => {
  const descendants = useDescendants();
  return (
    <DescendantsContext.Provider value={descendants}>
      <div ref={descendants.ref}>{children}</div>
    </DescendantsContext.Provider>
  );
};

const AccordionPanel: React.FC = React.memo(({ children }) => {
  const { selected } = React.useContext(AccordionContext);
  const { register, index } = useDescendant<HTMLDivElement>();

  const hidden = selected !== index;

  return (
    <div hidden={hidden} ref={register}>
      {children}
    </div>
  );
});

const AccordionButton = React.memo(({ children, disabled }: any) => {
  const { selected, setSelected } = React.useContext(AccordionContext);
  const { enabledIndex, index, register, observer } = useDescendant({
    disabled,
  });

  const isSelected = index === selected;

  return (
    <button
      role="menuitem"
      ref={register}
      aria-selected={isSelected}
      disabled={disabled}
      onKeyDown={event => {
        if (event.key === 'ArrowDown') {
          const next = observer.nextEnabled(selected);
          if (next) {
            setSelected(observer.indexOf(next.node));
            next.node.focus();
          }
        }
        if (event.key === 'ArrowUp') {
          const prev = observer.prevEnabled(selected);
          setSelected(observer.indexOf(prev.node));
          prev.node.focus();
        }
      }}
      style={{
        color: isSelected ? 'red' : 'black',
        display: 'block',
        margin: 8,
      }}
    >
      <pre>
        {children} - {JSON.stringify({ enabledIndex, index })}
      </pre>
    </button>
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
      <Accordion>
        <AccordionButton>Naruto</AccordionButton>
        {show && <AccordionButton>Boruto</AccordionButton>}
        <AccordionButton>Gaara</AccordionButton>
        <AccordionButton disabled>Rock Lee</AccordionButton>
        <div>
          {show2 && <AccordionButton disabled>Sage 🌟</AccordionButton>}
          <AccordionButton>Minato</AccordionButton>
        </div>
        <AccordionPanels>
          <AccordionPanel>Naruto</AccordionPanel>
          {show && <AccordionPanel>Boruto</AccordionPanel>}
          <AccordionPanel>Gaara</AccordionPanel>
          <AccordionPanel>Rock Lee</AccordionPanel>
          {show2 && <AccordionPanel>Sage 🌟</AccordionPanel>}
          <AccordionPanel>Minato</AccordionPanel>
        </AccordionPanels>
      </Accordion>
    </div>
  );
};

export default Page;
