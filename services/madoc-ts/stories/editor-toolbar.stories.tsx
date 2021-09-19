import * as React from 'react';
import { ArrowBackIcon } from '../src/frontend/shared/icons/ArrowBackIcon';
import { EditIcon } from '../src/frontend/shared/icons/EditIcon';
import { DeleteForeverIcon } from '../src/frontend/shared/icons/DeleteForeverIcon';
import { ReadMoreIcon } from '../src/frontend/shared/icons/ReadMoreIcon';
import { CallMergeIcon } from '../src/frontend/shared/icons/CallMergeIcon';
import { GradingIcon } from '../src/frontend/shared/icons/GradingIcon';
import { FullScreenExitIcon } from '../src/frontend/shared/icons/FullScreenExitIcon';
import {
  EditorToolbarButton,
  EditorToolbarContainer,
  EditorToolbarIcon,
  EditorToolbarLabel,
  EditorToolbarSpacer,
  EditorToolbarTitle,
} from '../src/frontend/shared/navigation/EditorToolbar';
import { ModalButton } from '../src/frontend/shared/components/Modal';
import { Heading3 } from '../src/frontend/shared/typography/Heading3';
import { Button, ButtonRow } from '../src/frontend/shared/navigation/Button';
import { TextField } from '@capture-models/editor/lib/input-types/TextField/TextField';
import { Suspense, useState } from 'react';
import { FullScreenEnterIcon } from '../src/frontend/shared/icons/FullScreenEnterIcon';
import { ArrowForwardIcon } from '../src/frontend/shared/icons/ArrowForwardIcon';
import { CompareIcon } from '../src/frontend/shared/icons/CompareIcon';
import { MaximiseWindow } from '../src/frontend/shared/layout/MaximiseWindow';

export default { title: 'Editor toolbar' };

export const ReviewEditor = () => {
  const [change, setChange] = useState('');

  return (
    <div style={{ padding: '1em', maxWidth: 1200, margin: 'auto', height: 600 }}>
      <MaximiseWindow>
        {({ toggle, isOpen }) => (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <EditorToolbarContainer>
              <EditorToolbarButton>
                <EditorToolbarIcon>
                  <ArrowBackIcon />
                </EditorToolbarIcon>
              </EditorToolbarButton>
              <EditorToolbarTitle>Test reviewer</EditorToolbarTitle>

              <EditorToolbarSpacer />

              <EditorToolbarButton>
                <EditorToolbarIcon>
                  <EditIcon />
                </EditorToolbarIcon>
                <EditorToolbarLabel>edit submission</EditorToolbarLabel>
              </EditorToolbarButton>

              <EditorToolbarButton
                as={ModalButton}
                button={true}
                autoHeight={true}
                title="Reject submission"
                render={() => (
                  <div>
                    <strong>Are you sure you want to delete this revision and mark the task as rejected?</strong>
                    <ul>
                      <li>The user will be notified that the revision has been rejected</li>
                      <li>You will no longer be able to see the content in the revision</li>
                    </ul>
                  </div>
                )}
                renderFooter={({ close }) => (
                  <Button style={{ marginLeft: 'auto' }} onClick={close}>
                    Reject changes
                  </Button>
                )}
              >
                <EditorToolbarIcon>
                  <DeleteForeverIcon />
                </EditorToolbarIcon>
                <EditorToolbarLabel>reject submission</EditorToolbarLabel>
              </EditorToolbarButton>

              <EditorToolbarButton
                as={ModalButton}
                button={true}
                autoHeight={true}
                title="Request changes"
                render={() => (
                  <Suspense fallback={<div />}>
                    <label htmlFor="message">Write a message to the contributor</label>
                    <TextField
                      id="message"
                      type="text-field"
                      value={change}
                      label="Write message to the contributor"
                      updateValue={setChange}
                      multiline={true}
                    />
                    <p>Once requested the task will be assigned back to user</p>
                  </Suspense>
                )}
                renderFooter={({ close }) => (
                  <Button style={{ marginLeft: 'auto' }} onClick={close}>
                    Request changes
                  </Button>
                )}
              >
                <EditorToolbarIcon>
                  <ReadMoreIcon />
                </EditorToolbarIcon>
                <EditorToolbarLabel>request changes</EditorToolbarLabel>
              </EditorToolbarButton>

              <EditorToolbarButton
                as={ModalButton}
                button={true}
                autoHeight={true}
                title="Prepare merge"
                render={() => (
                  <div>
                    <div>Base revision</div>
                    <Heading3>Test reviewer</Heading3>

                    <div>Merge the following submissions into the base</div>
                    <ul>
                      <li>
                        <label>
                          <input type="checkbox" checked={true} />
                          User number 2
                        </label>
                      </li>
                      <li>
                        <label>
                          <input type="checkbox" checked={true} />
                          User number 3
                        </label>
                      </li>
                    </ul>
                  </div>
                )}
                renderFooter={({ close }) => (
                  <Button style={{ marginLeft: 'auto' }} onClick={close}>
                    Start merge
                  </Button>
                )}
              >
                <EditorToolbarIcon>
                  <CallMergeIcon />
                </EditorToolbarIcon>
                <EditorToolbarLabel>start merge</EditorToolbarLabel>
              </EditorToolbarButton>

              <EditorToolbarButton
                as={ModalButton}
                button={true}
                autoHeight={true}
                title="Approve submission"
                render={() => (
                  <div>
                    <ul>
                      <li>
                        <strong>Approve</strong> - The submission will be approved and all other submission will remain
                      </li>
                    </ul>
                  </div>
                )}
                renderFooter={({ close }) => (
                  <ButtonRow style={{ margin: '0 0 0 auto' }}>
                    <Button onClick={close}>Approve</Button>
                  </ButtonRow>
                )}
              >
                <EditorToolbarIcon>
                  <GradingIcon />
                </EditorToolbarIcon>
                <EditorToolbarLabel>approve</EditorToolbarLabel>
              </EditorToolbarButton>

              <EditorToolbarButton onClick={toggle}>
                <EditorToolbarIcon>{isOpen ? <FullScreenExitIcon /> : <FullScreenEnterIcon />}</EditorToolbarIcon>
              </EditorToolbarButton>
            </EditorToolbarContainer>
            <div style={{ flex: '1 1 0px', background: '#eee', height: 500 }} />
          </div>
        )}
      </MaximiseWindow>
    </div>
  );
};

export const MergeEditor = () => {
  return (
    <div style={{ padding: '1em', maxWidth: 1200, margin: 'auto', height: 600 }}>
      <MaximiseWindow>
        {({ toggle, isOpen }) => (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <EditorToolbarContainer>
              <EditorToolbarButton>
                <EditorToolbarIcon>
                  <ArrowBackIcon />
                </EditorToolbarIcon>
              </EditorToolbarButton>

              <EditorToolbarTitle>Test reviewer</EditorToolbarTitle>

              <EditorToolbarSpacer />

              <EditorToolbarButton disabled>
                <EditorToolbarIcon>
                  <ArrowBackIcon />
                </EditorToolbarIcon>
              </EditorToolbarButton>
              <EditorToolbarButton
                as={ModalButton}
                button={true}
                autoHeight={true}
                title="Change revision"
                render={() => (
                  <div>
                    <a href="#">Main merge revision</a>

                    <ul>
                      <li>
                        <a href="#">Revision by User A</a>
                      </li>
                      <li>
                        <a href="#">Revision by User B</a>
                      </li>
                    </ul>
                  </div>
                )}
                renderFooter={({ close }) => (
                  <Button style={{ marginLeft: 'auto' }} onClick={close}>
                    Discard changes
                  </Button>
                )}
              >
                <EditorToolbarLabel>Change revision</EditorToolbarLabel>
              </EditorToolbarButton>
              <EditorToolbarButton $rightBorder>
                <EditorToolbarIcon>
                  <ArrowForwardIcon />
                </EditorToolbarIcon>
              </EditorToolbarButton>

              <EditorToolbarSpacer />

              <EditorToolbarButton>
                <EditorToolbarIcon>
                  <CompareIcon />
                </EditorToolbarIcon>
                <EditorToolbarLabel>Diff view</EditorToolbarLabel>
              </EditorToolbarButton>

              <EditorToolbarButton
                as={ModalButton}
                button={true}
                autoHeight={true}
                title="Discard merge"
                render={() => (
                  <div>
                    <strong>Are you sure you want to delete this revision?</strong>
                    <ul>
                      <li>This will not remove the original base revision you started from</li>
                      <li>Any changes you have made will be removed</li>
                    </ul>
                  </div>
                )}
                renderFooter={({ close }) => (
                  <Button style={{ marginLeft: 'auto' }} onClick={close}>
                    Discard changes
                  </Button>
                )}
              >
                <EditorToolbarIcon>
                  <DeleteForeverIcon />
                </EditorToolbarIcon>
                <EditorToolbarLabel>Discard merge</EditorToolbarLabel>
              </EditorToolbarButton>

              <EditorToolbarButton
                as={ModalButton}
                button={true}
                autoHeight={true}
                title="Approve submission"
                render={() => (
                  <div>
                    <ul>
                      <li>All of the revisions in the merge will be marked as approved</li>
                      <li>The new merged revision will be published</li>
                    </ul>
                  </div>
                )}
                renderFooter={({ close }) => (
                  <Button style={{ marginLeft: 'auto' }} onClick={close}>
                    Approve
                  </Button>
                )}
              >
                <EditorToolbarIcon>
                  <GradingIcon />
                </EditorToolbarIcon>
                <EditorToolbarLabel>Publish merge</EditorToolbarLabel>
              </EditorToolbarButton>

              <EditorToolbarButton onClick={toggle}>
                <EditorToolbarIcon>{isOpen ? <FullScreenExitIcon /> : <FullScreenEnterIcon />}</EditorToolbarIcon>
              </EditorToolbarButton>
            </EditorToolbarContainer>
            <div style={{ flex: '1 1 0px', background: '#eee', height: 500 }} />
          </div>
        )}
      </MaximiseWindow>
    </div>
  );
};
