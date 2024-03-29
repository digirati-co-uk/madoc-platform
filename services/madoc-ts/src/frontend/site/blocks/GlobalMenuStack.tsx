import React from 'react';
import styled, { css } from 'styled-components';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import { SiteDetails, SiteMenuContainer, SiteTitle } from '../../shared/layout/SiteHeader';
import { useSite } from '../../shared/hooks/use-site';
import { HrefLink } from '../../shared/utility/href-link';
import { GlobalSiteNavigation } from '../features/global/GlobalSiteNavigation';
import { useSiteConfiguration } from '../features/SiteConfigurationContext';

const SiteLogoContainer = styled.div<{ $padding?: boolean; $margin?: boolean; $maxWidth?: number }>`
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

export const GlobalMenuStack: React.FC<{
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
  menuOptions?: {
    fullWidth?: boolean;
  };
  hideSiteTitle?: boolean;
  showHomepageMenu?: boolean;
  maxWidth?: number;
  extraLinks?: {
    slug?: string;
    text?: string;
  }[];
}> = ({ logo, hideSiteTitle, maxWidth, logoOptions = {}, menuOptions = {}, showHomepageMenu, extraLinks }) => {
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
      <SiteMenuContainer data-full-width={menuOptions.fullWidth}>
        <GlobalSiteNavigation showHomepageMenu={showHomepageMenu} extraNavItems={extraLinks} />
      </SiteMenuContainer>
    </SiteDetails>
  );
};

blockEditorFor(GlobalMenuStack, {
  type: 'default.GlobalMenuStack',
  label: 'Global menu (stack)',
  defaultProps: {
    logo: null,
    hideSiteTitle: false,
    showHomepageMenu: false,
    logoOptions: {
      padding: false,
      margin: false,
      halfSize: false,
    },
    menuOptions: {
      fullWidth: false,
    },
    maxWidth: null,
    extraLinks: [
      {
        slug: '',
        text: '',
      },
    ],
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
    menuOptions: {
      label: 'Menu options',
      description: 'View options for the menu',
      type: 'checkbox-list-field',
      options: [
        {
          label: 'Full width (under)',
          value: 'fullWidth',
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
    showHomepageMenu: {
      label: 'Homepage menu',
      type: 'checkbox-field',
      inlineLabel: 'Show home as menu item',
    },
    extraLinks: {
      allowMultiple: true,
      label: 'Extra Nav item',
      pluralLabel: 'Extra Nav items',
      labelledBy: 'text',
      description: 'paste the relative slug as shown on the site eg: projects/project-name',
    },
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    'extraLinks.text': {
      type: 'text-field',
      label: 'Extra Nav item display text',
    },
    'extraLinks.slug': {
      type: 'text-field',
      label: 'Extra Nav item slug',
    },
  },
  source: {
    id: 'global-header',
    type: 'global',
    name: 'Global header',
  },
});
