import { CaptureModelShorthand } from '../../extensions/projects/types';
import { captureModelShorthand } from '../../frontend/shared/capture-models/helpers/capture-model-shorthand';
import { captureModelShorthandText } from '../../frontend/shared/capture-models/helpers/capture-model-shorthand-text';
import { hydrateCaptureModel } from '../../frontend/shared/capture-models/helpers/hydrate-capture-model';
import { userDetailConfig } from '../../frontend/shared/configuration/user-detail-config';
import { RouteMiddleware } from '../../types/route-middleware';
import { userWithScope } from '../../utility/user-with-scope';

export const userSettingsModel: RouteMiddleware = async context => {
  const { id } = userWithScope(context, ['site.view']);

  const existingConfig = await context.siteManager.getProtectedUserDetails(id);
  const config = await context.siteManager.getSystemConfig(false);

  const shortHand: CaptureModelShorthand<any> = {};
  const shorthandKeys = Object.keys(userDetailConfig);
  for (const key of shorthandKeys) {
    if (config.builtInUserProfile && config.builtInUserProfile[key]) {
      shortHand[key] = userDetailConfig[key];
    }
  }
  // Dynamic from settings.

  const { visibility = {}, ...otherConfig } = existingConfig.preferences || {};

  const baseModel = captureModelShorthand(shortHand);
  const model = captureModelShorthandText(config.userProfileModel || '', {
    defaultType: 'text-field',
  });

  baseModel.properties = {
    ...baseModel.properties,
    ...model.properties,
  };

  const existingVisibility = existingConfig.preferences.visibility || {};
  const options = [
    {
      text: 'Only me',
      value: 'only-me',
    },
    {
      text: 'Administrators',
      value: 'staff',
    },
    {
      text: 'Public',
      value: 'public',
    },
  ];
  const visibilityShortHand: CaptureModelShorthand<any> = {
    // 3 hard-coded visibility options.
    email: {
      label: 'Primary Email',
      type: 'dropdown-field',
      inline: true,
      value: visibility.email || 'only-me',
      options,
    },
    contributions: {
      label: 'Contributions',
      type: 'dropdown-field',
      inline: true,
      value: visibility.contributions || 'only-me',
      options,
    },
    contributionStatistics: {
      label: 'Contribution Statistics',
      type: 'dropdown-field',
      inline: true,
      value: visibility.contributionStatistics || 'public',
      options,
    },
    awards: {
      label: 'Awards',
      type: 'dropdown-field',
      inline: true,
      value: visibility.awards || 'public',
      options,
    },
  };
  for (const key of Object.keys(baseModel.properties)) {
    visibilityShortHand[key] = {
      label: baseModel.properties[key][0].label,
      type: 'dropdown-field',
      inline: true,
      value: existingVisibility[key] || 'staff',
      options,
    };
  }

  const visibilityModel = captureModelShorthand(visibilityShortHand);

  context.response.body = {
    model: hydrateCaptureModel(baseModel, existingConfig.information || {}, { keepExtraFields: true }),
    visibilityModel: hydrateCaptureModel(visibilityModel, existingConfig.preferences.visibility || {}, {
      keepExtraFields: true,
    }),
  };
};
