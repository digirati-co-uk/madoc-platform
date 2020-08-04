import React from 'react';
import { CaptureModelSnippet } from '../../../../../types/schemas/capture-model-snippet';
import { UniversalComponent } from '../../../../types';
import { Link, useHistory } from 'react-router-dom';
import { Button } from '../../../../shared/atoms/Button';
import { useMutation } from 'react-query';
import { useApi } from '../../../../shared/hooks/use-api';
import { Card, CardContent } from '@capture-models/editor';
import { useData } from '../../../../shared/hooks/use-data';
import { createUniversalComponent } from '../../../../shared/utility/create-universal-component';

type CaptureModelListType = {
  data: {
    models: CaptureModelSnippet[];
  };
  params: {};
  query: {};
  variables: {};
};

export const CaptureModelList: UniversalComponent<CaptureModelListType> = createUniversalComponent<
  CaptureModelListType
>(
  () => {
    const { data, refetch } = useData(CaptureModelList);
    const api = useApi();
    const history = useHistory();
    const [createNewModel] = useMutation(async () => {
      const model = await api.createCaptureModel('Untitled model');
      await refetch();
      history.push(`/capture-models/${model.id}`);
    });

    if (!data) {
      return <div>loading...</div>;
    }

    const { models } = data;

    return (
      <>
        <Button onClick={() => createNewModel()}>Create new model</Button>
        {models.map((item: any) => {
          return (
            <Card fluid key={item.id} style={{ margin: '1em 0' }}>
              <CardContent>
                <h3>
                  <Link to={`/capture-models/${item.id}`}>{item.label}</Link>
                </h3>
                <p>Used to crowdsource {item.derivatives} items</p>
              </CardContent>
            </Card>
          );
        })}
      </>
    );
  },
  {
    getKey: () => {
      return ['capture-model-editor', {}];
    },
    async getData(key, data, api) {
      return {
        models: await api.getAllCaptureModels(),
      };
    },
  }
);
