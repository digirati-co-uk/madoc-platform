import React, { useContext } from 'react';
import { PluginContext } from '../../../plugin-api/context';
import { SelectorSpecification } from '../../../types/selector-types';
import { Button } from '../../atoms/Button';
import { Card, CardContent, CardHeader } from '../../atoms/Card';
import { Tag } from '../../atoms/Tag';
import { useTranslation } from 'react-i18next';

export const ChooseSelector: React.FC<{
  handleChoice: (choice: SelectorSpecification) => void;
}> = ({ handleChoice }) => {
  const { t } = useTranslation();
  const { selectors } = useContext(PluginContext);

  return (
    <div>
      <h2>{t('Choose selector')}</h2>
      <ul>
        {Object.values(selectors).map(field =>
          field ? (
            <Card style={{ marginBottom: 20 }}>
              <CardContent>
                <CardHeader>{field.label}</CardHeader>
                <p>{field.description}</p>
              </CardContent>
              <CardContent extra>
                {t('Supported content types')}
                <div>
                  {field.supportedContentTypes.map(type => (
                    <Tag key={type}>{type}</Tag>
                  ))}
                </div>
              </CardContent>
              <Button onClick={() => handleChoice(field as any)}>
                {t('Create {{label}}', { label: field.label })}
              </Button>
            </Card>
          ) : null
        )}
      </ul>
    </div>
  );
};
