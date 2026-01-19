import React, { PropsWithChildren, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import styled, { ThemeProvider } from 'styled-components';
import { PageBlockDefinition, PageBlockEditor } from '../../../extensions/page-blocks/extension';
import { EditorialContext, SiteBlock, SiteBlockRequest } from '../../../types/schemas/site-page';
import { Revisions } from '../capture-models/editor/stores/revisions';
import { defaultTheme } from '../capture-models/editor/themes';
import { captureModelShorthand } from '../capture-models/helpers/capture-model-shorthand';
import { hydrateCompressedModel } from '../capture-models/helpers/hydrate-compressed-model';
import { serialiseCaptureModel } from '../capture-models/helpers/serialise-capture-model';
import { CaptureModel } from '../capture-models/types/capture-model';
import { Button, ButtonRow, TinyButton } from '../navigation/Button';
import { EditorSlots } from '../capture-models/new/components/EditorSlots';
import { RevisionProviderWithFeatures } from '../capture-models/new/components/RevisionProviderWithFeatures';
import { ModalButton } from '../components/Modal';
import { useApi } from '../hooks/use-api';
import { useSite } from '../hooks/use-site';
import { createRevisionFromDocument } from '../utility/create-revision-from-document';
import { ErrorBoundary } from '../utility/error-boundary';
import { CustomEditorTypes } from './custom-editor-types';
import { RenderBlock } from './render-block';
import { BlockCreatorPreview } from './AddBlock';
import { isRequiredDocIncomplete } from '../capture-models/utility/is-required-field-incomplete';

const EditBlock = styled(TinyButton)`
  opacity: 0;
  position: absolute;
  top: 0.2em;
  right: 0.2em;
  transition: opacity 0.2s;
`;

const BlockLabel = styled.div`
  position: absolute;
  top: 0.2em;
  left: 0.2em;
  background: #333;
  color: #fff;
  font-size: 0.7em;
  padding: 0.4em;
  z-index: 15; // should be above most things.
  transition: opacity 0.2s;
  &:hover {
    opacity: 0;
  }
`;

const BlockWrapper = styled.div`
  min-height: 2.5em;
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
  padding: 2em;
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
  const site = useSite();

  const definition: PageBlockDefinition<any, any, any, any> | undefined = useMemo(() => {
    return api.pageBlocks.getDefinition(block.type, site.id);
  }, [site.id, api.pageBlocks.definitionMap, api.pageBlocks.pluginDefinitions, block.type]);

  if (!definition) {
    throw new Error(`Page block type ${block.type} not found`);
  }

  const defaultFields = useMemo<CaptureModel['document']>(() => {
    const defaultProps = {
      // @todo Leave this one out for now.
      // RESERVED__name: {
      //   label: t('Name (optional)'),
      //   description: t('If you would like to find this block later, give it a name'),
      //   type: 'text-field',
      // },
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
          'If you have multiple blocks using a language group them together with this key. Only one of these blocks will be displayed, based on the language.'
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
  }, [block.i18n, block.name, block.static_data, definition.defaultData]);

  return useMemo(() => {
    if (!value) {
      return { revision: undefined, isEmpty: true };
    }

    const properties = {
      ...(definition && definition.model ? definition.model.properties : {}),
      ...defaultFields.properties,
    };

    const meta: any = {};
    const propKeys = Object.keys(properties);
    for (const prop of propKeys) {
      meta[prop] = properties[prop][0];
    }

    const document = hydrateCompressedModel({
      __meta__: meta,
      ...value,
    });

    const revision = createRevisionFromDocument(document);

    return { revision, isEmpty: propKeys.length === 0 };
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
  onChange?: (b: SiteBlock | SiteBlockRequest) => void,
  onSave?: (id: number) => void
) => {
  const api = useApi();
  // @todo hook up advanced fields for languages.
  const [advanced, setAdvanced] = useState(false);
  const latestRevision = useRef<CaptureModel['document'] | undefined>();
  const latestPreview = useRef<CaptureModel['document'] | undefined>();
  const [preview, setPreview] = useState<SiteBlock | SiteBlockRequest | undefined>();

  const canSubmit = isRequiredDocIncomplete(latestRevision.current);

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
  }, [advanced, block]);

  const saveChanges = async (): Promise<SiteBlock | undefined> => {
    const newData = latestRevision.current;

    const newBlock = newData ? modelToBlock(newData, block, advanced) : block;
    const id = (newBlock as SiteBlock).id;

    const savedBlock = id ? await api.pageBlocks.updateBlock(id, newBlock) : await api.pageBlocks.createBlock(newBlock);
    if (onSave) {
      onSave(savedBlock.id);
    }
    return savedBlock;
  };

  const { revision, isEmpty } = useBlockModel(block, advanced);

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
        features={{
          autoSelectingRevision: true,
          autosave: false,
          translationNamespace: 'madoc',
        }}
      >
        <OnChangeDocument
          onChange={newRevision => {
            latestRevision.current = newRevision;
            if (onChange) {
              onChange(modelToBlock(newRevision, block, advanced));
            }
          }}
        />
        <div style={{ fontSize: '0.85em', maxWidth: 550, margin: '0 auto' }}>
          <EditorSlots.TopLevelEditor />
        </div>
      </RevisionProviderWithFeatures>
    </ThemeProvider>
  ) : null;

  return {
    editor,
    preview,
    saveChanges,
    setAdvanced,
    isEmpty,
    canSubmit,
  };
};

export const BlockEditorForm: React.FC<{
  block: SiteBlock;
  context?: EditorialContext;
  onUpdateBlock?: (id: number) => void;
  as?: any;
}> = ({ as, block, context, onUpdateBlock }) => {
  const { editor, preview, saveChanges, isEmpty, canSubmit } = useBlockEditor(block, undefined, onUpdateBlock);

  if (isEmpty) {
    return null;
  }

  return (
    <ModalButton
      as={as ? as : EditBlock}
      style={{ zIndex: 20 }}
      title={`Edit block: ${block.name}`}
      modalSize={'lg'}
      onClose={async () => {
        await saveChanges();
      }}
      render={() => (
        <div style={{ paddingBottom: '10em' }}>
          {preview ? (
            <BlockCreatorPreview>
              <RenderBlock block={preview} context={context} />
            </BlockCreatorPreview>
          ) : null}
          {editor}
        </div>
      )}
      renderFooter={(footer: any) => (
        <div>
          <ButtonRow style={{ margin: '0 0 0 auto' }}>
            <Button
              disabled={!canSubmit}
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

export function useBlockDetails(block: SiteBlock | SiteBlockRequest) {
  const api = useApi();
  const site = useSite();

  return useMemo(() => {
    const definition = api.pageBlocks.getDefinition(block.type, site.id);
    const customEditor = definition.customEditor ? definition.customEditor : undefined;

    return { CustomEditor: customEditor, label: definition?.label };
  }, [api.pageBlocks, block.type, site.id]);
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
        // no-op
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
    <CustomEditorTypes>
      <BlockWrapper>
        <ErrorBoundary>
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
        </ErrorBoundary>
      </BlockWrapper>
    </CustomEditorTypes>
  );
};
