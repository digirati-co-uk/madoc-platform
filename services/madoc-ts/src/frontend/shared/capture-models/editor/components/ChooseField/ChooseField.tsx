import React, { useContext } from 'react';
import { PluginContext } from '../../../plugin-api/context';
import { BaseField } from '../../../types/field-types';
import { Button } from '../../atoms/Button';
import { Card, CardContent } from '../../atoms/Card';
import { Grid, GridColumn, GridRow } from '../../atoms/Grid';
import { useTranslation } from 'react-i18next';

export const ChooseField: React.FC<{
  handleChoice: (choice: BaseField) => void;
}> = ({ handleChoice }) => {
  const { t } = useTranslation();
  const { fields } = useContext(PluginContext);

  return (
    <div style={{ width: '100%' }}>
      <h2>Choose field</h2>
      <Grid>
        <GridRow>
          {Object.values(fields).map(field =>
            field ? (
              <GridColumn half>
                <Card style={{ marginBottom: 20 }}>
                  <CardContent>
                    <h4>{field.label}</h4>
                    <p>{field.description}</p>
                  </CardContent>
                  <Button onClick={() => handleChoice(field as any)}>
                    {t('Create {{label}}', { label: field.label })}
                  </Button>
                </Card>
              </GridColumn>
            ) : null
          )}
        </GridRow>
      </Grid>
    </div>
  );
};
