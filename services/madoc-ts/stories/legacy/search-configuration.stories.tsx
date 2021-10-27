import * as React from 'react';
import { MetadataEditor } from '../../src/frontend/admin/molecules/MetadataEditor';
import { CloseIcon } from '../../src/frontend/shared/icons/CloseIcon';
import { InputLabel } from '../../src/frontend/shared/form/Input';
import {
  FacetEditActions,
  FacetEditBack,
  FacetEditContainer,
  FacetEditRemove,
  MetadataCard,
  MetadataCardItem,
  MetadataCardLabel,
  MetadataCardListContainer,
  MetadataCardRemove,
  MetadataCardRemoveLabel,
  MetadataCardSubtext,
  MetadataDropzone,
  MetadataEmbeddedList,
  MetadataEmptyState,
  MetadataListContainer,
  MetadataListItemChildren,
  MetadataListItemCollapse,
  MetadataListItemContainer,
  MetadataListItemIcon,
  MetadataListItemLabel,
  MetadataListItemSubtitle,
  TableHandleIcon,
} from '../../src/frontend/shared/atoms/MetadataConfiguration';

export default { title: 'Legacy/Search configuration' };

export const Facet_Edit_Empty = () => {
  return (
    <FacetEditContainer>
      <FacetEditActions>
        <FacetEditBack>Back</FacetEditBack>
        <FacetEditRemove>
          <CloseIcon />
          remove
        </FacetEditRemove>
      </FacetEditActions>
      <InputLabel htmlFor="title">Title</InputLabel>
      <MetadataEditor
        fluid
        id="title"
        fields={{
          en: ['Some value'],
          de: ['Some other value'],
        }}
        onSave={ret => {
          console.log(ret.items, ret.getDiff(), ret.toInternationalString());
        }}
        metadataKey="label"
        availableLanguages={['en', 'es', 'fr', 'de']}
      />
      <InputLabel htmlFor="included-fields">Included fields</InputLabel>
      <MetadataEmbeddedList id="included-fields">
        <MetadataDropzone>drop facet or click to add custom</MetadataDropzone>
      </MetadataEmbeddedList>
      <InputLabel htmlFor="included-fields">Only show these values</InputLabel>
      <MetadataEmbeddedList id="included-fields">
        <MetadataDropzone>Showing all values - drop value or click to add custom</MetadataDropzone>
      </MetadataEmbeddedList>
    </FacetEditContainer>
  );
};
export const Facet_Edit_Full = () => {
  return (
    <FacetEditContainer>
      <FacetEditActions>
        <FacetEditBack>Back</FacetEditBack>
        <FacetEditRemove>
          <CloseIcon />
          remove
        </FacetEditRemove>
      </FacetEditActions>
      <InputLabel htmlFor="title">Title</InputLabel>
      <MetadataEditor
        fluid
        id="title"
        fields={{
          en: ['Some value'],
          de: ['Some other value'],
        }}
        onSave={ret => {
          console.log(ret.items, ret.getDiff(), ret.toInternationalString());
        }}
        metadataKey="label"
        availableLanguages={['en', 'es', 'fr', 'de']}
      />
      <InputLabel htmlFor="included-fields">Included fields</InputLabel>
      <MetadataEmbeddedList id="included-fields">
        <MetadataCardItem>
          <MetadataCard>
            <MetadataCardLabel>Some value</MetadataCardLabel>
            <MetadataCardSubtext>click to customise</MetadataCardSubtext>
          </MetadataCard>
          <MetadataCardRemove>
            <CloseIcon /> <MetadataCardRemoveLabel>remove</MetadataCardRemoveLabel>
          </MetadataCardRemove>
        </MetadataCardItem>

        <MetadataCardItem>
          <MetadataCard>
            <MetadataCardLabel>Some value</MetadataCardLabel>
            <MetadataCardSubtext>click to customise</MetadataCardSubtext>
          </MetadataCard>
          <MetadataCardRemove>
            <CloseIcon /> <MetadataCardRemoveLabel>remove</MetadataCardRemoveLabel>
          </MetadataCardRemove>
        </MetadataCardItem>
        <MetadataDropzone>drop facet or click to add custom</MetadataDropzone>
      </MetadataEmbeddedList>
      <InputLabel htmlFor="included-fields">Only show these values</InputLabel>
      <MetadataEmbeddedList id="included-fields">
        <MetadataEmptyState>Showing all values</MetadataEmptyState>
      </MetadataEmbeddedList>
    </FacetEditContainer>
  );
};

export const Facets_List = () => {
  return (
    <MetadataCardListContainer>
      <MetadataCardItem>
        <MetadataCard>
          <MetadataCardLabel>Facet title 1</MetadataCardLabel>
          <MetadataCardSubtext>click to customise</MetadataCardSubtext>
        </MetadataCard>
        <MetadataCardRemove>
          <CloseIcon /> <MetadataCardRemoveLabel>remove</MetadataCardRemoveLabel>
        </MetadataCardRemove>
      </MetadataCardItem>
      <MetadataCardItem>
        <MetadataCard>
          <MetadataCardLabel>Facet title 2</MetadataCardLabel>
          <MetadataCardSubtext>click to customise</MetadataCardSubtext>
        </MetadataCard>
        <MetadataCardRemove>
          <CloseIcon /> <MetadataCardRemoveLabel>remove</MetadataCardRemoveLabel>
        </MetadataCardRemove>
      </MetadataCardItem>
      <MetadataCardItem>
        <MetadataCard>
          <MetadataCardLabel>Facet title 3</MetadataCardLabel>
          <MetadataCardSubtext>click to customise</MetadataCardSubtext>
        </MetadataCard>
        <MetadataCardRemove>
          <CloseIcon /> <MetadataCardRemoveLabel>remove</MetadataCardRemoveLabel>
        </MetadataCardRemove>
      </MetadataCardItem>
      <MetadataDropzone>drop facet or click to add custom</MetadataDropzone>
    </MetadataCardListContainer>
  );
};

export const Facet_Tree = () => {
  return (
    <MetadataListContainer>
      <MetadataListItemContainer>
        <MetadataListItemIcon>
          <TableHandleIcon />
        </MetadataListItemIcon>
        <MetadataListItemLabel>Title</MetadataListItemLabel>
        <MetadataListItemCollapse>–</MetadataListItemCollapse>
      </MetadataListItemContainer>
      <MetadataListItemChildren>
        <MetadataListItemContainer>
          <MetadataListItemIcon>
            <TableHandleIcon />
          </MetadataListItemIcon>
          <MetadataListItemLabel>Some title 1</MetadataListItemLabel>
          <MetadataListItemSubtitle>10 instances</MetadataListItemSubtitle>
        </MetadataListItemContainer>

        <MetadataListItemContainer>
          <MetadataListItemIcon>
            <TableHandleIcon />
          </MetadataListItemIcon>
          <MetadataListItemLabel>Some title 2</MetadataListItemLabel>
          <MetadataListItemSubtitle>6 instances</MetadataListItemSubtitle>
        </MetadataListItemContainer>

        <MetadataListItemContainer>
          <MetadataListItemIcon>
            <TableHandleIcon />
          </MetadataListItemIcon>
          <MetadataListItemLabel>Some title 3</MetadataListItemLabel>
          <MetadataListItemSubtitle>5 instances</MetadataListItemSubtitle>
        </MetadataListItemContainer>
      </MetadataListItemChildren>
      <MetadataListItemContainer>
        <MetadataListItemIcon>
          <TableHandleIcon />
        </MetadataListItemIcon>
        <MetadataListItemLabel>Title</MetadataListItemLabel>
        <MetadataListItemCollapse>+</MetadataListItemCollapse>
      </MetadataListItemContainer>
      <MetadataListItemContainer>
        <MetadataListItemIcon>
          <TableHandleIcon />
        </MetadataListItemIcon>
        <MetadataListItemLabel>Title</MetadataListItemLabel>
        <MetadataListItemCollapse>+</MetadataListItemCollapse>
      </MetadataListItemContainer>
      <MetadataListItemContainer>
        <MetadataListItemIcon>
          <TableHandleIcon />
        </MetadataListItemIcon>
        <MetadataListItemLabel>Title</MetadataListItemLabel>
        <MetadataListItemCollapse>+</MetadataListItemCollapse>
      </MetadataListItemContainer>
    </MetadataListContainer>
  );
};
