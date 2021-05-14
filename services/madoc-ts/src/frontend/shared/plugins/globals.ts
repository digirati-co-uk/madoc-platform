import { useCollectionList } from '../../site/hooks/use-collection-list';
import { Button } from '../atoms/Button';
import { LocaleString } from '../components/LocaleString';
import { useApi } from '../hooks/use-api';
import { blockConfigFor } from './external/block-config-for';
import { serverRendererFor } from './external/server-renderer-for';
import { atoms, useAtoms } from './use-atoms';
import { useComponents } from './use-components';
import { useModule } from './use-module';

const Madoc = {
  require: useModule,
  useApi,
  Atoms: atoms,
  Button: Button,
  LocaleString,
  useAtoms,
  useComponents,
  useCollectionList,
  blockConfigFor,
  serverRendererFor,
};

// @ts-ignore
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.Madoc = Madoc;
} else {
  // @ts-ignore
  global.Madoc = Madoc;
}
