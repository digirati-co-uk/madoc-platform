import React from 'react';
import styled, { css } from 'styled-components';

// Icons

export function DashboardIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g fill="none" fillRule="evenodd">
        <rect
          width={247}
          height={47}
          rx={3}
          fill="none"
          opacity={0.806}
          fillOpacity={0}
          transform="translate(-15 -13)"
        />
        <path d="M-15-6H9v24h-24z" />
        <path d="M0 10h8V0H0v10zm0 8h8v-6H0v6zm10 0h8V8h-8v10zm0-18v6h8V0h-8z" fill="#FFF" fillRule="nonzero" />
      </g>
    </svg>
  );
}

export function ManageCollectionsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 18 19" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g transform="translate(-33 -187)" fill="none" fillRule="evenodd">
        <path d="M30 185h24v24H30z" />
        <path
          d="M41.99 203.54l-7.37-5.73-1.62 1.26 9 7 9-7-1.63-1.27-7.38 5.74zM42 201l7.36-5.73L51 194l-9-7-9 7 1.63 1.27L42 201z"
          fill="#FFF"
          fillRule="nonzero"
        />
      </g>
    </svg>
  );
}

export function ManageManifestsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 22 18" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g fill="none" fillRule="evenodd">
        <path d="M-1-4h24v24H-1z" />
        <g fill="#FFF" fillRule="nonzero">
          <path d="M20 1C18.89.65 17.67.5 16.5.5 14.55.5 12.45.9 11 2 9.55.9 7.45.5 5.5.5 3.55.5 1.45.9 0 2v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C2.1 16.45 4.05 16 5.5 16c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V2c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V4c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z" />
          <path d="M16.5 6.5c.88 0 1.73.09 2.5.26V5.24c-.79-.15-1.64-.24-2.5-.24-1.7 0-3.24.29-4.5.83v1.66c1.13-.64 2.7-.99 4.5-.99zM12 8.49v1.66c1.13-.64 2.7-.99 4.5-.99.88 0 1.73.09 2.5.26V7.9c-.79-.15-1.64-.24-2.5-.24-1.7 0-3.24.3-4.5.83zM16.5 10.33c-1.7 0-3.24.29-4.5.83v1.66c1.13-.64 2.7-.99 4.5-.99.88 0 1.73.09 2.5.26v-1.52c-.79-.16-1.64-.24-2.5-.24z" />
        </g>
      </g>
    </svg>
  );
}

export function ProjectsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 16 20" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g fill="none" fillRule="evenodd">
        <path
          d="M10 0H2C.9 0 .01.9.01 2L0 18c0 1.1.89 2 1.99 2H14c1.1 0 2-.9 2-2V6l-6-6zM6.94 16L3.4 12.46l1.41-1.41 2.12 2.12 4.24-4.24 1.41 1.41L6.94 16zM9 7V1.5L14.5 7H9z"
          fill="#FFF"
          fillRule="nonzero"
        />
      </g>
    </svg>
  );
}

export function AdminSearchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g fill="none" fillRule="evenodd">
        <path
          d="M12.5 11h-.79l-.28-.27A6.471 6.471 0 0013 6.5 6.5 6.5 0 106.5 13c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L17.49 16l-4.99-5zm-6 0C4.01 11 2 8.99 2 6.5S4.01 2 6.5 2 11 4.01 11 6.5 8.99 11 6.5 11z"
          fill="#FFF"
          fillRule="nonzero"
        />
      </g>
    </svg>
  );
}

export function SiteConfigurationIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g fill="none" fillRule="evenodd">
        <path d="M-2-2h24v24H-2z" />
        <path
          d="M17.14 10.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.488.488 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94L12.4.81a.484.484 0 00-.48-.41H8.08c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L.74 6.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94 0 .31.02.64.07.94L.84 12.52a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM10 13.6A3.61 3.61 0 016.4 10c0-1.98 1.62-3.6 3.6-3.6s3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"
          fill="#FFF"
          fillRule="nonzero"
        />
      </g>
    </svg>
  );
}

// Sidebar
export const AdminSidebarContainer = styled.div`
  background: #4b67e1;
  padding: 0.8em;
  color: #fff;
  height: 100%;
`;

// Site switcher.
export const SiteSwitcherContainer = styled.div`
  background: #6087f1;
  border-radius: 5px;
  padding: 0.8em;
  font-size: 0.85em;
  margin-bottom: 2em;
`;

export const SiteSwitcherSiteName = styled.div`
  font-weight: bold;
`;

export const SiteSwitcherBackButton = styled.div`
  color: #fff;
  text-decoration: none;
`;

// Menu
export const AdminMenuContainer = styled.div`
  // nothing?
`;

export const AdminMenuItemContainer = styled.div<{ $active?: boolean }>`
  color: rgba(255, 255, 255, 0.9);
`;

export const AdminMenuItem = styled.a<{ $active?: boolean }>`
  padding: 1em;
  display: flex;
  border-radius: 3px;
  cursor: pointer;
  margin-bottom: 0.25em;
  font-size: 0.85em;
  align-items: center;
  text-decoration: none;

  ${props =>
    props.$active &&
    css`
      background: #3e56bc;
    `}
`;

export const AdminMenuSubItemContainer = styled.div<{ $open?: boolean }>`
  padding-left: 3.5em;
  box-shadow: inset 0 -2px 0 0 #345dc9;
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.4s;
  font-size: 0.85em;

  ${props =>
    props.$open &&
    css`
      max-height: 10em;
    `}
`;

export const AdminMenuSubItem = styled.div`
  padding: 0.5em;
  margin-bottom: 0.5em;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  display: block;
  text-decoration: none;

  &:hover {
    color: #fff;
  }
`;

export const AdminMenuItemIcon = styled.div`
  width: 2em;
  font-size: 1.35em;
  line-height: 1;
`;

export const AdminMenuItemLabel = styled.div`
  flex: 1 1 0px;
  color: #fff;
  text-decoration: none;
`;

// Admin layout

export const AdminLayoutContainer = styled.div`
  width: 100%;
  max-height: calc(100vh - 36px);
  height: calc(100vh - 36px);
  display: flex;
  overflow: hidden;
`;

export const AdminLayoutMenu = styled.div`
  width: 280px;
  min-width: 280px;
`;

export const AdminLayoutMain = styled.div`
  min-width: 0;
  flex: 1 1 0px;
  overflow-y: auto;
`;
