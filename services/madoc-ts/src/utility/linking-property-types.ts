import { PARAGRAPHS_PROFILE } from '../extensions/capture-models/Paragraphs/Paragraphs.helpers';
import { ResourceLinkResponse } from '../types/schemas/linking';

export function isLinkMetsAlto(link: ResourceLinkResponse) {
  return (
    (link.link.format === 'text/xml' || link.link.format === 'application/xml+alto') &&
    link.link.profile &&
    link.link.profile.startsWith('http://www.loc.gov/standards/alto/')
  );
}

export function isLinkHocr(link: ResourceLinkResponse) {
  return (
    link.link.format === 'text/vnd.hocr+html' &&
    link.link.profile &&
    (link.link.profile.startsWith('http://kba.cloud/hocr-spec') ||
      link.link.profile.startsWith('http://kba.github.io/hocr-spec/') ||
      link.link.profile === 'https://github.com/kba/hocr-spec/blob/master/hocr-spec.md')
  );
}

export function isLinkPlaintext(link: ResourceLinkResponse) {
  return link.link.format === 'text/plain';
}

export function isLinkCaptureModelParagraphs(link: ResourceLinkResponse) {
  return (
    link.link.format === 'application/json' &&
    link.link.type === 'CaptureModelDocument' &&
    link.link.profile === PARAGRAPHS_PROFILE
  );
}
