import * as React from 'react';
import styled from 'styled-components';
import { AddIcon } from '../../src/frontend/shared/icons/AddIcon';
import { AnnotationsIcon } from '../../src/frontend/shared/icons/AnnotationsIcon';
import { ArrowBackIcon } from '../../src/frontend/shared/icons/ArrowBackIcon';
import { ArrowDownIcon } from '../../src/frontend/shared/icons/ArrowDownIcon';
import { ArrowForwardIcon } from '../../src/frontend/shared/icons/ArrowForwardIcon';
import { BugIcon } from '../../src/frontend/shared/icons/BugIcon';
import { CallMergeIcon } from '../../src/frontend/shared/icons/CallMergeIcon';
import CheckCircleIcon from '../../src/frontend/shared/icons/CheckCircleIcon';
import { Chevron } from '../../src/frontend/shared/icons/Chevron';
import { CloseIcon } from '../../src/frontend/shared/icons/CloseIcon';
import { CompareIcon } from '../../src/frontend/shared/icons/CompareIcon';
import { DeleteForeverIcon } from '../../src/frontend/shared/icons/DeleteForeverIcon';
import { DownArrowIcon } from '../../src/frontend/shared/icons/DownArrowIcon';
import { EditIcon } from '../../src/frontend/shared/icons/EditIcon';
import { ErrorIcon } from '../../src/frontend/shared/icons/ErrorIcon';
import { ExperimentalIcon } from '../../src/frontend/shared/icons/ExperimentalIcon';
import { FilterIcon } from '../../src/frontend/shared/icons/FilterIcon';
import { FullScreenEnterIcon } from '../../src/frontend/shared/icons/FullScreenEnterIcon';
import { FullScreenExitIcon } from '../../src/frontend/shared/icons/FullScreenExitIcon';
import { GradingIcon } from '../../src/frontend/shared/icons/GradingIcon';
import { GridIcon } from '../../src/frontend/shared/icons/GridIcon';
import { HomeIcon } from '../../src/frontend/shared/icons/HomeIcon';
import { IIIFLogo } from '../../src/frontend/shared/icons/iiif-logo';
import { InfoIcon } from '../../src/frontend/shared/icons/InfoIcon';
import ListItemIcon from '../../src/frontend/shared/icons/ListItemIcon';
import { LockIcon } from '../../src/frontend/shared/icons/LockIcon';
import { MinusIcon } from '../../src/frontend/shared/icons/MinusIcon';
import { ModelDocumentIcon } from '../../src/frontend/shared/icons/ModelDocumentIcon';
import NoEntryIcon from '../../src/frontend/shared/icons/NoEntryIcon';
import { NotificationIcon } from '../../src/frontend/shared/icons/NotificationIcon';
import { NotStartedIcon } from '../../src/frontend/shared/icons/NotStartedIcon';
import { PersonIcon } from '../../src/frontend/shared/icons/PersonIcon';
import { PlusIcon } from '../../src/frontend/shared/icons/PlusIcon';
import { PreviewIcon } from '../../src/frontend/shared/icons/PreviewIcon';
import { ProgressIcon } from '../../src/frontend/shared/icons/ProgressIcon';
import { RequestChangesIcon } from '../../src/frontend/shared/icons/RequestChangesIcon';
import ResizeHandleIcon from '../../src/frontend/shared/icons/ResizeHandleIcon';
import { RotateIcon } from '../../src/frontend/shared/icons/RotateIcon';
import { SearchIcon } from '../../src/frontend/shared/icons/SearchIcon';
import { SettingsIcon } from '../../src/frontend/shared/icons/SettingsIcon';
import { Spinner } from '../../src/frontend/shared/icons/Spinner';
import { TableHandleIcon } from '../../src/frontend/shared/icons/TableHandleIcon';
import { TickIcon } from '../../src/frontend/shared/icons/TickIcon';
import { TranscriptionIcon } from '../../src/frontend/shared/icons/TranscriptionIcon';
import UnlockSmileyIcon from '../../src/frontend/shared/icons/UnlockSmileyIcon';

export default { title: 'components / icons' };

const Container = styled.div`
  background: #f9f9f9;
  border: 1px solid #999;
  border-radius: 3px;
  display: flex;
  flex-direction: column;

  svg {
    width: 100%;
    height: 100%;
    flex: 1;
    fill: #000;
    color: #000;
    padding: 0.5em;
  }
  div {
    margin-top: auto;
    font-size: 0.8em;
    padding: 0.25rem;
  }

  &:hover {
    background: #333;
    svg {
      fill: #fff;
      color: #fff;
    }
  }
`;

function IconContainer(props: any) {
  return (
    <Container>
      {props.children}

      <div style={{ background: '#fff' }}>{props.name}</div>
    </Container>
  );
}

export const allIcons = () => {
  const props = { width: '100%', height: '100%', fill: '#000', color: '#000' };

  return (
    <div
      style={{
        display: 'grid',
        // I want grid to be 128px wide
        gridTemplateColumns: 'repeat(auto-fill, minmax(128px, 1fr))',
        gridGap: '1rem',
        padding: '1rem',
      }}
    >
      <IconContainer name="AddIcon">
        <AddIcon {...props} />
      </IconContainer>
      <IconContainer name="AnnotationsIcon">
        <AnnotationsIcon {...props} />
      </IconContainer>
      <IconContainer name="ArrowBackIcon">
        <ArrowBackIcon {...props} />
      </IconContainer>
      <IconContainer name="ArrowDownIcon">
        <ArrowDownIcon {...props} />
      </IconContainer>
      <IconContainer name="ArrowForwardIcon">
        <ArrowForwardIcon {...props} />
      </IconContainer>
      <IconContainer name="BugIcon">
        <BugIcon {...props} />
      </IconContainer>
      <IconContainer name="CallMergeIcon">
        <CallMergeIcon {...props} />
      </IconContainer>
      <IconContainer name="CheckCircleIcon">
        <CheckCircleIcon {...props} />
      </IconContainer>
      <IconContainer name="Chevron">
        <Chevron {...props} />
      </IconContainer>
      <IconContainer name="CloseIcon">
        <CloseIcon {...props} />
      </IconContainer>
      <IconContainer name="CompareIcon">
        <CompareIcon {...props} />
      </IconContainer>
      <IconContainer name="DeleteForeverIcon">
        <DeleteForeverIcon {...props} />
      </IconContainer>
      <IconContainer name="DownArrowIcon">
        <DownArrowIcon {...props} />
      </IconContainer>
      <IconContainer name="EditIcon">
        <EditIcon {...props} />
      </IconContainer>
      <IconContainer name="ErrorIcon">
        <ErrorIcon {...props} />
      </IconContainer>
      <IconContainer name="ExperimentalIcon">
        <ExperimentalIcon {...props} />
      </IconContainer>
      <IconContainer name="FilterIcon">
        <FilterIcon {...props} />
      </IconContainer>
      <IconContainer name="FullScreenEnterIcon">
        <FullScreenEnterIcon {...props} />
      </IconContainer>
      <IconContainer name="FullScreenExitIcon">
        <FullScreenExitIcon {...props} />
      </IconContainer>
      <IconContainer name="GradingIcon">
        <GradingIcon {...props} />
      </IconContainer>
      <IconContainer name="GridIcon">
        <GridIcon {...props} />
      </IconContainer>
      <IconContainer name="HomeIcon">
        <HomeIcon {...props} />
      </IconContainer>
      <IconContainer name="iiif">
        <IIIFLogo {...props} />
      </IconContainer>
      <IconContainer name="InfoIcon">
        <InfoIcon {...props} />
      </IconContainer>
      <IconContainer name="ListItemIcon">
        <ListItemIcon {...props} />
      </IconContainer>
      <IconContainer name="LockIcon">
        <LockIcon {...props} />
      </IconContainer>
      <IconContainer name="MinusIcon">
        <MinusIcon {...props} />
      </IconContainer>
      <IconContainer name="ModelDocumentIcon">
        <ModelDocumentIcon {...props} />
      </IconContainer>
      <IconContainer name="NoEntryIcon">
        <NoEntryIcon {...props} />
      </IconContainer>
      <IconContainer name="NotificationIcon">
        <NotificationIcon {...props} />
      </IconContainer>
      {/*<IconContainer name="NotStartedIcon">*/}
      {/*  <NotStartedIcon {...props} />*/}
      {/*</IconContainer>*/}
      <IconContainer name="PersonIcon">
        <PersonIcon {...props} />
      </IconContainer>
      <IconContainer name="PlusIcon">
        <PlusIcon {...props} />
      </IconContainer>
      <IconContainer name="PreviewIcon">
        <PreviewIcon {...props} />
      </IconContainer>
      {/*<IconContainer name="ProgressIcon">*/}
      {/*  <ProgressIcon {...props} />*/}
      {/*</IconContainer>*/}
      <IconContainer name="RequestChangesIcon">
        <RequestChangesIcon {...props} />
      </IconContainer>
      <IconContainer name="ResizeHandleIcon">
        <ResizeHandleIcon {...props} />
      </IconContainer>
      <IconContainer name="RotateIcon">
        <RotateIcon {...props} />
      </IconContainer>
      <IconContainer name="SearchIcon">
        <SearchIcon {...props} />
      </IconContainer>
      <IconContainer name="SettingsIcon">
        <SettingsIcon {...props} />
      </IconContainer>
      <IconContainer name="Spinner">
        <Spinner {...props} />
      </IconContainer>
      <IconContainer name="TableHandleIcon">
        <TableHandleIcon {...props} />
      </IconContainer>
      <IconContainer name="TickIcon">
        <TickIcon {...props} />
      </IconContainer>
      <IconContainer name="TranscriptionIcon">
        <TranscriptionIcon {...props} />
      </IconContainer>
      <IconContainer name="UnlockSmileyIcon">
        <UnlockSmileyIcon {...props} />
      </IconContainer>
    </div>
  );
};
