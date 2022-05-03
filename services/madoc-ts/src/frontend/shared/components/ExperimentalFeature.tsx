import React from 'react';
import { useTranslation } from 'react-i18next';
import { ExperimentalMessage } from '../callouts/ExperimentalMessage';
import { ExperimentalIcon } from '../icons/ExperimentalIcon';
import { Button } from '../navigation/Button';

export function ExperimentalFeature(props: { feature: string; discussion?: number }) {
  const { t } = useTranslation();
  return (
    <ExperimentalMessage $banner $margin>
      <ExperimentalIcon style={{ fontSize: '1.2em' }} />
      {t('{{feature}} is an experimental feature', { feature: t(props.feature) })}
      {props.discussion ? (
        <Button
          style={{ marginLeft: '1em' }}
          as="a"
          href={`https://github.com/digirati-co-uk/madoc-platform/discussions/${props.discussion}`}
          target="_blank"
          rel="nofollow noreferrer noopener"
        >
          {t('Leave feedback')}
        </Button>
      ) : null}
    </ExperimentalMessage>
  );
}
