import { InternationalString } from '@iiif/presentation-3';
import React, { useState } from 'react';
import { useMutation } from 'react-query';
import { SystemListItem } from '../../../shared/atoms/SystemListItem';
import { ErrorMessage } from '../../../shared/callouts/ErrorMessage';
import { InternationalField } from '../../../shared/capture-models/editor/input-types/InternationalField/InternationalField';
import { TextField } from '../../../shared/capture-models/editor/input-types/TextField/TextField';
import { InputContainer, InputLabel } from '../../../shared/form/Input';
import { LanguageFieldEditor } from '../../../shared/form/LanguageFieldEditor';
import { useApi } from '../../../shared/hooks/use-api';
import { Button } from '../../../shared/navigation/Button';
import { HrefLink } from '../../../shared/utility/href-link';

export function CreateBadge() {
  const api = useApi();

  const [label, setLabel] = useState<InternationalString>({ en: [''] });
  const [description, setDescription] = useState<InternationalString>({ en: [''] });
  const [svg, setSvg] = useState('');
  const [colors, setColors] = useState('');

  const [createBadge, createBadgeStatus] = useMutation(async () => {
    if (!label.en || !label.en[0]) {
      throw new Error('Label is required');
    }

    if (!svg) {
      throw new Error('SVG is required');
    }

    return api.siteManager.createBadge({
      label,
      description,
      svg,
      tier_colors: colors.split(','),
    });
  });

  if (createBadgeStatus.isLoading) {
    return <div>Creating badge...</div>;
  }

  if (createBadgeStatus.isSuccess) {
    return (
      <div>
        <h2>Badge created</h2>
        <HrefLink href={`/configure/site/badges/${createBadgeStatus.data?.id}`}>Go to badge</HrefLink>
      </div>
    );
  }

  return (
    <SystemListItem>
      <div>
        <h3>Create badge</h3>

        {createBadgeStatus.error ? <ErrorMessage>{(createBadgeStatus.error as any).message}</ErrorMessage> : null}

        <InputContainer wide>
          <InputLabel htmlFor="label">Label</InputLabel>
          <InternationalField
            id="label"
            type="international-field"
            value={label}
            multiline={false}
            label="Label"
            updateValue={setLabel}
          />
        </InputContainer>
        <InputContainer wide>
          <InputLabel htmlFor="description">Description</InputLabel>
          <InternationalField
            id="description"
            type="international-field"
            value={description}
            multiline
            label="Description"
            updateValue={setDescription}
          />
        </InputContainer>

        <InputContainer wide>
          <InputLabel htmlFor="svg">SVG code</InputLabel>
          <p style={{ fontSize: '0.875em' }}>
            The SVG you provide will have access to their tier colour via <code>var(--award-tier)</code> in the css
          </p>
          <TextField
            id="svg"
            type="text-field"
            value={svg}
            multiline
            minLines={3}
            label="SVG"
            updateValue={setSvg}
            placeholder={`<svg ... />`}
          />
        </InputContainer>

        <InputContainer wide>
          <InputLabel htmlFor="colours">Colour tiers (comma separated each hex colour)</InputLabel>
          <TextField
            id="colours"
            type="text-field"
            value={colors}
            label="Colour tiers"
            updateValue={setColors}
            placeholder="e.g. #ff0000,#00ff00,#0000ff"
          />
        </InputContainer>

        <Button onClick={() => createBadge()} $primary>
          Create badge
        </Button>
      </div>
    </SystemListItem>
  );
}
