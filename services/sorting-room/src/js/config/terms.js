export const terms = new Map([
  ['derivedManifestSingular', 'item'],
  ['derivedManifestPlural', 'items'],
  ['imageSingular', 'image'],
  ['imagePlural', 'images'],
]);

export const getTerm = (name, count) => (count > 1 ?
terms.get(`${name}Plural`) : terms.get(`${name}Singular`));
