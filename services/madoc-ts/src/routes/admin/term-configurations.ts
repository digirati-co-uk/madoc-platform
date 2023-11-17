import { stringify } from 'query-string';
import invariant from 'tiny-invariant';
import { CompletionItem } from '../../frontend/shared/capture-models/editor/input-types/AutocompleteField/AutocompleteField';
import { RouteMiddleware } from '../../types/route-middleware';
import { TermConfigurationRequest } from '../../types/term-configurations';
import { getValueDotNotation } from '../../utility/iiif-metadata';
import { optionalUserWithScope, userWithScope } from '../../utility/user-with-scope';

export const listTermConfigurations: RouteMiddleware = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);

  context.response.body = {
    termConfigurations: await context.termConfigurations.listAllTermConfigurations(siteId),
  };
};

export const getTermConfiguration: RouteMiddleware<{ id: string }> = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);

  context.response.body = await context.termConfigurations.getTermConfiguration(context.params.id, siteId);
};

export const createTermConfiguration: RouteMiddleware<never, TermConfigurationRequest> = async context => {
  const { siteId, id } = userWithScope(context, ['site.admin']);

  context.response.body = await context.termConfigurations.createTermConfiguration(context.requestBody, id, siteId);
};

export const updateTermConfiguration: RouteMiddleware<
  { id: string },
  TermConfigurationRequest & { id: string }
> = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);

  const request = context.requestBody;
  invariant(request.id === context.params.id, 'ID must match');

  context.response.body = await context.termConfigurations.updateTermConfiguration(request, siteId);
};

export const deleteTermConfiguration: RouteMiddleware<{ id: string }> = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);

  await context.termConfigurations.deleteTermConfiguration(context.params.id, siteId);

  context.response.status = 204;
};
