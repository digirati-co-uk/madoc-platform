const RDF_NS = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';

const CLASS_TYPES = ['rdfs:Class', 'owl:Class'];

// @todo support N3 https://lov.linkeddata.es/dataset/lov

const PROPERTY_TYPES = [
  'rdf:Property',
  'owl:ObjectProperty',
  'owl:DatatypeProperty',
  'owl:SymmetricProperty',
  'owl:TransitiveProperty',
  'owl:FunctionalProperty',
  'owl:InverseFunctionalProperty',
];

// @todo handle case where default namespace is set to one of these prefixes.
//    Will need to change these to be full URIs instead of the common prefix.
//    these will then need to be parsed out using the context provided in the
//    XML parsing and a list like this created from those prefixes.
const LABEL_PROPERTY = ['skos:prefLabel', 'rdfs:label', 'foaf:name', 'rss:title', 'dc:title', 'dc11:title'];

const COMMENT_PROPERTY = ['rdfs:comment'];

const LOCAL_NAME_PROPERTY = ['rdf:about'];

export type RdfVocab = {
  namespaces: RdfNSList;
  properties: Array<{
    uri: string;
    term: string;
    label: string;
    description: string | null;
  }>;
  classes: Array<{
    uri: string;
    term: string;
    label: string;
    description: string | null;
  }>;
};

export type RdfNSList = { [alias: string]: string };

export const getAllElementByTypes = (el: Element, types: string[]) => {
  const tags = [];

  const nodeCache = [];

  // First get by tag name.
  types.forEach(type => {
    const els = el.getElementsByTagName(type);
    if (els.length) {
      for (const tag of Array.from(els)) {
        tags.push(tag);
      }
    }
  });

  // Then get by type
  for (const typeEl of Array.from(el.getElementsByTagName('rdf:type'))) {
    const resource = typeEl.attributes.getNamedItem('rdf:resource');
    if (!resource || !resource.nodeValue || !typeEl.parentElement) continue;

    if (types.indexOf(resource.nodeValue) !== -1) {
      if (tags.indexOf(typeEl.parentElement) === -1) {
        tags.push(typeEl.parentElement);
      }
    }
  }

  return tags;
};

export const resolveTypeFromNs = (prop: string, ns: RdfNSList) => {
  const [prefix, ...parts] = prop.split(':');

  if (ns[prefix]) {
    return ns[prefix] + parts.join(':');
  }

  return prefix + parts.join(':');
};

export const getNamespaces = (el: Element): RdfNSList => {
  if (!el) {
    return {};
  }

  const attributes = el.attributes;
  const length = attributes.length;
  const namespaces: RdfNSList = {
    rdf: RDF_NS,
  };

  for (let i = 0; i < length; i++) {
    const attr = attributes.item(i);
    if (!attr) continue;

    if (attr.nodeName.startsWith('xmlns:') && attr.nodeValue) {
      namespaces[attr.nodeName.slice(6)] = attr.nodeValue;
    }
  }

  return namespaces;
};

export const getProperty = (el: Element, names: string[]): string | null => {
  // Since this is XML, the label can either be an attribute or tag.
  // First we'll look for tags
  for (const tagName of names) {
    const tag = el.getElementsByTagName(tagName).item(0);
    if (tag) {
      if (tag.firstChild && tag.firstChild.nodeType === Node.TEXT_NODE) {
        return tag.firstChild.nodeValue;
      }
    }
  }

  // Then look for attributes.
  for (const attrName of names) {
    const attr = el.attributes.getNamedItem(attrName);
    if (attr) {
      return attr.value;
    }
  }

  // Otherwise null.
  return null;
};

export const getLocalName = (value: string | null, ns: RdfNSList): string | null => {
  if (!value) return value;

  for (const singleNs of Object.keys(ns)) {
    const sns = ns[singleNs];

    if (value.startsWith(sns)) {
      return singleNs + ':' + value.slice(sns.length);
    }
  }

  return value;
};

export const parseRdfVocab = (xml: string): RdfVocab => {
  const doc = new DOMParser().parseFromString(xml, 'text/xml');

  const rootElement = doc.documentElement;

  const namespaces = getNamespaces(rootElement);
  const resolvedPropertyTypes = PROPERTY_TYPES.map(prop => resolveTypeFromNs(prop, namespaces));
  const resolvedClassTypes = CLASS_TYPES.map(prop => resolveTypeFromNs(prop, namespaces));

  const vocab: RdfVocab = {
    namespaces,
    properties: [],
    classes: [],
  };

  // We need a getElementByType that will check the `rdf:type` and also one that just checks for tags.

  const found = {
    properties: getAllElementByTypes(rootElement, [...PROPERTY_TYPES, ...resolvedPropertyTypes]),
    classes: getAllElementByTypes(rootElement, [...CLASS_TYPES, ...resolvedClassTypes]),
  };

  for (const type of ['classes', 'properties'] as const) {
    for (const rdfTermDescription of found[type]) {
      const uri = getProperty(rdfTermDescription, LOCAL_NAME_PROPERTY);
      const term = getLocalName(uri, namespaces);
      const label = getProperty(rdfTermDescription, LABEL_PROPERTY);
      const description = getProperty(rdfTermDescription, COMMENT_PROPERTY);

      if (!uri || !term || !label) {
        continue;
      }

      vocab[type].push({
        uri,
        term,
        label,
        description,
      });
    }
  }

  return vocab;
};

export const fetchRdfVocab = () => {};
