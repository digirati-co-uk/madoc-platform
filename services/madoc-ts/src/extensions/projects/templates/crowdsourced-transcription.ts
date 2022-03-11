import { DropdownFieldProps } from '../../../frontend/shared/capture-models/editor/input-types/DropdownField/DropdownField';
import { captureModelShorthand } from '../../../frontend/shared/capture-models/helpers/capture-model-shorthand';
import { ProjectTemplate } from '../types';

type CrowdsourcedTranscriptionOptions = {
  modelLabel: string;
  modelDescription: string;
  crowdsourcingInstructions: string;
  reviewStrategy: 'one-contributor' | 'two-contributors' | 'many-contributors' | 'manual';
};

export const crowdsourcedTranscription: ProjectTemplate<CrowdsourcedTranscriptionOptions> = {
  type: '@madoc.io/crowdsourced-transcription',
  metadata: {
    label: 'Crowdsourced Transcription',
    actionLabel: 'Start transcribing',
    description: `Content added to this project will be available to browse 
    and users will be able to pick up and transcribe individual images. These
    images will be submitted for review, where you will be able to accept, reject
    or merge contributions.`,
    documentation: 'https://docs.madoc.io/incomplete-user-guide/workflows/transcribing-a-set-of-images',
    version: '1.0.0',
    thumbnail: `<svg width="109" height="109" xmlns="http://www.w3.org/2000/svg">
        <g fill="none" fill-rule="evenodd">
          <rect stroke="#E7E9EC" stroke-width="2" x="1" y="1" width="107" height="107" rx="5"/>
          <path fill="#000" d="M17 28.4h75.4v5.3H17z"/>
          <path fill="#5B78E5" d="M17 19.6h75.4v5.3H17zM17 28.4h75.4v5.3H17z"/>
          <path fill="#E7E9EC" d="M17 37.1h75.4v5.3H17z"/>
          <path fill="#5B78E5" d="M17 37.1h37.9v5.3H17z"/>
          <path fill="#E7E9EC" d="M17 46.1h75.4v5.3H17zM17 66.1h75.4v5.3H17zM17 74.8h75.4v5.3H17zM17 54.9h25.7v5.3H17zM17.9 83.8h36.6v4.3H17.9z"/>
        </g>
      </svg>
    `,
  },
  configuration: {
    defaults: {
      allowSubmissionsWhenCanvasComplete: false,
      claimGranularity: 'canvas',
      allowCanvasNavigation: true,
      allowManifestNavigation: true,
      allowCollectionNavigation: true,
      randomlyAssignCanvas: false,
      maxContributionsPerResource: 1,
      skipAutomaticOCRImport: false,
      contributionMode: 'annotation',
    },
    immutable: [
      'claimGranularity',
      'allowSubmissionsWhenCanvasComplete',
      'allowCanvasNavigation',
      'allowManifestNavigation',
      'allowCollectionNavigation',
      'randomlyAssignCanvas',
      'maxContributionsPerResource',
      'skipAutomaticOCRImport',
      'contributionMode',
      'shortExpiryTime',
      'longExpiryTime',
      'headerOptions',
      'metadataSuggestions',
    ],
    activity: {},
    frozen: false,
    status: {},
    tasks: {},
    captureModels: { preventChangeStructure: true, preventChangeDocument: true },
  },
  captureModel: {
    document: captureModelShorthand({
      transcription: {
        label: 'Transcription',
        type: 'text-field',
        minLines: 5,
        multiline: true,
        dataSources: ['plaintext-source'],
      },
    }),
  },
  setup: {
    model: {
      modelLabel: {
        label: 'Form label',
        description: 'Label for the transcription form field',
        type: 'text-field',
      },
      reviewStrategy: {
        label: 'Review strategy',
        type: 'dropdown-field',
        options: [
          { text: 'Only one contributor per image. Once reviewed, it is complete', value: 'one-contributor' },
          { text: 'Two contributors per image. Once reviewed, it is complete', value: 'two-contributors' },
          { text: 'No limit on contributors. Once one is reviewed, it is complete', value: 'many-contributors' },
          { text: 'No limit on contributors and images are manually marked as complete', value: 'manual' },
        ],
      } as DropdownFieldProps,
      modelDescription: {
        label: 'Form description',
        description: 'A longer description for your transcription form field, appears under the label (like this)',
        type: 'text-field',
      },
      crowdsourcingInstructions: {
        label: 'Crowdsourcing instructions',
        description: 'These instructions will appear to your users when working on an image.',
        type: 'text-field',
        minLines: 4,
        multiline: true,
      } as any,

      // Which options should we give when creating.
      // - How many submissions per image
      // - Select a user to review (if empty = randomly assign)
      // - Submissions required (before creating a review)
      // - Enable personal notes
      //
      // Customising the viewer.
      // - Model label
      // - Model description
      // - Crowdsourcing instructions
    },
    defaults: {
      modelLabel: 'Transcription',
      crowdsourcingInstructions: '',
      modelDescription: '',
      reviewStrategy: 'one-contributor',
    },
    async onCreateProject(project, { api, options }) {
      //
    },
    async onCreateConfiguration(config, { api, options }) {
      switch (options.reviewStrategy) {
        case 'one-contributor': {
          config.revisionApprovalsRequired = 1;
          config.maxContributionsPerResource = 1;
          break;
        }
        case 'two-contributors': {
          config.revisionApprovalsRequired = 1;
          config.maxContributionsPerResource = 2;
          break;
        }
        case 'manual': {
          config.revisionApprovalsRequired = 1000;
          config.maxContributionsPerResource = 1000;
          break;
        }
        case 'many-contributors':
        default: {
          config.revisionApprovalsRequired = 1;
          config.maxContributionsPerResource = 1000;
          break;
        }
      }
      return config;
    },
    async beforeForkDocument(doc: any, { options }) {
      if (options.modelLabel) {
        doc.properties.transcription[0].label = options.modelLabel;
      }
      if (options.crowdsourcingInstructions) {
        doc.instructions = options.crowdsourcingInstructions;
      }
      if (options.modelDescription) {
        doc.properties.transcription[0].description = options.modelDescription;
      }
      return doc;
    },
    async beforeForkStructure(fullModel: any, { options }) {
      if (options.crowdsourcingInstructions) {
        fullModel.structure.items[0].instructions = options.crowdsourcingInstructions;
        return fullModel.structure;
      }
    },
  },
};
