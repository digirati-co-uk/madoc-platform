import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { SiteBlock } from '../../../types/schemas/site-page';
import { ModalButton } from '../components/Modal';
import { Input, InputContainer, InputLabel } from '../form/Input';
import { useApi } from '../hooks/use-api';
import { useDetailedSupportLocales } from '../hooks/use-site';
import { Button } from '../navigation/Button';

export const Pill = styled.div`
  border-radius: 3px;
  width: auto;
  background-color: #ecf0ff;
  color: #437bdd;
  margin-right: 1em;
  font-size: 12px;
  padding: 5px;
`;

export function LanguageEditorModal({
  block,
  onUpdateBlock,
  close,
}: {
  block: SiteBlock;
  onUpdateBlock?: (id: number) => void;
  close: () => void;
}) {
  const { i18n } = useTranslation();
  const [enabled, setEnabled] = React.useState(!!block.i18n);
  const api = useApi();
  const [language, setLanguage] = React.useState<string>(block?.i18n?.languages[0] || i18n.language);
  const supported = useDetailedSupportLocales();
  const [fallback, setFallback] = React.useState(block?.i18n?.fallback || false);
  const [sortKey, setSortKey] = useState(block?.i18n?.sortKey || `${block.type}-${block.id}`);

  const saveChanges = async (): Promise<void> => {
    const i18nRequest = enabled
      ? {
          languages: [language],
          fallback,
          sortKey,
        }
      : undefined;
    const newBlock = { ...block, i18n: i18nRequest };

    const savedBlock = await api.pageBlocks.updateBlock(block.id, newBlock);
    if (onUpdateBlock) {
      onUpdateBlock(savedBlock.id);
    }
    close();
  };

  return (
    <div>
      <InputContainer>
        <InputLabel>
          <Input
            style={{ marginRight: 10 }}
            type="checkbox"
            checked={enabled}
            onChange={e => setEnabled(e.currentTarget.checked)}
          />
          <span>Enable language customisations</span>
        </InputLabel>
      </InputContainer>

      {enabled ? (
        <>
          <InputContainer>
            <InputLabel htmlFor="lang-key">Language sort key</InputLabel>
            <Input type="text" id="lang-key" value={sortKey} onChange={e => setSortKey(e.currentTarget.value)} />
          </InputContainer>

          <InputContainer>
            <InputLabel>Language</InputLabel>
            {supported.map(lang => {
              return (
                <div key={lang.code}>
                  <InputLabel style={{ fontSize: '0.9em' }}>
                    <input
                      type="radio"
                      name="language"
                      checked={language === lang.code}
                      onChange={() => setLanguage(lang.code)}
                      style={{ marginRight: 10 }}
                    />
                    {lang.label} ({lang.code})
                  </InputLabel>
                </div>
              );
            })}
          </InputContainer>

          <InputContainer>
            <InputLabel>
              <Input
                style={{ marginRight: 10 }}
                type="checkbox"
                checked={fallback}
                onChange={e => setFallback(e.currentTarget.checked)}
              />
              <span>Use as fallback</span>
            </InputLabel>
          </InputContainer>
        </>
      ) : null}

      <Button $primary onClick={saveChanges}>
        Save changes
      </Button>
    </div>
  );
}

export function BlockLanguageEditor({
  block,
  onUpdateBlock,
}: {
  block: SiteBlock;
  onUpdateBlock?: (id: number) => void;
}) {
  return (
    <>
      {(block.i18n?.languages.length || 0) > 0 ? (
        <ModalButton
          title="Language options"
          render={opts => <LanguageEditorModal block={block} onUpdateBlock={onUpdateBlock} {...opts} />}
        >
          <Pill style={{ cursor: 'pointer' }}>{block.i18n?.languages.join(',')}</Pill>
        </ModalButton>
      ) : (
        <ModalButton
          title="Language options"
          render={opts => <LanguageEditorModal block={block} onUpdateBlock={onUpdateBlock} {...opts} />}
        >
          <Pill style={{ cursor: 'pointer' }}>set language</Pill>
        </ModalButton>
      )}
    </>
  );
}
