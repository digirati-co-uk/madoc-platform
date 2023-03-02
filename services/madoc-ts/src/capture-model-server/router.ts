import { RouteWithParams, TypedRouter } from '../utility/typed-router';
import { modelApiMigrationStart } from './migration/model-api-migration-start';
import { captureModelApi } from './routes/capture-model';
import { captureModelExport } from './routes/capture-model-export';
import { captureModelListApi } from './routes/caputre-model-list';
import { choiceRevisionApi } from './routes/choice-revision';
import { cloneCaptureModel } from './routes/clone-capture-model';
import { cloneRevisionApi } from './routes/clone-revision';
import { createCaptureModelApi } from './routes/create-capture-model';
import { createRevisionApi } from './routes/create-revision';
import { deleteCaptureModelApi } from './routes/delete-capture-model';
import { deleteRevisionApi } from './routes/delete-revision';
import { forkRevisionApi } from './routes/fork-revision';
import { modelApiMigration } from './migration/model-api-migration';
import { revisionApi } from './routes/revision';
import { revisionListApi } from './routes/revision-list';
import { revisionTemplate } from './routes/revision-template';
import { searchPublished } from './routes/search-published';
import { updateCaptureModelApi } from './routes/update-capture-model';
import { updateRevisionApi } from './routes/update-revision';

export const router: Record<keyof any, RouteWithParams<any>> = {
  'list-capture-models': [TypedRouter.GET, '/api/madoc/crowdsourcing/model', captureModelListApi],
  'capture-model': [TypedRouter.GET, '/api/madoc/crowdsourcing/model/:id', captureModelApi],
  'capture-model-export': [TypedRouter.GET, '/api/madoc/crowdsourcing/model/:id/json', captureModelExport],
  'create-capture-model': [TypedRouter.POST, '/api/madoc/crowdsourcing/model', createCaptureModelApi],
  'update-capture-model': [TypedRouter.PUT, '/api/madoc/crowdsourcing/model/:id', updateCaptureModelApi],
  'delete-capture-model': [TypedRouter.DELETE, '/api/madoc/crowdsourcing/model/:id', deleteCaptureModelApi],
  'clone-capture-model': [TypedRouter.POST, '/api/madoc/crowdsourcing/model/:id/clone', cloneCaptureModel],
  'create-revision': [TypedRouter.POST, '/api/madoc/crowdsourcing/model/:captureModelId/revision', createRevisionApi],
  'choice-revision': [
    TypedRouter.GET,
    '/api/madoc/crowdsourcing/model/:captureModelId/structure/:structureId',
    choiceRevisionApi,
  ],
  'revision-template': [
    TypedRouter.GET,
    '/api/madoc/crowdsourcing/model/:captureModelId/template/:revisionId',
    revisionTemplate,
  ],
  'fork-revision': [
    TypedRouter.GET,
    '/api/madoc/crowdsourcing/model/:captureModelId/fork/:revisionId',
    forkRevisionApi,
  ],
  'clone-revision': [
    TypedRouter.GET,
    '/api/madoc/crowdsourcing/model/:captureModelId/clone/:revisionId',
    cloneRevisionApi,
  ],
  'update-revision': [TypedRouter.PUT, '/api/madoc/crowdsourcing/revision/:id', updateRevisionApi],
  'delete-revision': [TypedRouter.DELETE, '/api/madoc/crowdsourcing/revision/:id', deleteRevisionApi],
  revision: [TypedRouter.GET, '/api/madoc/crowdsourcing/revision/:id', revisionApi],
  'revision-list': [TypedRouter.GET, '/api/madoc/crowdsourcing/revision', revisionListApi],
  'search-published': [TypedRouter.GET, '/api/madoc/crowdsourcing/search/published', searchPublished],

  // Temporary
  'capture-model-migration': [TypedRouter.GET, '/api/madoc/crowdsourcing/model/migrate/:id', modelApiMigration],
  'capture-model-migration-post': [TypedRouter.POST, '/api/madoc/crowdsourcing/model/migrate/:id', modelApiMigration],
  'capture-model-migration-start': [TypedRouter.POST, '/api/madoc/crowdsourcing/model/migrate', modelApiMigrationStart],
};
