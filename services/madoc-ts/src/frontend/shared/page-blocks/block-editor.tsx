import { defaultTheme, Revisions } from '@capture-models/editor';
import { captureModelShorthand, hydrateCompressedModel, serialiseCaptureModel } from '@capture-models/helpers';
import { CaptureModel } from '@capture-models/types';
import React, { PropsWithChildren, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import styled, { ThemeProvider } from 'styled-components';
import { PageBlockDefinition, PageBlockEditor } from '../../../extensions/page-blocks/extension';
import { EditorialContext, SiteBlock, SiteBlockRequest } from '../../../types/schemas/site-page';
import { Button, ButtonRow, TinyButton } from '../atoms/Button';
import { EditorSlots } from '../caputre-models/new/components/EditorSlots';
import { RevisionProviderWithFeatures } from '../caputre-models/new/components/RevisionProviderWithFeatures';
import { ModalButton } from '../components/Modal';
import { useApi } from '../hooks/use-api';
import { createRevisionFromDocument } from '../utility/create-revision-from-document';
import { RenderBlock } from './render-block';

const EditBlock = styled(TinyButton)`
  opacity: 0;
  position: absolute;
  top: 0;
  right: 0;
  transition: opacity 0.2s;
`;

const BlockWrapper = styled.div`
  transition: outline 0.2s;
  outline: 3px solid transparent;
  &:hover {
    outline: 3px solid rgba(0, 0, 0, 0.2);
    ${EditBlock} {
      opacity: 1;
    }
  }
  display: inline-block;
  position: relative;
`;

export function modelToBlock(
  model: CaptureModel['document'],
  block: SiteBlock | SiteBlockRequest,
  advanced?: boolean
): SiteBlock | SiteBlockRequest {
  const {
    RESERVED__i18n__fallback,
    RESERVED__i18n__languages,
    RESERVED__i18n__sortKey,
    RESERVED__name,
    ...staticData
  } = serialiseCaptureModel(model) as {
    RESERVED__name: string;
    RESERVED__i18n__languages?: string[];
    RESERVED__i18n__sortKey?: string;
    RESERVED__i18n__fallback?: string;
    [key: string]: any;
  };

  const newBlock: SiteBlock | SiteBlockRequest = {
    ...block,
    name: RESERVED__name,
    static_data: staticData,
  };

  if (advanced) {
    if (RESERVED__i18n__languages && RESERVED__i18n__languages.length) {
      const languagesToAdd = RESERVED__i18n__languages.filter(language => language !== 'none');
      if (languagesToAdd.length) {
        newBlock.i18n = newBlock.i18n ? newBlock.i18n : { languages: [] };
        newBlock.i18n.languages = languagesToAdd;
      }
    }
  }
  if (RESERVED__i18n__sortKey) {
    newBlock.i18n = newBlock.i18n ? newBlock.i18n : { languages: [] };
    newBlock.i18n.sortKey = RESERVED__i18n__sortKey;
  }
  if (RESERVED__i18n__fallback) {
    newBlock.i18n = newBlock.i18n ? newBlock.i18n : { languages: [] };
    newBlock.i18n.fallback = true;
  }

  return newBlock;
}

export function useBlockModel(block: SiteBlock | SiteBlockRequest, advanced?: boolean) {
  const { t } = useTranslation();
  const api = useApi();

  const definition: PageBlockDefinition<any, any, any, any> | undefined = useMemo(() => {
    return api.pageBlocks.definitionMap[block.type];
  }, [api.pageBlocks.definitionMap, block.type]);

  const defaultFields = useMemo<CaptureModel['document']>(() => {
    const defaultProps = {
      RESERVED__name: {
        label: t('Name (optional)'),
        description: t('If you would like to find this block later, give it a name'),
        type: 'text-field',
      },
    };

    const advancedProps = {
      ...defaultProps,
      RESERVED__i18n__languages: {
        label: t('Language'),
        type: 'dropdown-field',
        options: [
          { value: 'none', text: 'None' },
          { value: 'en', text: 'English' },
          { value: 'cy', text: 'Welsh' },
        ],
        description: t('Add language that this should be rendered on'),
        pluralLabel: t('Languages'),
        allowMultiple: true,
      },
      RESERVED__i18n__sortKey: {
        label: t('Language sort key'),
        type: 'text-field',
        description: t(
          'If you have multiple blocks using a language you can group them together with this key. Only one of these blocks will be displayed, based on the language.'
        ),
      },
      RESERVED__i18n__fallback: {
        label: t('Language default block'),
        description: t(
          'If you have chosen a sort key, this will be the default block for that key if no suitable language is found'
        ),
        type: 'checkbox-field',
        inlineLabel: t('Render when no other blocks are available'),
      },
    };

    if (advanced) {
      return captureModelShorthand(advancedProps);
    }

    return captureModelShorthand(defaultProps);
  }, [t, advanced]);

  const value = useMemo(() => {
    return {
      RESERVED__name: block.name,
      RESERVED__i18n__languages: block.i18n?.languages || ['none'],
      RESERVED__i18n__sortKey: block.i18n?.sortKey || '',
      RESERVED__i18n__fallback: block.i18n?.fallback || false,
      ...(definition.defaultData || {}),
      ...block.static_data,
    };
  }, [block.i18n, block.name, block.static_data]);

  return useMemo(() => {
    if (!value) {
      return undefined;
    }
    const properties = {
      ...(definition ? definition.model.properties : {}),
      ...defaultFields.properties,
    };

    const meta: any = {};
    for (const prop of Object.keys(properties)) {
      meta[prop] = properties[prop][0];
    }

    const document = hydrateCompressedModel({
      __meta__: meta,
      ...value,
    });

    return createRevisionFromDocument(document);
  }, [value, definition, defaultFields]);
}

const OnChangeDocument: React.FC<{ onChange: (revision: CaptureModel['document']) => void }> = ({ onChange }) => {
  const currentRevision = Revisions.useStoreState(s => s.currentRevision);
  const document = currentRevision?.document;

  useEffect(() => {
    if (document) {
      onChange(document);
    }
  }, [onChange, document, currentRevision]);

  return null;
};

export const useBlockEditor = (
  block: SiteBlock | SiteBlockRequest,
  onChange?: (block: SiteBlock | SiteBlockRequest) => void,
  onSave?: (id: number) => void
) => {
  const api = useApi();
  // @todo hook up advanced fields for languages.
  const [advanced, setAdvanced] = useState(false);
  const latestRevision = useRef<CaptureModel['document'] | undefined>();
  const latestPreview = useRef<CaptureModel['document'] | undefined>();
  const [preview, setPreview] = useState<SiteBlock | SiteBlockRequest | undefined>();

  useEffect(() => {
    const id = setInterval(() => {
      if (latestRevision.current && latestRevision.current !== latestPreview.current) {
        latestPreview.current = latestRevision.current;

        setPreview(modelToBlock(latestRevision.current, block, advanced));
      }
    }, 500);

    return () => {
      clearInterval(id);
    };
  }, [block]);

  const saveChanges = async (): Promise<SiteBlock | undefined> => {
    const newData = latestRevision.current;

    if (!newData) {
      return;
    }

    const newBlock = modelToBlock(newData, block, advanced);
    const id = (newBlock as SiteBlock).id;

    const savedBlock = id ? await api.pageBlocks.updateBlock(id, newBlock) : await api.pageBlocks.createBlock(newBlock);
    if (onSave) {
      onSave(savedBlock.id);
    }
    return savedBlock;
  };

  const revision = useBlockModel(block, advanced);

  const editor = revision ? (
    <ThemeProvider
      theme={{
        ...defaultTheme,
        card: {
          ...defaultTheme.card,
          shadow: 'none',
          large: {
            padding: '0px',
            radius: '0',
            margin: '0',
          },
        },
      }}
    >
      <RevisionProviderWithFeatures
        captureModel={revision.model}
        initialRevision={revision.revisionId}
        slotConfig={{ editor: { allowEditing: true } }}
      >
        <OnChangeDocument
          onChange={newRevision => {
            latestRevision.current = newRevision;
            if (onChange) {
              onChange(modelToBlock(newRevision, block, advanced));
            }
          }}
        />
        <EditorSlots.TopLevelEditor />
      </RevisionProviderWithFeatures>
    </ThemeProvider>
  ) : null;

  return {
    editor,
    preview,
    saveChanges,
    setAdvanced,
  };
};

const BlockEditorForm: React.FC<{
  block: SiteBlock;
  context?: EditorialContext;
  onUpdateBlock?: (id: number) => void;
}> = ({ block, context, onUpdateBlock }) => {
  const { editor, preview, saveChanges } = useBlockEditor(block, undefined, onUpdateBlock);

  return (
    <ModalButton
      as={EditBlock}
      title={`Edit block: ${block.name}`}
      modalSize={'md'}
      onClose={async () => {
        await saveChanges();
      }}
      render={() => (
        <>
          {preview ? (
            <div style={{ padding: '1em' }}>
              <RenderBlock block={preview} context={context} />
            </div>
          ) : null}
          {editor}
        </>
      )}
      renderFooter={(footer: any) => (
        <div>
          <ButtonRow style={{ margin: '0 0 0 auto' }}>
            <Button
              onClick={() => {
                // On save!
                saveChanges().then(() => {
                  footer.close();
                });
              }}
            >
              Save
            </Button>
          </ButtonRow>
        </div>
      )}
    >
      Edit
    </ModalButton>
  );
};

function useBlockDetails(block: SiteBlock | SiteBlockRequest) {
  const api = useApi();

  const customEditor = useMemo(() => {
    const definition = api.pageBlocks.definitionMap[block.type];
    if (definition.customEditor) {
      return definition.customEditor;
    }
  }, [api.pageBlocks.definitionMap, block.type]);

  return { CustomEditor: customEditor };
}

function CustomEditorWrapper({
  editor: CustomEditor,
  block,
  onUpdateBlock,
  children,
}: PropsWithChildren<{
  editor: PageBlockEditor;
  block: SiteBlockRequest | SiteBlock;
  onUpdateBlock?: (id: number) => void;
}>) {
  const api = useApi();
  const [onSave] = useMutation(async (newBlock: SiteBlock | SiteBlockRequest) => {
    const id = (newBlock as SiteBlock).id;

    const savedBlock = id ? await api.pageBlocks.updateBlock(id, newBlock) : await api.pageBlocks.createBlock(newBlock);

    if (onUpdateBlock) {
      onUpdateBlock(savedBlock.id);
    }
  });

  return (
    <CustomEditor
      onChange={blk => {
        console.log('changed', blk);
      }}
      block={block as SiteBlock}
      onSave={blk => {
        onSave(blk);
      }}
      preview={children}
    />
  );
}

export const BlockEditor: React.FC<{
  block: SiteBlock;
  context?: EditorialContext;
  onUpdateBlock?: (id: number) => void;
}> = ({ block, context, children, onUpdateBlock }) => {
  const { CustomEditor } = useBlockDetails(block);

  return (
    <BlockWrapper>
      {CustomEditor ? (
        <CustomEditorWrapper editor={CustomEditor} block={block} onUpdateBlock={onUpdateBlock}>
          {children}
        </CustomEditorWrapper>
      ) : (
        <>
          <BlockEditorForm block={block} context={context} onUpdateBlock={onUpdateBlock} />
          {children}
        </>
      )}
    </BlockWrapper>
  );
};
