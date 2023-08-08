import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ItemStructureListItem } from '../../../../types/schemas/item-structure-list';
import { TinyButton } from '../../../shared/navigation/Button';
import { SingleLineHeading5 } from '../../../shared/typography/Heading5';
import { ImageGrid, ImageGridItem } from '../../../shared/atoms/ImageGrid';
import { CroppedImage } from '../../../shared/atoms/Images';
import { useApiStructure } from '../../../shared/hooks/use-api-structure';
import { LocaleString } from '../../../shared/components/LocaleString';

export const CollectionExplorer: React.FC<{
  id: number;
  type: string;
  onChoose: (id: number, item: ItemStructureListItem) => void;
}> = ({ id, type, onChoose }) => {
  const { t } = useTranslation();
  const { data, status } = useApiStructure(id, type);
  const [page, setPage] = useState(0);
  const pages = data ? Math.ceil(data.items.length / 24) : 0;
  const items = data ? data.items.slice(page * 24, page * 24 + 24) : [];

  useEffect(() => {
    setPage(0);
  }, [id]);

  if (!data || status !== 'success') {
    return <div>Loading</div>;
  }

  return (
    <>
      <ImageGrid>
        {items
          ? items.map(canvas => {
              return (
                <ImageGridItem $size="small" key={canvas.id} onClick={() => onChoose(canvas.id, canvas)}>
                  {canvas.thumbnail ? (
                    <CroppedImage $size="small">
                      <img src={canvas.thumbnail} />
                    </CroppedImage>
                  ) : null}
                  <SingleLineHeading5>
                    <LocaleString>{canvas.label || { none: [t('Untitled canvas')] }}</LocaleString>
                  </SingleLineHeading5>
                </ImageGridItem>
              );
            })
          : null}
      </ImageGrid>
      <div style={{ margin: '1em 0' }}>
        {page !== 0 ? <TinyButton onClick={() => setPage(page - 1)}>{t('Previous page')}</TinyButton> : null}
        <div style={{ display: 'inline-block', margin: 10, fontSize: '0.9em' }}>
          {t('Page {{page}} of {{count}}', { page: page + 1, count: pages })}
        </div>
        {page + 1 !== pages ? <TinyButton onClick={() => setPage(page + 1)}>{t('Next page')}</TinyButton> : null}
      </div>
    </>
  );
};
