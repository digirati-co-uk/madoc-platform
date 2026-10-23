import React, { useContext, useMemo } from 'react';
import { renderToHtml } from 'rich-markdown-editor';
import { LinkTargetContext, setHtmlLinkTargets } from '../../../frontend/shared/utility/link-targets';

interface StaticMarkdownBlockProps {
  markdown: string;
  openInNewTab?: boolean;
}

export function StaticMarkdownBlock({ markdown, openInNewTab }: StaticMarkdownBlockProps) {
  const footerLinksInNewTab = useContext(LinkTargetContext);
  const htmlContent = useMemo(() => {
    return setHtmlLinkTargets(renderToHtml(markdown), !!openInNewTab || footerLinksInNewTab);
  }, [markdown, openInNewTab, footerLinksInNewTab]);

  return <div className="styled-editor" dangerouslySetInnerHTML={{ __html: htmlContent }} />;
}
