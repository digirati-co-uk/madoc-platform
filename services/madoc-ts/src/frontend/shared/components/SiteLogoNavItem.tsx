import React from 'react';
import styled, { css } from 'styled-components';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import { SiteDetails, SiteTitle } from '../layout/SiteHeader';
import { useSite } from '../hooks/use-site';
import { HrefLink } from '../utility/href-link';
import { useSiteConfiguration } from '../../site/features/SiteConfigurationContext';

const SiteLogoContainer = styled.div<{ $padding?: boolean; $margin?: boolean; $maxWidth?: number }>`
position: relative;
  z-index: 12;
  ${props =>
    props.$padding &&
    css`
      padding: 0.5em;
    `}
  ${props =>
    props.$margin &&
    css`
      margin: 0 0.5em;
    `}
  ${props =>
    props.$maxWidth &&
    css`
      img {
        max-width: ${props.$maxWidth}px;
      }
    `}
`;

export const SiteLogoNavItem: React.FC<{
  logo?: {
    id: string;
    image: string;
    thumbnail: string;
  } | null;
  logoOptions?: {
    padding?: boolean;
    margin?: boolean;
    halfSize?: boolean;
  };
  hideSiteTitle?: boolean;
  maxWidth?: number;
}> = ({ logo, hideSiteTitle, maxWidth, logoOptions = {} }) => {
  const site = useSite();
  const { project } = useSiteConfiguration();
  const showSiteTitle = typeof hideSiteTitle === 'undefined' ? !project.headerOptions?.hideSiteTitle : !hideSiteTitle;
  const { padding = false, margin = false } = logoOptions;

  return (
    <SiteDetails data-center={!logo && !showSiteTitle}>
      {logo ? (
        <HrefLink href="/">
          <SiteLogoContainer $padding={padding} $margin={margin} $maxWidth={maxWidth}>
            <img alt={site.title} src={logo.image} />
          </SiteLogoContainer>
        </HrefLink>
      ) : null}
      {showSiteTitle && (
        <SiteTitle as={HrefLink} href={`/`} className="site-title">
          <h1>
            <span className="title">{site.title}</span>
          </h1>
        </SiteTitle>
      )}
    </SiteDetails>
  );
};

blockEditorFor(SiteLogoNavItem, {
  type: 'default.SiteLogoNavItem',
  label: 'Site Logo Nav Item',
  requiredContext: ['page'],
  defaultProps: {
    logo: null,
    hideSiteTitle: false,
    logoOptions: {
      padding: false,
      margin: false,
      halfSize: false,
    },
    maxWidth: null,
  },
  editor: {
    logo: {
      label: 'Logo',
      type: 'madoc-media-explorer',
    },
    logoOptions: {
      label: 'Logo options',
      description: 'View options for the logo',
      type: 'checkbox-list-field',
      options: [
        {
          label: 'Padding around logo',
          value: 'padding',
        },
        {
          label: 'Margin left and right',
          value: 'margin',
        },
        {
          label: 'Display at half size',
          value: 'halfSize',
        },
      ],
    },
    maxWidth: {
      label: 'Logo max width',
      type: 'text-field',
      description: 'Must be a valid number (pixels)',
    },
    hideSiteTitle: {
      label: 'Hide site title',
      type: 'checkbox-field',
      inlineLabel: 'Hide site title',
    },
  },
  source: { id: 'global-header', type: 'global', name: 'Global header' },
  mapToProps(props) {
    const maxWidth = Number(props.maxWidth);
    return {
      ...props,
      maxWidth: !Number.isNaN(maxWidth) && Number.isFinite(maxWidth) ? maxWidth : undefined,
    } as any;
  },
});
