import { CaptureModelShorthand } from '../../../extensions/projects/types';

export const userDetailConfig: CaptureModelShorthand<any> = {
  avatar: {
    type: 'avatar-generator-field',
    label: 'Avatar',
    description: 'Enable an avatar for your profile',
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
