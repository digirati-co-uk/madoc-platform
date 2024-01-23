import { PublicUserProfile, SiteUser } from '../../extensions/site-manager/types';
import { captureModelShorthandText } from '../../frontend/shared/capture-models/helpers/capture-model-shorthand-text';
import { userDetailConfig } from '../../frontend/shared/configuration/user-detail-config';
import { RouteMiddleware } from '../../types/route-middleware';

function createCanSee(me?: boolean, siteRole?: string, scope?: string[]) {
  return (_visibility: 'only-me' | 'staff' | 'public' | undefined, defaultValue = 'only-me'): boolean => {
    const visibility = _visibility || defaultValue;
    if (me) {
      return true;
    }
    if (!visibility || visibility === 'only-me') {
      return false;
    }

    if (visibility === 'public') {
      return true;
    }

    if (!siteRole || !scope) {
      return false;
    }

    if (visibility === 'staff') {
      return scope.includes('site.admin') || siteRole === 'reviewer' || siteRole === 'admin';
    }

    return false;
  };
}

export const siteUserProfile: RouteMiddleware = async context => {
  const { siteApi, site } = context.state;
  const id = context.state.jwt?.user.id;
  const scope = context.state.jwt?.scope;
  const requestingUser = id ? await context.siteManager.getSiteUserById(id, site.id) : undefined;
  // Users basic details

  // User "information" based on their preferences
  const protectedUser = await context.siteManager.getUserById(context.params.id);
  const protectedSiteUser = await context.siteManager.getSiteUserById(context.params.id, site.id);
  const canSee = createCanSee(protectedUser.id === requestingUser?.id, requestingUser?.role, scope);
  const requested = await context.siteManager.requestUserDetails(context.params.id, id, site.id);
  const config = await context.siteManager.getSystemConfig(false);
  const model = captureModelShorthandText(config.userProfileModel || '', {
    defaultType: 'text-field',
  });

  const publicUser: SiteUser = {
    id: protectedUser.id,
    name: protectedUser.name,
    role: protectedSiteUser.role,
    automated: protectedUser.automated,
    site_role: protectedSiteUser.site_role,
    config: protectedUser.config,
  };

  const customLabels: Record<string, string> = {};
  const shorthandKeys = Object.keys(userDetailConfig);
  for (const key of shorthandKeys) {
    if (requested.allowedDetails[key]) {
      const field = userDetailConfig[key] as { label: string };
      customLabels[key] = field.label;
    }
  }
  const customKeys = Object.keys(model.properties);
  for (const key of customKeys) {
    if (requested.allowedDetails[key]) {
      const fields = model.properties[key] as { label: string }[];
      if (fields) {
        const field = fields[0];
        customLabels[key] = field?.label || key;
      }
    }
  }

  if (canSee(requested.preferences?.visibility?.email)) {
    publicUser.email = protectedUser.email;
  }

  const statistics: Record<
    string,
    {
      statuses: Record<number, number>;
      total: number;
    }
  > = {};
  if (canSee(requested.preferences?.visibility?.contributionStatistics)) {
    const [crowdsourcing, reviews] = await Promise.all([
      siteApi.getAllTaskStats({
        user_id: `urn:madoc:user:${context.params.id}`,
        type: 'crowdsourcing-task',
        distinct_subjects: true,
      }),
      siteApi.getAllTaskStats({
        user_id: `urn:madoc:user:${context.params.id}`,
        type: 'crowdsourcing-review',
        distinct_subjects: true,
      }),
    ]);

    statistics.crowdsourcing = crowdsourcing;
    if (protectedUser.role === 'reviewer' || protectedUser.role === 'admin' || scope?.includes('site.admin')) {
      statistics.reviews = reviews;
    }
  }

  const recentTasks = await siteApi.getTasks(0, {
    assignee: `urn:madoc:user:${context.params.id}`,
    type: 'crowdsourcing-task',
    status: 3,
    all_tasks: true,
    per_page: 20,
    sort_by: 'newest',
  });

  const profile: PublicUserProfile = {
    user: publicUser,
    info: requested.allowedDetails as any,
    statistics,
    recentTasks: recentTasks.tasks,
    infoLabels: customLabels,
  };
  context.response.body = profile;
};
