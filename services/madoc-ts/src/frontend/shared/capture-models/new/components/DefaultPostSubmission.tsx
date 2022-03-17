import React from 'react';
import { useTranslation } from 'react-i18next';
import { useRelativeLinks } from '../../../../site/hooks/use-relative-links';
import { useRouteContext } from '../../../../site/hooks/use-route-context';
import { InfoMessage } from '../../../callouts/InfoMessage';
import { Button, ButtonRow } from '../../../navigation/Button';
import { SnippetStructure } from '../../../components/StructureSnippet';
import { useManifestStructure } from '../../../hooks/use-manifest-structure';
import { HrefLink } from '../../../utility/href-link';
import { EditorRenderingConfig } from './EditorSlots';

export const DefaultPostSubmission: EditorRenderingConfig['PostSubmission'] = ({
  onContinue,
  messageOnly,
  stacked,
}) => {
  const { t } = useTranslation();
  const { manifestId, canvasId } = useRouteContext();
  const structure = useManifestStructure(manifestId);
  const createLink = useRelativeLinks();

  const idx = canvasId && structure.data ? structure.data.ids.indexOf(canvasId) : -1;

  if (!structure.data || idx === -1 || !manifestId || !canvasId) {
    return null;
  }

  const next = idx < structure.data.items.length - 1 ? structure.data.items[idx + 1] : null;

  const buttonRow = (
    <ButtonRow>
      {onContinue ? (
        <Button data-cy="add-another" onClick={onContinue}>
          {t('Continue working')}
        </Button>
      ) : null}
      {next ? (
        <Button
          data-cy="go-to-next-image"
          $primary
          as={HrefLink}
          href={createLink({ canvasId: next.id, subRoute: 'model' })}
        >
          {t('Next image')}
        </Button>
      ) : null}
    </ButtonRow>
  );

  if (messageOnly) {
    return <InfoMessage onClick={onContinue}>{t('Thank you for your submission')}</InfoMessage>;
  }

  if (!next) {
    return (
      <div>
        <InfoMessage>{t('Thank you for your submission')}</InfoMessage>
        <div style={{ padding: '0 1em' }}>{buttonRow}</div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: stacked ? 'column' : 'row', padding: '0 1em' }}>
        <div style={{ flex: '1 1 0px' }}>
          <h3>{t('Contribution submitted')}</h3>
          <p>{t('Keep working on this image or move on to next image')}</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <SnippetStructure
            hideLabel
            item={next}
            link={createLink({
              canvasId: next.id,
              subRoute: 'model',
            })}
          />
          {stacked ? null : buttonRow}
        </div>
        {stacked ? buttonRow : null}
      </div>
    </div>
  );
};
