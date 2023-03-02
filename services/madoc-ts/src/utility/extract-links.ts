import { DescriptiveProperties, LinkingProperties } from '@iiif/presentation-3';
import { ResourceLink } from '../database/queries/linking-queries';
import { iiifGetLabel } from './iiif-get-label';

export function extractLink<T = any>(
  item: any | any[],
  property: string,
  options: { source?: string; defaultLabel?: string } = {}
): ResourceLink<T>[] {
  if (Array.isArray(item)) {
    const ret = [];
    for (const i of item) {
      ret.push(...extractLink(i, property, options));
    }
    return ret;
  }

  const resourceLink: Partial<ResourceLink> = {
    property,
  };

  if (options.source) {
    resourceLink.source = options.source;
  }

  if (!item) {
    return [];
  }

  const { id, label, motivation, format, type, ...properties } = item;

  if (!id || typeof id !== 'string') {
    return [];
  }

  resourceLink.uri = id;

  if (motivation) {
    const firstMotivation = Array.isArray(motivation) ? motivation[0] : motivation;
    if (typeof firstMotivation === 'string') {
      resourceLink.motivation = firstMotivation;
    }
  }

  if (format && typeof format === 'string') {
    resourceLink.format = format;
  }

  if (type && typeof type === 'string') {
    resourceLink.type = type;
  }

  if (label) {
    if (typeof label === 'string') {
      resourceLink.label = label;
    } else {
      const tryLabel = iiifGetLabel(resourceLink.label as any, options.defaultLabel ? options.defaultLabel : property);
      if (tryLabel) {
        resourceLink.label = tryLabel;
      }
    }
  }

  if (!resourceLink.label) {
    resourceLink.label = options.defaultLabel ? options.defaultLabel : property;
  }

  if (properties && Object.keys(properties).length) {
    resourceLink.properties = properties;
  }

  return [resourceLink as ResourceLink<T>];
}

export function extractLinks<T = any>(
  item: LinkingProperties & { provider: DescriptiveProperties['provider'] },
  source: string
) {
  const links: ResourceLink<T>[] = [];
  if (item.homepage) {
    links.push(
      ...extractLink<T>(item.homepage, 'homepage', { defaultLabel: 'Homeage', source })
    );
  }
  // Legacy support.
  if (item.logo) {
    links.push(
      ...extractLink<T>(item.logo, 'logo', { defaultLabel: 'Logo', source })
    );
  }

  if (item.partOf) {
    links.push(
      ...extractLink<T>(item.partOf, 'partOf', { defaultLabel: 'Part of', source })
    );
  }

  if (item.rendering) {
    links.push(
      ...extractLink<T>(item.rendering, 'rendering', { defaultLabel: 'Rendering', source })
    );
  }

  if (item.seeAlso) {
    links.push(
      ...extractLink<T>(item.seeAlso, 'seeAlso', { defaultLabel: 'See also', source })
    );
  }

  if (item.service) {
    links.push(
      ...extractLink<T>(item.service, 'service', { defaultLabel: 'Service', source })
    );
  }

  if (item.services) {
    links.push(
      ...extractLink<T>(item.services, 'service', { defaultLabel: 'Service', source })
    );
  }

  if (item.start) {
    links.push(
      ...extractLink<T>(item.start, 'start', { defaultLabel: 'Start', source })
    );
  }

  if (item.supplementary) {
    links.push(
      ...extractLink<T>(item.supplementary, 'supplementary', { defaultLabel: 'Supplementary', source })
    );
  }

  if (item.provider) {
    links.push(
      ...extractLink<T>(item.provider, 'provider', { defaultLabel: 'Provider', source })
    );
  }

  return links;
}
