import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  PageEditorActions,
  PageEditorButton,
  PageEditorContainer,
  PageEditorDescription,
  PageEditorTitle,
} from '../../shared/page-blocks/PageEditor';
import { SuccessMessage } from '../../shared/callouts/SuccessMessage';
import { LocaleString } from '../../shared/components/LocaleString';
import { useStaticData } from '../../shared/hooks/use-data';
import { HrefLink } from '../../shared/utility/href-link';
import { PageLoader } from '../pages/loaders/page-loader';
import { AddSubpageButton } from './AddSubpageButton';
import { DeletePageButton } from './DeletePageButton';
import { EditPageLayoutButton } from './EditPageLayoutButton';
import { EditPageMetadataButton } from './EditPageMetadataButton';

export const PageEditorBar: React.FC<{
  isEditing: boolean;
  onEdit: () => void;
}> = ({ isEditing, onEdit }) => {
  const { data, refetch } = useStaticData(PageLoader);
  const page = data?.page;
  const [message, setMessage] = useState<any>();
  const history = useHistory();

  // Data
  // - The page name + description
  // - Who created it
  // - Navigation options (root / hide)
  // - Configured slot names
  // - Searchable?
  // - Parent page
  //
  // Actions
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

  if (!page) {
    return null;
  }

  return (
    <div>
      {message ? <SuccessMessage>{message}</SuccessMessage> : null}

      <PageEditorContainer>
        <LocaleString as={PageEditorTitle}>{page.title}</LocaleString>
        <LocaleString as={PageEditorDescription}>{page.description}</LocaleString>
        {page.parentPage ? <PageEditorDescription>Parent page: {page.parentPage}</PageEditorDescription> : null}
        <PageEditorActions>
          <AddSubpageButton
            onCreate={newPage => {
              refetch();
              setMessage(
                <div>
                  Created page, <HrefLink href={newPage.path}>Go to page</HrefLink>
                </div>
              );
            }}
          />
          <PageEditorButton onClick={onEdit}>{isEditing ? 'Finish editing' : 'Edit page'}</PageEditorButton>
          <EditPageMetadataButton
            onUpdate={newPage => {
              if (newPage.path !== page.path) {
                history.replace(newPage.path);
              } else {
                refetch();
              }
            }}
          />
          <EditPageLayoutButton onUpdate={() => refetch()} />
          {/*<PageEditorButton>Navigation options</PageEditorButton>*/}
          <DeletePageButton />
        </PageEditorActions>
      </PageEditorContainer>
    </div>
  );
};
