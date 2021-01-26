import { InternationalString } from '@hyperion-framework/types';
import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { DownArrowIcon } from '../icons/DownArrowIcon';
import { SearchFacet } from '../../../types/search';
import { Button, ButtonRow } from '../atoms/Button';
import { LocaleString } from './LocaleString';
import { FacetConfig } from './MetadataFacetEditor';

const FacetsContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 200px;
  margin-right: 1rem;
`;

const FacetLabel = styled.label`
  font-size: 10px;
  color: #000000;
  text-decoration: rgb(0, 0, 0);
  letter-spacing: 1px;
  text-transform: capitalize;
  max-width: 10rem;
`;

const FacetType = styled.div`
  font-size: 10px;
  color: #000000;
  text-decoration: rgb(0, 0, 0);
  letter-spacing: 1px;
  text-transform: uppercase;
  padding: 1rem 0;
  display: flex;
  justify-content: space-between;
`;

const FacetTitle = styled.div`
  font-size: 10px;
  color: #000000;
  text-decoration: rgb(0, 0, 0);
  letter-spacing: 1px;
  text-transform: uppercase;
`;

const FacetExpandable: React.FC<{
  name: string;
  facetChange: (val: string, name: string) => void;
  values: Array<any>;
}> = ({ name, facetChange, values }) => {
  const [open, setOpen] = useState(true);

  if (values.length === 0) {
    return null;
  }

  return (
    <>
      <FacetType onClick={() => setOpen(!open)}>
        {name}
        <DownArrowIcon style={open ? { transform: 'rotate(180deg)' } : {}} />
      </FacetType>
      {open
        ? values.map(option => {
            return (
              <FacetLabel htmlFor={`facet__${name}__${option.value}`} key={`facet__${name}__${option.value}`}>
                <input
                  key={`facet__${name}__${option.value}__${option.applied}`}
                  id={`facet__${name}__${option.value}`}
                  type="checkbox"
                  value={option.value}
                  onChange={val => {
                    facetChange(name, val.target.value);
                  }}
                  defaultChecked={option.applied}
                />
                {option.value}
              </FacetLabel>
            );
          })
        : null}
    </>
  );
};

const FacetConfigured: React.FC<{
  id: string;
  label: InternationalString;
  keys: string[];
  facetChange: (val: string, name: string) => void;
  values: Array<{
    id: string;
    label: InternationalString;
    values: string[];
    applied?: boolean;
  }>;
}> = ({ label, keys, facetChange, values }) => {
  const [open, setOpen] = useState(true);

  return (
    <>
      <FacetType onClick={() => setOpen(!open)}>
        <LocaleString>{label}</LocaleString>
        <DownArrowIcon style={open ? { transform: 'rotate(180deg)' } : {}} />
      </FacetType>
      {open
        ? values.map(option => {
            return (
              <FacetLabel key={option.id} htmlFor={option.id}>
                <input
                  id={option.id}
                  type="checkbox"
                  checked={!!option.applied}
                  onChange={() => {
                    for (const key of keys) {
                      for (const value of option.values) {
                        facetChange(key.toLowerCase(), value);
                      }
                    }
                  }}
                />
                <LocaleString>{option.label}</LocaleString>
              </FacetLabel>
            );
          })
        : null}
    </>
  );
};

const ConfiguredFacets: React.FC<{
  config: FacetConfig[];
  facets: SearchFacet[];
  facetChange: (name: string, val: string) => void;
}> = ({ config, facets, facetChange }) => {
  const facetMap = useMemo(() => {
    const map: { [type: string]: SearchFacet[] } = {};
    for (const facet of facets || []) {
      const key = `${facet.type}.${facet.subtype}`;
      map[key] = map[key] ? map[key] : [];
      map[key].push(facet);
    }
    return map;
  }, [facets]);

  const readyFacets = useMemo(
    () =>
      config.map(facet => {
        const values: Array<{
          id: string;
          label: InternationalString;
          values: string[];
          applied?: boolean;
        }> = [];

        if (facet.values && facet.values.length) {
          for (const key of facet.keys) {
            const formattedKey = key.toLowerCase();
            if (facetMap[formattedKey]) {
              for (const option of facetMap[formattedKey]) {
                for (const value of facet.values) {
                  for (const v of value.values) {
                    if (v === option.value) {
                      (value as any).applied = option.applied;
                    }
                  }
                }
              }
            }
          }
          values.push(...facet.values);
        } else {
          for (const key of facet.keys) {
            const formattedKey = key.toLowerCase();
            if (facetMap[formattedKey]) {
              for (const option of facetMap[formattedKey]) {
                values.push({
                  label: { none: [option.value] },
                  id: `facet__${name}__${option.value}__${option.applied}`,
                  values: [option.value],
                  applied: option.applied,
                });
              }
            }
          }
        }
        return {
          ...facet,
          keys: facet.keys.map(key => {
            // Our key starts with metadata.
            if (key.startsWith('metadata.')) {
              return key.slice('metadata.'.length).toLowerCase();
            }
            return key.toLowerCase();
          }),
          values: values.filter(value => value.values.length),
        };
      }),
    [config, facetMap]
  );

  return (
    <>
      {readyFacets.map(facet => (
        <FacetConfigured
          key={facet.id}
          id={facet.id}
          label={facet.label}
          keys={facet.keys}
          facetChange={facetChange}
          values={facet.values}
        />
      ))}
    </>
  );
};

export const SearchFacets: React.FC<{
  facetConfiguration: FacetConfig[];
  facets: SearchFacet[];
  facetChange: (name: string, val: string) => void;
  applyFilters: () => void;
  clearFilters: () => void;
}> = ({ facets, facetConfiguration, facetChange, applyFilters, clearFilters }) => {
  const groups = [...new Set(facets.map(facet => facet.subtype))];
  return (
    <FacetsContainer>
      <FacetTitle>filter by</FacetTitle>
      <ButtonRow>
        <Button onClick={() => applyFilters()}>Apply Filters</Button>
        <Button onClick={() => clearFilters()}>Clear Filters</Button>
      </ButtonRow>

      {facetConfiguration.length ? (
        <ConfiguredFacets facets={facets} config={facetConfiguration} facetChange={facetChange} />
      ) : (
        groups.map(groupType => {
          return (
            <FacetExpandable
              key={groupType}
              name={groupType}
              facetChange={facetChange}
              values={facets.filter(facet => facet.subtype === groupType)}
            />
          );
        })
      )}
    </FacetsContainer>
  );
};
