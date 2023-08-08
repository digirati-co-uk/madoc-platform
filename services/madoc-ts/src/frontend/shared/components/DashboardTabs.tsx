import React, { useEffect, useRef } from 'react';
import styled, { css } from 'styled-components';
import { useBrowserLayoutEffect } from '../hooks/use-browser-layout-effect';

export const DashboardTabs = styled.ul<{ $loading?: boolean }>`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  border-bottom: 2px solid #626971;
  position: relative;

  &:after {
    position: absolute;
    content: '';
    width: 100%;
    background: #626971;
    bottom: -2px;
    height: 2px;
    transition: height 0.3s, bottom 0.3s;

    ${props =>
      props.$loading &&
      css`
        background: linear-gradient(
          90deg,
          rgba(2, 0, 36, 1) 0%,
          rgba(9, 9, 121, 1) 25%,
          rgb(0, 94, 255) 50%,
          rgba(9, 9, 121, 1) 75%,
          rgba(2, 0, 36, 1) 100%
        );
        bottom: -6px;
        height: 6px;
        background-position: 200px;
        animation: animatedBackground 3s ease-in-out infinite;
      `}
  }

  @keyframes animatedBackground {
    0% {
      background-position: 0 0;
    }
    50% {
      background-position: -600px 0;
    }
    100% {
      background-position: 0 0;
    }
  }
`;

export const AnimatedDashboardTabs: React.FC<React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLUListElement>,
  HTMLUListElement
> & { $isLoading?: boolean }> = props => {
  const ref = useRef<HTMLElement>();
  const width = useRef(0);
  const animRef = useRef<number>();

  useBrowserLayoutEffect(() => {
    if (ref.current) {
      width.current = ref.current?.getBoundingClientRect().width;
    }
  }, []);

  useEffect(() => {
    animRef.current = setInterval(() => {
      if (ref.current) {
        ref.current.style.backgroundPosition = `${(width.current + 50) % width.current}px`;
      }
    }, 16) as any;
    return () => {
      if (animRef.current) {
        clearTimeout(animRef.current);
      }
    };
  }, [props.$isLoading]);

  return <DashboardTabs ref={ref} {...(props as any)} />;
};

export const DashboardTab = styled.li<{ $active?: boolean }>`
  font-size: 14px;
  background: #626971;
  margin-right: 0.7em;
  cursor: pointer;
  a {
    text-decoration: none;
    color: #fff;
    padding: 0.65em 1em;
    display: block;
    &:hover {
      text-decoration: none;
    }
  }

  &:hover {
    background: #464e54;
    box-shadow: 0px 2px 0px 0px #464e54;
  }

  ${props =>
    props.$active &&
    css`
      background: #2d70f9;
      color: #fff;
      box-shadow: 0px 2px 0px 0px #2d70f9;
      a {
        color: #fff;
      }
      &:hover {
        background: #1e5bd7;
        box-shadow: 0px 2px 0px 0px #1e5bd7;
      }
    `}
`;
