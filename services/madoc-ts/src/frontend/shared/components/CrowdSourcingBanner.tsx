import React from 'react';
import styled, { css } from 'styled-components';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-react';
import { Button } from '../atoms/Button';

export type CrowdSourcingBannerProps = {
  title: string;
  description: string;
  buttonLink?: string;
  buttonLabel?: string;
  height?: number;
  image: {
    id: string;
    image: string;
    thumbnail: string;
  } | null;
  panelAlignment: 'left' | 'right';
};

const Masthead = styled.div<{ $height?: string }>`
  background-repeat: no-repeat;
  background-position: center;
  background-color: #4a4a49;
  background-size: cover;
  position: relative;
  min-width: 100%;
  min-height: ${props => props.$height || '550px'};
`;

const MastheadMain = styled.div`
  position: relative;
`;

const MastheadIntro = styled.div<{ $right?: boolean; $height?: string }>`
  background-color: rgba(51, 51, 51, 0.8);
  padding: 20px;
  width: 33.3333333333%;
  min-height: ${props => props.$height || '550px'};
  ${props =>
    props.$right &&
    css`
      right: 0;
      position: absolute;
    `}
`;

const MastheadTitle = styled.div`
  font-weight: 600;
  line-height: 1.3;
  font-size: 21px;
  color: #fff;
  margin: 1.4em 0;
`;

const MastheadDescription = styled.div`
  line-height: 26px;
  margin: 1.4em 0;
  color: #fff;
  a {
    color: #fff;
    text-decoration: underline;
  }
`;

export const CrowdSourcingBanner: React.FC<CrowdSourcingBannerProps> = props => {
  if (!props.image) {
    return null;
  }
  return (
    <Masthead
      $height={props.height ? `${props.height}px` : undefined}
      style={{ backgroundImage: `url("${props.image.image}")` }}
    >
      {props.title || props.description || props.buttonLink ? (
        <MastheadMain>
          <MastheadIntro
            $height={props.height ? `${props.height}px` : undefined}
            $right={props.panelAlignment === 'right'}
          >
            <MastheadTitle>{props.title}</MastheadTitle>
            <MastheadDescription>{props.description}</MastheadDescription>
            {props.buttonLabel && props.buttonLink ? (
              <Button $primary $large as="a" href={props.buttonLink}>
                {props.buttonLabel}
              </Button>
            ) : null}
          </MastheadIntro>
        </MastheadMain>
      ) : null}
    </Masthead>
  );
};

blockEditorFor(CrowdSourcingBanner, {
  label: 'Crowdsourcing banner',
  type: 'CrowdsourcingBanner',
  defaultProps: {
    title: '',
    description: '',
    image: null,
    height: '550',
    panelAlignment: 'left',
    buttonLabel: '',
    buttonLink: '',
  },
  svgIcon: props => (
    <svg width="1em" height="1em" viewBox="0 0 151 84" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g fill="none" fillRule="evenodd">
        <path strokeOpacity={0.088} stroke="#000" fillOpacity={0.122} fill="#000" d="M.5.5h149.316v83H.5z" />
        <path fillOpacity={0.124} fill="#000" d="M0 0h63.663v84H0z" />
        <path fillOpacity={0.157} fill="#000" d="M6.189 20.337h50.4v5.305h-50.4zM6.189 30.947h50.4v12.379h-50.4z" />
        <path fill="#2B5294" d="M6.189 48.632h25.642v5.305H6.189z" />
      </g>
    </svg>
  ),
  editor: {
    title: { type: 'text-field', label: 'Title' },
    description: { type: 'text-field', multiline: true, minLines: 6, label: 'Description' },
    panelAlignment: {
      label: 'Panel alignment',
      type: 'dropdown-field',
      options: [
        { value: 'left', text: 'Left aligned' },
        { value: 'right', text: 'Right aligned' },
      ],
    },
    image: {
      label: 'Image',
      type: 'madoc-media-explorer',
    },
    height: { type: 'text-field', label: 'Height (number)' },
    buttonLabel: { type: 'text-field', label: 'Button label' },
    buttonLink: { type: 'text-field', label: 'Button link' },
  },
  requiredContext: [],
  anyContext: [],
});
