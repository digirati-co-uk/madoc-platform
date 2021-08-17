import React from 'react';
import { useTranslation } from 'react-i18next';
import { Redirect } from 'react-router-dom';
import { Pm2Status } from '../../../../types/pm2';
import { Statistic, StatisticContainer, StatisticLabel, StatisticNumber } from '../../../shared/atoms/Statistics';
import { WidePage } from '../../../shared/atoms/WidePage';
import { useData } from '../../../shared/hooks/use-data';
import { useUser } from '../../../shared/hooks/use-site';
import { createUniversalComponent } from '../../../shared/utility/create-universal-component';
import { UniversalComponent } from '../../../types';
import { AdminHeader } from '../../molecules/AdminHeader';

type SystemStatusType = {
  data: { list: Pm2Status[] };
  query: {};
  params: {};
  variables: {};
};

export const SystemStatus: UniversalComponent<SystemStatusType> = createUniversalComponent<SystemStatusType>(
  () => {
    const user = useUser();

    if (user?.role !== 'global_admin') {
      return <Redirect to={'/'} />;
    }

    const { t } = useTranslation();
    const { data } = useData(SystemStatus, undefined, {
      refetchInterval: 1000,
    });

    const { memory, cpu } = data
      ? data.list.reduce(
          (state, next) => {
            return {
              memory: state.memory + next.monit.memory,
              cpu: state.cpu + next.monit.cpu,
            };
          },
          { memory: 0, cpu: 0 }
        )
      : { memory: 0, cpu: 0 };

    return (
      <>
        <AdminHeader title={t('System status')} breadcrumbs={[{ label: 'Site admin', link: '/' }]} />

        <StatisticContainer>
          <Statistic>
            <StatisticNumber>{Math.round(memory / 1000 / 10) / 100}mb</StatisticNumber>
            <StatisticLabel>Memory</StatisticLabel>
          </Statistic>
          <Statistic>
            <StatisticNumber>{cpu.toFixed(2)}%</StatisticNumber>
            <StatisticLabel>CPU</StatisticLabel>
          </Statistic>
        </StatisticContainer>

        <WidePage>
          {data
            ? data.list.map(item => {
                return (
                  <div key={item.id}>
                    <h3>{item.name}</h3>
                    <div>
                      <strong>Status</strong> <span>{item.status}</span>
                    </div>
                    <div>
                      <strong>Instances</strong> <span>{item.instances}</span>
                    </div>
                    <div>
                      <strong>CPU</strong> <span>{item.monit.cpu}%</span>
                    </div>
                    <div>
                      <strong>Memory</strong> <span>{Math.round(item.monit.memory / 1000 / 10) / 100}mb</span>
                    </div>
                  </div>
                );
              })
            : null}
        </WidePage>
      </>
    );
  },
  {
    async getData(key, vars, api) {
      return await api.getPm2Status();
    },
    getKey(params, query) {
      return ['pm2-status', {}];
    },
  }
);
