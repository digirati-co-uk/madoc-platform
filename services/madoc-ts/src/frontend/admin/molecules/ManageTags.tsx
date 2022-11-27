import React, { FormEvent } from 'react';
import { useMutation } from 'react-query';
import { EnrichmentEntity } from '../../../extensions/enrichment/authority/types';
import { SuccessMessage } from '../../shared/callouts/SuccessMessage';
import { Input, InputContainer, InputLabel } from '../../shared/form/Input';
import { useApi } from '../../shared/hooks/use-api';
import { Button } from '../../shared/navigation/Button';
import { HrefLink } from '../../shared/utility/href-link';
import { useRelativeLinks } from '../../site/hooks/use-relative-links';

export function ManageTags({
  data: search,
  id,
  type,
  refresh,
}: {
  data: any;
  type: string;
  id: number;
  refresh: () => void;
}) {
  const api = useApi();
  const createLink = useRelativeLinks();
  const existingEntities = search.entity_tags as { entity: EnrichmentEntity }[];

  // @todo no way to delete?

  const [createTag, createTagStatus] = useMutation(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.target as any);
    const data = Object.fromEntries((form as any).entries());
    if (data.tag_id) {
      // @todo wrap this into normal api..
      await api.enrichment.tagMadocResource(data.tag_id, type, id);
      await api.enrichment.triggerTask('index_madoc_resource', { id, type }, {}, false);
    }
    refresh();
    (e.target as any).reset();
  });

  return (
    <div style={{ padding: '2em', margin: '1em 0', background: '#f1f6ff' }}>
      <h3>Topics</h3>
      <ul>
        {existingEntities.map((e, k) => (
          <li key={k}>
            {/* @todo change entity.id to slug! */}
            <HrefLink to={createLink({ topic: e.entity.id, topicType: e.entity.type as any })}>
              {e.entity.label}
            </HrefLink>
          </li>
        ))}
      </ul>

      {createTagStatus.isLoading ? (
        'loading...'
      ) : (
        <form onSubmit={createTag}>
          <InputContainer>
            {createTagStatus.isSuccess ? <SuccessMessage>Tag added</SuccessMessage> : null}
            <InputLabel>Tag ID</InputLabel>
            <Input autoComplete="off" type="text" id="tag_id" name="tag_id" disabled={createTagStatus.isLoading} />
            <Button type="submit" disabled={createTagStatus.isLoading}>
              Add tag
            </Button>
          </InputContainer>
        </form>
      )}
    </div>
  );
}
