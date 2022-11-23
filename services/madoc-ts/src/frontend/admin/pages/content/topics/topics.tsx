import React, { useState } from 'react';
import { AdminHeader } from '../../../molecules/AdminHeader';
import { useTranslation } from 'react-i18next';
import { AllTopicListing, TopicDetails, TopicItemsList } from '../../../../site/features/TopicListing';
import { SystemBackground } from '../../../../shared/atoms/SystemUI';
import { Button } from '../../../../shared/navigation/Button';
import styled from 'styled-components';
import { Input, InputContainer, InputLabel } from '../../../../shared/form/Input';

const AdminTabs = styled.div`
  display: flex;
  padding-bottom: 3em;

  button {
    border-radius: 0;
  }
`;

export const Topics: React.FC = () => {
  const [view, setView] = useState('allTopics');
  const { t } = useTranslation();

  return (
    <>
      <AdminHeader
        title={t('Topics')}
        breadcrumbs={[
          { label: 'Site admin', link: '/' },
          { label: 'Topics', link: '/topics' },
        ]}
      />
      <SystemBackground>
        <AdminTabs>
          <Button
            $primary={view === 'allTopics'}
            onClick={() => {
              setView('allTopics');
            }}
          >
            All topics
          </Button>
          <Button
            $primary={view === 'singleTopic'}
            onClick={() => {
              setView('singleTopic');
            }}
          >
            Single Topic
          </Button>
          <Button
            $primary={view === 'topicSearch'}
            onClick={() => {
              setView('topicSearch');
            }}
          >
            Topic Items
          </Button>
        </AdminTabs>
          {view === 'allTopics' ? <ViewTopicList /> : view === 'singleTopic' ? <ViewSingleTopic /> : <ViewTopicItems />}
      </SystemBackground>
    </>
  );
};

const ViewTopicList: React.FC = () => {
  const [input, setInput] = useState('https://enrichment.ida.madoc.io/madoc/entity');
  const [customTopicUrl, setCustomTopicUrl] = useState('https://enrichment.ida.madoc.io/madoc/entity');

  return (
    <>
      <InputContainer style={{ flexDirection: 'row', flex: '1 1 0px', maxWidth: '100%', alignItems: 'baseline' }}>
        <InputLabel>All topics</InputLabel>
        <Input
          type="text"
          onChange={e => setInput(e.currentTarget.value)}
          style={{ flex: '1 1 0px', margin: '0 0.5em' }}
          value={input}
        />
        <Button $primary onClick={() => setCustomTopicUrl(input)}>
          View all topics
        </Button>
      </InputContainer>

      <AllTopicListing url={customTopicUrl} />
    </>
  );
};

const ViewSingleTopic: React.FC = () => {
  const [input, setInput] = useState('a516b1a5-422e-4659-893a-89d3603d553d');
  const [topicId, setTopicId] = useState('a516b1a5-422e-4659-893a-89d3603d553d');

  return (
    <>
      <InputContainer style={{ flexDirection: 'row', flex: '1 1 0px', maxWidth: '100%', alignItems: 'baseline' }}>
        <InputLabel>Topic Id</InputLabel>
        <Input
          type="text"
          onChange={e => setInput(e.currentTarget.value)}
          style={{ flex: '1 1 0px', margin: '0 0.5em' }}
          value={input}
        />
        <Button $primary onClick={() => setTopicId(input)}>
          Get single topic
        </Button>
      </InputContainer>

      <TopicDetails topicId={topicId} />
    </>
  );
};

const ViewTopicItems: React.FC = () => {
  const [typeInput, setTypeInput] = useState('entity');
  const [subtypeInput, setSubtypeInput] = useState('a516b1a5-422e-4659-893a-89d3603d553d');

  const [type, setType] = useState('entity');
  const [subtype, setSubtype] = useState('a516b1a5-422e-4659-893a-89d3603d553d');

  return (
    <>
      <InputContainer style={{ flexDirection: 'row', flex: '1 1 0px', maxWidth: '100%', alignItems: 'baseline' }}>
        <>
          <InputLabel>Type</InputLabel>
          <Input
            type="text"
            onChange={e => setTypeInput(e.currentTarget.value)}
            style={{ flex: '1 1 0px', margin: '0 0.5em' }}
            value={typeInput}
          />
          <InputLabel>Subtype</InputLabel>
          <Input
            type="text"
            onChange={e => setSubtypeInput(e.currentTarget.value)}
            style={{ flex: '1 1 0px', margin: '0 0.5em' }}
            value={subtypeInput}
          />
        </>
        <Button
          $primary
          onClick={() => {
            setType(typeInput);
            setSubtype(subtypeInput);
          }}
        >
          Get single topic
        </Button>
      </InputContainer>

      <TopicItemsList type={type} subtype={subtype} />
    </>
  );
};