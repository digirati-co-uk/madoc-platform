import { captureModelShorthand } from '@capture-models/helpers';
import { ProjectTemplate } from '../types';

export const kitchenSinkTemplate: ProjectTemplate = {
  type: 'kitchen-sink',
  metadata: {
    label: 'Kitchen sink template',
    description: 'A kitchen sink project template',
    version: '1.0.0',
    actionLabel: 'Create kitchen sink',
    documentation: 'https://docs.madoc.io/',
  },
  setupModel: captureModelShorthand({
    customField: 'text-field',
  }),
  captureModel: captureModelShorthand({
    transcription: {
      type: 'text-field',
      multiline: true,
      minLines: 6,
      label: 'Transcription',
    },
  }),
  configuration: {
    defaults: {
      claimGranularity: 'canvas',
      contributionMode: 'annotation',
      shortExpiryTime: '15',
      metadataSuggestions: {
        manifest: true,
        canvas: true,
        collection: true,
      },
      manifestPageOptions: {
        showIIIFLogo: true,
      },
    },
    frozen: true,
    immutable: ['claimGranularity', 'contributionMode'],
    tasks: {
      generateOnCreate: false,
      generateOnNewContent: false,
    },
    captureModels: {
      noCaptureModel: true,
      preventChangeDocument: true,
      preventChangeStructure: true,
    },
    // Disabled this option for now.
    // slots: {
    //   immutable: false,
    // },
    status: {
      defaultStatus: 1,
      statusMap: {
        0: {
          color: 'red',
          label: 'Paused',
          action: 'Pause this project',
          info: 'This project is paused',
        },
      },
      disabled: false,
    },
    activity: {
      noActivity: true,
    },
  },
  slots: {
    manifest: {
      'common-breadcrumbs': {
        slotId: 'common-breadcrumbs',
        label: { none: ['Default breadcrumbs'] },
        layout: 'none',
        blocks: [
          {
            name: 'Display breadcrumbs',
            type: 'default.DisplayBreadcrumbs',
            static_data: {},
            lazy: false,
            order: 0,
          },
          {
            lazy: false,
            name: 'Simple HTML block',
            type: 'simple-html-block',
            static_data: {
              html: '<p>Testing this appears</p>',
            },
            order: 1,
          },
        ],
      },
    },
  },
  setup: {
    async onCreateConfiguration(projectConfig, { options }: { options: { customField: string } }) {
      console.log('onCreateConfiguration', { projectConfig, options });
    },
    async beforeForkDocument(doc) {
      console.log('beforeForkDocument', doc);
    },
    async onCreateProject(...args) {
      console.log('onCreateProject', args);
    },
  },
  hooks: {
    async onCreateUserRevisionSession(...args) {
      console.log('onCreateUserRevisionSession', args);
    },
    async onAddContentToProject(...args) {
      console.log('onAddContentToProject', args);
    },
    async onRemoveContentFromProject(...args) {
      console.log('onRemoveContentFromProject', args);
    },
    async canContentBeAddedToProject(...args) {
      console.log('canContentBeAddedToProject', args);
      return true;
    },
    async onProjectStatus(...args) {
      console.log('onProjectStatus', args);
    },
    async onLoadRevision(...args) {
      console.log('onLoadRevision', args);
    },
    async beforeSaveRevision(...args) {
      console.log('beforeSaveRevision', args);
    },
    async beforeCloneModel(...args) {
      console.log('beforeCloneModel', args);
    },
    async onSubmitRevision(...args) {
      console.log('onSubmitRevision', args);
    },
    async onRevisionApproved(...args) {
      console.log('onRevisionApproved', args);
    },
    async onRevisionRejected(...args) {
      console.log('onRevisionRejected', args);
    },
    async onResourceComplete(...args) {
      console.log('onResourceComplete', args);
    },
    async onCreateReview(...args) {
      console.log('onCreateReview', args);
    },
    async onAssignReview(...args) {
      console.log('onAssignReview', args);
    },
  },
  theme: {
    custom: {
      header: {
        headerBackground: 'blue',
      },
    },
  },
};
