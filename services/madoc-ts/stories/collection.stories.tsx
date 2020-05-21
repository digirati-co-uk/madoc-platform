import * as React from 'react';
import { Button, ButtonRow, SmallButton, TinyButton } from '../src/frontend/admin/atoms/Button';
import { Heading3, Subheading3 } from '../src/frontend/admin/atoms/Heading3';
import { Heading5, Subheading5, SingleLineHeading5 } from '../src/frontend/admin/atoms/Heading5';
import { ImageStrip, ImageStripBox } from '../src/frontend/admin/atoms/ImageStrip';
import { MoreContainer, MoreDot, MoreIconContainer, MoreLabel } from '../src/frontend/admin/atoms/MoreButton';
import styled from 'styled-components';
import { ImageGrid, ImageGridItem } from '../src/frontend/admin/atoms/ImageGrid';
import { CroppedImage } from '../src/frontend/admin/atoms/Images';
import { Heading1, Subheading1 } from '../src/frontend/admin/atoms/Heading1';
import { ReorderTable, ReorderTableRow } from '../src/frontend/admin/atoms/ReorderTable';
import { ContextHeading, Header } from '../src/frontend/admin/atoms/Header';
import { TableActions, TableContainer, TableRow, TableRowLabel } from '../src/frontend/admin/atoms/Table';
import { Input, InputContainer, InputLabel, InputLink } from '../src/frontend/admin/atoms/Input';
import { IntlField } from '../src/frontend/admin/atoms/IntlField';
import { ExpandGrid, GridContainer, HalfGird } from '../src/frontend/admin/atoms/Grid';
import {
  InnerModalContainer,
  ModalBackground,
  ModalBody,
  ModalCloseIcon,
  ModalContainer,
  ModalHeader,
  ModalHeaderTitle,
} from '../src/frontend/admin/atoms/Modal';
import { ModalButton } from '../src/frontend/admin/molecules/Modal';
import { MetadataEditor } from '../src/frontend/admin/molecules/MetadataEditor';
import { useState } from 'react';

export default { title: 'Collections' };

export const listCollections = () => {
  return (
    <>
      <h1>Manage collections</h1>
      <TinyButton>Import collection</TinyButton>
      <div>
        <Heading3>Some collection 1</Heading3>
        <Subheading3>18 Manifests</Subheading3>
        <ImageStrip>
          <ImageStripBox>
            <CroppedImage>
              <img src="https://dlcs.io/thumbs/wellcome/5/b18035723_0001.JP2/full/73,100/0/default.jpg" />
            </CroppedImage>
            <Heading5>Manifest a</Heading5>
            <Subheading5>61 images</Subheading5>
          </ImageStripBox>
          <ImageStripBox>
            <CroppedImage>
              <img src="https://dlcs-ida.org/thumbs/2/1/M-1011_R-127_1065/full/400,285/0/default.jpg" />
            </CroppedImage>
            <Heading5>Manifest a</Heading5>
            <Subheading5>61 images</Subheading5>
          </ImageStripBox>
          <div>
            <MoreContainer>
              <MoreIconContainer>
                <MoreDot />
                <MoreDot />
                <MoreDot />
              </MoreIconContainer>
              <MoreLabel>10 more</MoreLabel>
            </MoreContainer>
          </div>
        </ImageStrip>
        <ButtonRow>
          <TinyButton>edit</TinyButton>
          <TinyButton>add manifest</TinyButton>
          <TinyButton>edit metadata</TinyButton>
        </ButtonRow>
      </div>
    </>
  );
};

export const viewCollection = () => {
  const items = new Array(24).fill(1);

  return (
    <>
      <Heading1>Scottish bridges</Heading1>
      <Subheading1>18 manifests</Subheading1>
      <ButtonRow>
        <TinyButton>edit</TinyButton>
        <TinyButton>add manifest</TinyButton>
        <TinyButton>edit metadata</TinyButton>
      </ButtonRow>
      <ImageGrid>
        {items.map((_, idx) => (
          <ImageGridItem key={idx}>
            <CroppedImage>
              <img src="https://dlcs.io/thumbs/wellcome/5/b18035723_0001.JP2/full/73,100/0/default.jpg" />
            </CroppedImage>
            <SingleLineHeading5>Image long long long {idx}</SingleLineHeading5>
          </ImageGridItem>
        ))}
      </ImageGrid>
    </>
  );
};

export const editCollectionStructure = () => {
  return (
    <>
      <Header>
        <ContextHeading>Re-ordering collection manifests</ContextHeading>
        <Heading1>Collection A</Heading1>
        <Subheading1>
          <a href="#">Go back to collection</a>
        </Subheading1>
      </Header>
      <div>
        <SmallButton>save changes</SmallButton>

        <ReorderTable>
          <ReorderTableRow id="1" idx={0} label="Test 1">
            <TinyButton>remove</TinyButton>
          </ReorderTableRow>
          <ReorderTableRow id="2" idx={1} label="Test 2">
            <TinyButton>remove</TinyButton>
          </ReorderTableRow>
          <ReorderTableRow id="3" idx={2} label="Test 3">
            <TinyButton>remove</TinyButton>
          </ReorderTableRow>
          <ReorderTableRow id="4" idx={3} label="Test 4">
            <TinyButton>remove</TinyButton>
          </ReorderTableRow>
          <ReorderTableRow id="5" idx={4} label="Test 5">
            <TinyButton>remove</TinyButton>
          </ReorderTableRow>
        </ReorderTable>

        <SmallButton>save changes</SmallButton>
      </div>
    </>
  );
};

export const AddManifest: React.FC = () => {
  const manifests = ['Manifest A', 'Manifest B', 'Manifest C', 'Manifest D', 'Manifest E'];
  const [filtered, setFiltered] = React.useState(manifests);
  const [search, setSearch] = React.useState('');

  React.useEffect(() => {
    setFiltered(
      manifests.filter(e => {
        return e.indexOf(search) !== -1;
      })
    );
  }, [search]);

  return (
    <>
      <Header>
        <ContextHeading>Adding manifest</ContextHeading>
        <Heading1>Collection A</Heading1>
        <Subheading1>
          <a href="#">Go back to collection</a>
        </Subheading1>
      </Header>
      <div>
        <InputContainer>
          <InputLabel>Existing manifest</InputLabel>
          <Input
            placeholder="Search for existing manifest"
            type="text"
            onChange={e => setSearch(e.currentTarget.value)}
          />
          <InputLink href="#">Import from URL</InputLink>
        </InputContainer>

        <TableContainer>
          {filtered.map((label, key) => (
            <TableRow key={key}>
              <TableRowLabel>{label}</TableRowLabel>
              <TableActions>
                <TinyButton>Add to collection</TinyButton>
              </TableActions>
            </TableRow>
          ))}
        </TableContainer>
      </div>
    </>
  );
};

// background
// Container
// Inner container
// Header
// Header title
// Close icon
// modal body
// Flex left
// Language column
// Language list item
// Field item container
// Close field
// Add new field
// todo: label

export const EditMetadata = () => {
  return (
    <>
      <Header>
        <ul className="messages">
          <li className="error">This page is incomplete</li>
        </ul>
        <ContextHeading>Editing metadata</ContextHeading>
        <Heading1>Collection A</Heading1>
        <Subheading1>
          <a href="#">Go back to collection</a>
        </Subheading1>
      </Header>
      <InputContainer>
        <InputLabel htmlFor="label">Label</InputLabel>
        <MetadataEditor
          id="label"
          label="Label"
          fields={{ en: ['Some label'] }}
          metadataKey="label"
          availableLanguages={['en', 'es', 'fr', 'de']}
        />
      </InputContainer>
    </>
  );
};

export const ImportCollection = () => {
  const [collectionToAdd, setCollectionToAdd] = useState({ label: { en: [''] } });

  return (
    <>
      <Header>
        <ContextHeading>Importing manifest</ContextHeading>
        <Heading1>Collection A</Heading1>
        <Subheading1>
          <a href="#">Go back to collection</a>
        </Subheading1>
      </Header>

      <GridContainer>
        <HalfGird>
          <Heading3>Create new</Heading3>
          <Subheading3>Add a new empty collection and start adding IIIF manifests to it.</Subheading3>
          <MetadataEditor
            fields={collectionToAdd.label}
            onSave={ret => setCollectionToAdd({ label: ret.toInternationalString() })}
            metadataKey="label"
            availableLanguages={['en', 'es', 'fr', 'de']}
          />
          <SmallButton onClick={() => console.log(collectionToAdd)}>Create collection</SmallButton>
        </HalfGird>
        <HalfGird>
          <Heading3>Import existing</Heading3>
          <Subheading3>
            Import a collection using a URL pointing to an existing IIIF collection. You can choose which manifests
            should be included.
          </Subheading3>
          <InputContainer>
            <InputLabel>Collection URL</InputLabel>
            <Input type="text" />
          </InputContainer>
          <SmallButton>Import</SmallButton>
        </HalfGird>
      </GridContainer>
    </>
  );
};
