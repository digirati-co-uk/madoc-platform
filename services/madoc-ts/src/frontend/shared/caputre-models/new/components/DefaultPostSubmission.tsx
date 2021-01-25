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
  const { manifestId, canvasId } = useRouteContext();
  const structure = useManifestStructure(manifestId);
  const createLink = useRelativeLinks();

  const idx = canvasId && structure.data ? structure.data.ids.indexOf(canvasId) : -1;

  if (!structure.data || idx === -1 || !manifestId || !canvasId) {
    return null;
  }

  const next = idx < structure.data.items.length - 1 ? structure.data.items[idx + 1] : null;

  if (!next) {
    return <div>{t('Thanks for you submission.')}</div>;
  }

  return (
    <div>
      <SnippetStructure
        item={next}
        link={createLink({
          canvasId: next.id,
          subRoute: 'model',
        })}
      />
      <Button data-cy="go-to-next-image" as={HrefLink} href={createLink({ canvasId: next.id, subRoute: 'model' })}>
        {t('Go to next image')}
      </Button>
    </div>
  );
};
