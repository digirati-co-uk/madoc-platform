import React from 'react';
import { Button, ButtonRow } from '../../shared/atoms/Button';
import {
  PageEditorActions,
  PageEditorButton,
  PageEditorContainer,
  PageEditorDescription,
  PageEditorTitle,
} from '../../shared/atoms/PageEditor';
import { LocaleString } from '../../shared/components/LocaleString';
import { ModalButton } from '../../shared/components/Modal';
import { useStaticData } from '../../shared/hooks/use-data';
import { PageLoader } from '../pages/loaders/page-loader';

export const PageEditorBar: React.FC<{
  isEditing: boolean;
  onEdit: () => void;
}> = ({ isEditing, onEdit }) => {
  const { data } = useStaticData(PageLoader);

  // Data
  // - The page name + description
  // - Who created it
  // - Navigation options (root / hide)
  // - Configured slot names
  // - Searchable?
  // - Parent page
  //
  // Actions
  // - Add sub-page
  // - Remove page
  // - Edit metadata
  // - Edit navigation options
  // - Choose layout
  //
  // Modals / forms
  // - Add subpage
  // - Edit page details (inline form)
  // - Change layout
  // - Navigation options
  // - Delete confirmation
  // - Add block [done]
  // - Change slot layout
  // - Advanced slot options
  // - Reuse existing slot
  // - View original slot (followed by reset)
  //
  // API calls
  // - Create new page
  // - Create new slot
  // - Update page
  // - Update slot
  // - Delete page
  // - Delete slot

  if (!data) {
    return null;
  }

  const page = data.page;

  return (
    <div>
      {/*Page editor bar!*/}
      {/*<pre>{JSON.stringify(page.data, null, 2)}</pre>*/}
      <PageEditorContainer>
        <LocaleString as={PageEditorTitle}>{page.title}</LocaleString>
        <LocaleString as={PageEditorDescription}>{page.description}</LocaleString>
        {page.parentPage ? <PageEditorDescription>Parent page: {page.parentPage}</PageEditorDescription> : null}
        <PageEditorActions>
          <PageEditorButton>Add subpage</PageEditorButton>
          <PageEditorButton onClick={onEdit}>{isEditing ? 'Finish editing' : 'Edit page'}</PageEditorButton>
          <PageEditorButton>Change layout</PageEditorButton>
          <PageEditorButton>Navigation options</PageEditorButton>
          <ModalButton
            as={PageEditorButton}
            title="Are you sure you want to delete this page?"
            render={() => <div>Cannot be removed</div>}
            footerAlignRight
            renderFooter={({ close }) => {
              return (
                <ButtonRow $noMargin>
                  <PageEditorButton onClick={close}>Cancel</PageEditorButton>
                  <Button onClick={close}>Remove</Button>
                </ButtonRow>
              );
            }}
          >
            Delete page
          </ModalButton>
        </PageEditorActions>
      </PageEditorContainer>
    </div>
  );
};
