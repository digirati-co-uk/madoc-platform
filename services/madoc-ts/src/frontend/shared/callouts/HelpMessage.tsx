import styled from 'styled-components';
import { BaseMessage } from './BaseMessage';
import { InfoIcon } from '../icons/InfoIcon';
import { useLocalStorage } from '../hooks/use-local-storage';

const HelpMessageContainer = styled(BaseMessage)`
  background: #e5faff;
  color: #002884;
  border-radius: 3px;
  border: 1px solid #b8e0ea;
  padding: 1em;
  max-width: 800px;
  p {
    margin-top: 0;
    line-height: 1.4em;
  }
`;

export const HelpMessage = (props: any) => {
  const [visible, setVisible] = useLocalStorage('madoc-help-message', true);
  return (
    <HelpMessageContainer {...props}>
      <div
        onClick={() => setVisible(!visible)}
        style={{
          display: 'flex',
          alignItems: 'center',
          borderBottom: visible ? '2px solid #bfe3ec' : 'none',
          marginBottom: visible ? 10 : 0,
          paddingBottom: visible ? 10 : 0,
          cursor: 'pointer',
        }}
      >
        <InfoIcon style={{ fontSize: '1.2em', margin: 0, marginRight: 10 }} />{' '}
        <div style={{ fontWeight: 500 }}>{props.title || 'Information'}</div>
        <div style={{ marginLeft: 'auto' }}>
          {visible ? (
            <span style={{ marginLeft: 10, fontSize: '0.8em', fontWeight: 500 }}>Hide</span>
          ) : (
            <span style={{ marginLeft: 10, fontSize: '0.8em', fontWeight: 500 }}>Show</span>
          )}
        </div>
      </div>
      {visible ? <div style={{ fontSize: '0.875em' }}>{props.children}</div> : null}
    </HelpMessageContainer>
  );
};
