import React, { useState } from 'react';
import { DownArrowIcon } from '../../../../icons/DownArrowIcon';
import {
  DocumentDescription,
  DocumentHeading,
  DocumentLabel,
  DocumentLabelIcon,
  DocumentSectionField,
  DocumentValueWrapper,
} from '../ViewDocument.styles';

export interface ViewPropertyProps {
  collapsed?: boolean;
  interactive?: boolean;
  label: string;
  description?: string;
  fallback?: any;
  children?: React.ReactNode;
}

export function ViewProperty({ label, description, interactive, collapsed, fallback, children }: ViewPropertyProps) {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);

  return (
    <DocumentSectionField>
      <DocumentHeading $interactive={interactive} onClick={() => (interactive ? setIsCollapsed(i => !i) : undefined)}>
        <DocumentLabel>
          <span>{label}</span>
          {interactive ? (
            <DocumentLabelIcon>
              <DownArrowIcon
                style={
                  isCollapsed
                    ? { transform: 'rotate(180deg)', fill: '#6c757d', width: '22px', height: '23px' }
                    : { transform: 'rotate(0deg)', fill: '#6c757d', width: '22px', height: '23px' }
                }
              />
            </DocumentLabelIcon>
          ) : null}
        </DocumentLabel>
        {isCollapsed && fallback ? (
          <DocumentDescription>{fallback}</DocumentDescription>
        ) : description ? (
          <DocumentDescription>{description}</DocumentDescription>
        ) : null}
      </DocumentHeading>
      {!isCollapsed ? <DocumentValueWrapper>{children}</DocumentValueWrapper> : null}
    </DocumentSectionField>
  );
}
