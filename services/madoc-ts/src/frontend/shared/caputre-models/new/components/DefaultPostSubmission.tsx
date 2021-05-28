import React from 'react';
import { useTranslation } from 'react-i18next';
import { useRelativeLinks } from '../../../../site/hooks/use-relative-links';
import { useRouteContext } from '../../../../site/hooks/use-route-context';
import { Button } from '../../../atoms/Button';
import { SnippetStructure } from '../../../components/StructureSnippet';
import { useManifestStructure } from '../../../hooks/use-manifest-structure';
import { HrefLink } from '../../../utility/href-link';

export const DefaultPostSubmission: React.FC<{ subRoute?: string }> = () => {
  const { t } = useTranslation();
  const { manifestId, canvasId, projectId } = useRouteContext();
  const structure = useManifestStructure(manifestId);
  const createLink = useRelativeLinks();

  const idx = canvasId && structure.data ? structure.data.ids.indexOf(canvasId) : -1;

  if (!structure.data || idx === -1 || !manifestId || !canvasId) {
    return null;
  }

  const next = idx < structure.data.items.length - 1 ? structure.data.items[idx + 1] : null;

  if (!next) {
    return <div>{t('Thanks for you submission')}</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex' }}>
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
          <br />
          <Button
            data-cy="go-to-next-image"
            $primary
            as={HrefLink}
            href={createLink({ canvasId: next.id, subRoute: 'model' })}
          >
            {t('Next image')}
          </Button>
        </div>
      </div>
    </div>
  );
};
