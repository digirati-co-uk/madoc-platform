import React from 'react';
import { Breadcrumb, BreadcrumbDivider, BreadcrumbSection } from '../../atoms/Breadcrumb';
import { useTranslation } from 'react-i18next';

type Props = {
  subtreePath: string[];
  popSubtree: (payload?: { count: number }) => void;
};

export const SubtreeBreadcrumb: React.FC<Props> = ({ popSubtree, subtreePath }) => {
  const { t } = useTranslation();
  return (
    <Breadcrumb>
      <BreadcrumbSection
        onClick={subtreePath.length !== 0 ? () => popSubtree({ count: subtreePath.length }) : undefined}
      >
        {t('Document root')}
      </BreadcrumbSection>
      {subtreePath.map((path, n) => (
        <React.Fragment key={n}>
          {n !== subtreePath.length ? <BreadcrumbDivider>/</BreadcrumbDivider> : null}
          <BreadcrumbSection
            key={n}
            onClick={n !== subtreePath.length - 1 ? () => popSubtree({ count: subtreePath.length - n - 1 }) : undefined}
          >
            {path}
          </BreadcrumbSection>
        </React.Fragment>
      ))}
    </Breadcrumb>
  );
};
