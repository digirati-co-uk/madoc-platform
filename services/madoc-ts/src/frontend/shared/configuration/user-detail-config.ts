import { CaptureModelShorthand } from '../../../extensions/projects/types';

export const userDetailConfig: CaptureModelShorthand<any> = {
  gravitar: {
    type: 'checkbox-field',
    label: 'Profile image',
    description: 'Use your Gravitar profile image',
    inlineLabel: 'Use Gravitar',
    inlineDescription: 'The image will be fetched from Gravitar using your email address.',
  },
  bio: {
    type: 'text-field',
    label: 'Bio',
    description: 'A short bio about yourself',
    multiline: true,
    minLines: 3,
  },
  institution: {
    type: 'text-field',
    label: 'Institution',
    description: 'The institution you are affiliated with',
  },
  status: {
    type: 'text-field',
    label: 'Current status',
    description: 'Appears to other users on your profile next to your name',
  },
};
