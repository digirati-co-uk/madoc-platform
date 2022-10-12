import styled from 'styled-components';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-react';

export const FlexSpacer = styled.div`
  flex: 1 1 0px;
  height: 50px;
`;

blockEditorFor(FlexSpacer, {
  type: 'default.FlexSpacer',
  label: 'Spacer',
  editor: {},
});
