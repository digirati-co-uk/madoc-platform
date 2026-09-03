import React, { memo, useMemo } from 'react';
import { renderToHtml } from 'rich-markdown-editor';

interface ProjectUpdateMarkdownProps {
  markdown: string;
}

const markdownStyles = [
  'break-words text-gray-800 leading-7',
  '[&>*:first-child]:mt-0 [&>*:last-child]:mb-0',
  '[&_p]:my-4',
  '[&_h1]:mt-8 [&_h1]:mb-4 [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:leading-tight',
  '[&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:leading-tight',
  '[&_h3]:mt-6 [&_h3]:mb-3 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:leading-snug',
  '[&_h4]:mt-5 [&_h4]:mb-2 [&_h4]:text-lg [&_h4]:font-semibold',
  '[&_h5]:mt-4 [&_h5]:mb-2 [&_h5]:font-semibold',
  '[&_h6]:mt-4 [&_h6]:mb-2 [&_h6]:text-sm [&_h6]:font-semibold [&_h6]:uppercase [&_h6]:tracking-wide',
  '[&_a]:text-sky-700 [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-sky-900',
  '[&_strong]:font-semibold [&_em]:italic [&_u]:underline [&_s]:line-through [&_del]:line-through',
  '[&_mark]:rounded [&_mark]:bg-yellow-200 [&_mark]:px-1',
  '[&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-7',
  '[&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-7',
  '[&_li]:my-1 [&_li>p]:my-0',
  '[&_li[data-type]]:flex [&_li[data-type]]:list-none [&_li[data-type]]:items-start [&_li[data-type]]:gap-2',
  '[&_li[data-type]>span]:mt-1 [&_li[data-type]>div]:min-w-0',
  '[&_input[type=checkbox]]:h-4 [&_input[type=checkbox]]:w-4 [&_input[type=checkbox]]:accent-sky-700',
  '[&_blockquote]:my-5 [&_blockquote]:border-l-4 [&_blockquote]:border-slate-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-slate-600',
  '[&_hr]:my-8 [&_hr]:border-0 [&_hr]:border-t [&_hr]:border-slate-300',
  '[&_code]:rounded [&_code]:bg-slate-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-sm',
  '[&_pre]:my-5 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-slate-900 [&_pre]:p-4 [&_pre]:text-slate-100',
  '[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-inherit',
  '[&_table]:my-5 [&_table]:w-full [&_table]:border-collapse [&_table]:text-left [&_table]:text-sm',
  '[&_th]:border [&_th]:border-slate-300 [&_th]:bg-slate-100 [&_th]:px-3 [&_th]:py-2 [&_th]:font-semibold',
  '[&_td]:border [&_td]:border-slate-300 [&_td]:px-3 [&_td]:py-2 [&_tbody_tr:nth-child(even)]:bg-slate-50',
  '[&_img]:my-5 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded',
  '[&_iframe]:my-5 [&_iframe]:aspect-video [&_iframe]:w-full [&_iframe]:max-w-full',
  '[&_.notice-block]:my-5 [&_.notice-block]:rounded-md [&_.notice-block]:border-l-4 [&_.notice-block]:p-4',
  '[&_.notice-block.info]:border-sky-500 [&_.notice-block.info]:bg-sky-50',
  '[&_.notice-block.tip]:border-emerald-500 [&_.notice-block.tip]:bg-emerald-50',
  '[&_.notice-block.warning]:border-amber-500 [&_.notice-block.warning]:bg-amber-50',
].join(' ');

export const ProjectUpdateMarkdown = memo(function ProjectUpdateMarkdown({ markdown }: ProjectUpdateMarkdownProps) {
  const html = useMemo(() => renderToHtml(markdown), [markdown]);

  return <div className={markdownStyles} dangerouslySetInnerHTML={{ __html: html }} />;
});
