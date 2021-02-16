import React from 'react';
import { useStaticData } from '../../shared/hooks/use-data';
import { PageLoader } from '../pages/loaders/page-loader';

export const PageEditorBar: React.FC = () => {
  const page = useStaticData(PageLoader);

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

  return (
    <div>
      {/*Page editor bar!*/}
      {/*<pre>{JSON.stringify(page.data, null, 2)}</pre>*/}
    </div>
  );
};
