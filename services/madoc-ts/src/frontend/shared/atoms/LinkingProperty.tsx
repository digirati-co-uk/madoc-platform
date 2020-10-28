import React, { useState } from 'react';
import { useMutation } from 'react-query';
import styled from 'styled-components';
import { ResourceLinkResponse } from '../../../database/queries/linking-queries';
import { LinkingPropertyEditor } from '../components/LinkingPropertyEditor';
import { useApi } from '../hooks/use-api';
import { createLink } from '../utility/create-link';
import { Link } from 'react-router-dom';

const LinkingContainer = styled.div`
  display: flex;
  flex-direction: row;
  padding: 0.8em;
  background: #fff;
  border-radius: 5px;
  box-shadow: 0 2px 3px 0 rgba(0, 0, 0, 0.12);
  margin: 0.5em;
`;

const LinkingInnerContainer = styled.div`
  flex-direction: column;
  flex: 1 1 0px;
`;

const LinkingIcon = styled.div<{ $background?: string }>`
  background: ${props => props.$background || '#595C89'};
  border-radius: 50%;
  width: 40px;
  height: 40px;
  margin-right: 1em;
  display: flex;
  align-items: center;
  text-align: center;
  justify-items: center;
  svg {
    margin: 0 auto;
  }
`;

const LinkingLabel = styled.div`
  font-size: 1.1em;
  font-weight: 600;
`;

const LinkingMetadata = styled.div`
  color: #999;
  font-size: 0.85em;
`;

const LinkingEditButton = styled.button`
  color: #4e66dd;
  align-self: center;
  margin: 0.5em;
  outline: none;
  font-size: 1em;
  border: none;
  background: none;
  display: inline;
`;

const LinkingLink = styled.div`
  font-size: 0.75em;
  font-weight: 600;

  a {
    color: #4e66dd;
    text-decoration: none;
  }
`;

function ExternalLink(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 15 15" {...props}>
      <defs>
        <filter x="-.9%" y="-4.2%" width="101.8%" height="113.1%" filterUnits="objectBoundingBox" id="prefix__a">
          <feOffset dy={2} in="SourceAlpha" result="shadowOffsetOuter1" />
          <feGaussianBlur stdDeviation={1.5} in="shadowOffsetOuter1" result="shadowBlurOuter1" />
          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.115329983 0" in="shadowBlurOuter1" />
        </filter>
      </defs>
      <g transform="translate(-69 -123)" fill="none" fillRule="evenodd">
        <g transform="translate(36 96)">
          <g>
            <path d="M30 24h24v24H30z" />
            <path
              d="M46.333 40.333H34.667V28.667H40.5V27h-5.833c-.925 0-1.667.75-1.667 1.667v11.666c0 .917.742 1.667 1.667 1.667h11.666C47.25 42 48 41.25 48 40.333V34.5h-1.667v5.833zM42.167 27v1.667h2.991l-8.191 8.191 1.175 1.175 8.191-8.191v2.991H48V27h-5.833z"
              fill="#FFF"
              fillRule="nonzero"
            />
          </g>
        </g>
      </g>
    </svg>
  );
}

function CloudIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg height="1.4em" viewBox="0 0 24 24" width="1.4em" {...props}>
      <path d="M0 0h24v24H0z" fill="none" />
      <path
        fill="#FFF"
        d="M19.35 10.04A7.49 7.49 0 0012 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 000 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM10 17l-3.5-3.5 1.41-1.41L10 14.17 15.18 9l1.41 1.41L10 17z"
      />
    </svg>
  );
}

export const LinkingProperty: React.FC<{
  link: ResourceLinkResponse;
  refetch?: () => any;
  linkProps?: any;
}> = props => {
  const [isEditing, setIsEditing] = useState(false);
  const api = useApi();
  const [convertLink, { error, isSuccess, isLoading }] = useMutation(async () => {
    await api.convertLinkingProperty(props.link.id);
    if (props.refetch) {
      await props.refetch();
    }
  });

  return (
    <LinkingContainer>
      <LinkingIcon $background={props.link.file ? '#4F8B68' : '#595C89'}>
        {props.link.file ? <CloudIcon /> : <ExternalLink />}
      </LinkingIcon>
      <LinkingInnerContainer>
        <LinkingLabel>
          {props.linkProps ? (
            <Link
              to={createLink({
                ...props.linkProps,
                subRoute: `linking/${props.link.id}`,
                admin: true,
              })}
            >
              {props.link.link.label}
            </Link>
          ) : (
            props.link.link.label
          )}
        </LinkingLabel>
        <LinkingMetadata>
          {props.link.link.type} - {props.link.link.format}
        </LinkingMetadata>
        <LinkingLink>
          <a href={props.link.link.id} rel="noopener noreferrer" target="_blank">
            {props.link.link.id}
          </a>
          {props.link.file ? (
            <>
              {' '}
              |{' '}
              <a href={props.link.source} rel="noopener noreferrer" target="_blank">
                view original source
              </a>
            </>
          ) : null}
        </LinkingLink>
        {isEditing ? <LinkingPropertyEditor link={props.link} close={() => setIsEditing(false)} /> : null}
      </LinkingInnerContainer>
      {props.link.file ? (
        <LinkingEditButton onClick={() => setIsEditing(r => !r)}>edit</LinkingEditButton>
      ) : isSuccess ? (
        'success'
      ) : error ? (
        'ERROR'
      ) : (
        <LinkingEditButton disabled={isLoading} onClick={() => convertLink()}>
          Save to madoc
        </LinkingEditButton>
      )}
    </LinkingContainer>
  );
};
