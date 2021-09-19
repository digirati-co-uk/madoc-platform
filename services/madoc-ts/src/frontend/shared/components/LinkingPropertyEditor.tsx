import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery } from 'react-query';
import { ResourceLinkResponse } from '../../../types/schemas/linking';
import { Button } from '../navigation/Button';
import { useApi } from '../hooks/use-api';

export const LinkingPropertyEditor: React.FC<{
  link: ResourceLinkResponse;
  close: () => void;
}> = props => {
  const api = useApi();
  const [value, setValue] = useState('');
  const { t } = useTranslation();

  const [saveFile, { isLoading, error, isSuccess }] = useMutation(async () => {
    if (!props.link.file) {
      return;
    }
    if (props.link.file.path.endsWith('xml')) {
      await api.saveStorageXml(props.link.file.bucket, props.link.file.path, value);
    }
    if (props.link.file.path.endsWith('json')) {
      await api.saveStorageJson(props.link.file.bucket, props.link.file.path, JSON.parse(value));
    }
    props.close();
  });

  const { data: remoteData } = useQuery(['get-storage-json-data', { id: props.link.link.id }], async () => {
    if (props.link.file) {
      if (props.link.file.path.endsWith('json')) {
        const data = await api.getStorageJsonData(props.link.file.bucket, props.link.file.path);
        setValue(JSON.stringify(data, null, 2));
        return data;
      }

      if (props.link.file.path.endsWith('xml')) {
        const data = await api.getStorageXmlData(props.link.file.bucket, props.link.file.path);
        setValue(data);
        return data;
      }
    }
  });

  if (props.link.file) {
    return (
      <div>
        {remoteData ? (
          <textarea style={{ width: '100%' }} rows={20} value={value} onChange={e => setValue(e.currentTarget.value)} />
        ) : null}
        {error ? t('Invalid JSON, please try again') : null}
        {isSuccess ? t('Changes saved') : null} <Button onClick={props.close}>{t('Close')}</Button>
        <Button style={{ marginLeft: 10 }} onClick={() => saveFile()} disabled={isLoading}>
          {t('Save changes')}
        </Button>
      </div>
    );
  }

  return <div>{t('help__unknown_linking_property', { defaultValue: 'External value' })}</div>;
};
