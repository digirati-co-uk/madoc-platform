import React from 'react';

import { HTMLFieldProps } from './HTMLField';

const previewContainerClassName =
  'text-[1em] leading-[1.5em] [&_*]:font-inherit [&_*]:text-[1em] [&_code]:inline [&_code]:rounded-[3px] ' +
  '[&_code]:bg-[rgba(5,42,68,0.1)] [&_code]:px-[0.4em] [&_code]:py-[0.1em] ' +
  '[&_pre_>_code]:block [&_pre_>_code]:p-[0.65em] [&_h1]:my-[0.5em] [&_h1]:text-[1.75em] ' +
  '[&_h2]:my-[0.5em] [&_h3]:my-[0.5em] [&_h4]:my-[0.5em] [&_h5]:my-[0.5em] [&_h6]:my-[0.5em] ' +
  '[&_blockquote]:my-[0.65em] [&_blockquote]:border-l-[3px] [&_blockquote]:border-[rgba(5,42,68,0.4)] ' +
  '[&_blockquote]:pl-[0.65em] [&_blockquote]:italic [&_p]:my-[0.85em] [&_header]:my-[0.85em] ' +
  '[&_footer]:my-[0.85em] [&_main]:my-[0.85em] [&_header]:border-b [&_header]:border-[rgba(5,42,68,0.2)] ' +
  '[&_footer]:border-t [&_footer]:border-[rgba(5,42,68,0.2)] [&_strong]:font-semibold [&_u]:underline ' +
  '[&_ul]:my-[0.85em] [&_ul]:ml-[2em] [&_ul]:p-0 [&_ol]:my-[0.85em] [&_ol]:ml-[2em] [&_ol]:p-0 ' +
  '[&_ul_ul]:my-0 [&_ul_ol]:my-0 [&_ol_ul]:my-0 [&_ol_ol]:my-0 [&_li]:p-0';

type HTMLPreviewContainerProps = React.HTMLAttributes<HTMLDivElement>;

export const HTMLPreviewContainer: React.FC<HTMLPreviewContainerProps> = ({ className, ...props }) => {
  const mergedClassName = className ? `${previewContainerClassName} ${className}` : previewContainerClassName;
  return <div className={mergedClassName} {...props} />;
};

export const HTMLFieldPreview: React.FC<HTMLFieldProps> = ({ value }) => {
  if (!value) {
    return <span style={{ color: '#999' }}>No value</span>;
  }

  return <HTMLPreviewContainer dangerouslySetInnerHTML={{ __html: value }} />;
};
