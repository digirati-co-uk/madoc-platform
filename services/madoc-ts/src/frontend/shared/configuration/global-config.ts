import { CaptureModelShorthand } from '../../../extensions/projects/types';
import { SystemConfig } from '../../../extensions/site-manager/types';
import { userDetailConfig } from './user-detail-config';

export const globalSystemConfigModel: Partial<{ [key in keyof SystemConfig]: any }> = {
  enableRegistrations: {
    label: 'User registrations',
    type: 'checkbox-field',
    inlineLabel: 'Allow users to register to the site',
  },
  registeredUserTranscriber: {
    label: 'User role',
    type: 'checkbox-field',
    inlineLabel: 'New users can contribute to crowdsourcing projects',
  },
  installationTitle: {
    label: 'Installation title',
    type: 'text-field',
  },
  defaultSite: {
    label: 'Slug of default site',
    type: 'dropdown-field',
  },

  // User profile options
  ...createUserDetailCheckboxes(),
  userProfileModel: {
    label: 'User profile model',
    description: 'Model shorthand for user profile',
    type: 'text-field',
    multiline: true,
    minLines: 10,
  },
};

function createUserDetailCheckboxes(): CaptureModelShorthand<'builtInUserProfile'> {
  const keys = Object.keys(userDetailConfig);
  const checkboxes: Array<{ label: string; value: string }> = [];
  for (const key of keys) {
    checkboxes.push({
      label: `Enable "${key}" field`,
      value: key,
    });
  }
  return {
    builtInUserProfile: {
      type: 'checkbox-list-field',
      label: 'Enable built-in profile fields',
      description: 'Show built-in profile fields to users',
      options: checkboxes,
    },
  };
}
