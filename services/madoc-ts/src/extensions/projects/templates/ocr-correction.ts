import { DropdownFieldProps } from '../../../frontend/shared/capture-models/editor/input-types/DropdownField/DropdownField';
import { captureModelShorthand } from '../../../frontend/shared/capture-models/helpers/capture-model-shorthand';
import { ProjectTemplate } from '../types';

type OCRCorrectionOptions = {
  modelLabel: string;
  modelDescription: string;
  crowdsourcingInstructions: string;
  reviewStrategy: 'one-contributor' | 'two-contributors' | 'many-contributors' | 'manual';
};

export const ocrCorrection: ProjectTemplate<OCRCorrectionOptions> = {
  type: '@madoc.io/ocr-correction',
  metadata: {
    label: 'OCR Correction',
    actionLabel: 'Correct OCR',
    description: `Content added to this project will be available to browse 
    and users will be able to correct any OCR that has been detected and imported. These
    images will be submitted for review, where you will be able to accept, reject
    or merge contributions.`,
    documentation: 'https://docs.madoc.io/user-guide/ocr/adding-ocr-correction-to-capture-model',
    version: '1.0.0',
    thumbnail: `<svg width="109px" height="109px" viewBox="0 0 109 109" xmlns="http://www.w3.org/2000/svg">
        <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
            <g transform="translate(-95.000000, -508.000000)">
                <g transform="translate(95.000000, 508.000000)">
                    <rect stroke="#E7E9EC" stroke-width="2" x="1" y="1" width="107" height="107" rx="5"></rect>
                    <rect fill="#E7E9EC" x="17" y="28" width="75" height="5"></rect>
                    <rect fill="#E7E9EC" x="33" y="16" width="43" height="5"></rect>
                    <rect fill="#E7E9EC" x="17" y="37" width="56" height="5"></rect>
                    <rect fill="#5B78E5" x="48" y="28" width="34" height="5"></rect>
                    <rect fill="#E7E9EC" x="17" y="46" width="75" height="5"></rect>
                    <rect fill="#E7E9EC" x="17" y="64" width="56" height="5"></rect>
                    <rect fill="#E7E9EC" x="17" y="72" width="41" height="5"></rect>
                    <rect fill="#E7E9EC" x="17" y="55" width="28" height="5"></rect>
                    <rect fill="#E7E9EC" x="17" y="81" width="75" height="5"></rect>
                    <rect fill="#5B78E5" x="42" y="46" width="17" height="5"></rect>
                    <rect fill="#5B78E5" x="59" y="64" width="14" height="5"></rect>
                    <rect fill="#5B78E5" x="35" y="81" width="14" height="5"></rect>
                </g>
            </g>
        </g>
    </svg>`,
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
      'ocr-correction': {
        label: 'OCR Correction',
        type: 'madoc-paragraphs',
        value: '',
      },
    }),
  },
  setup: {
    model: {
      modelLabel: {
        label: 'Form label',
        description: 'Label for the OCR Correction form field',
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
        description: 'A longer description for your form field, appears under the label (like this)',
        type: 'text-field',
      },
      crowdsourcingInstructions: {
        label: 'Crowdsourcing instructions',
        description: 'These instructions will appear to your users when working on an image.',
        type: 'text-field',
        minLines: 4,
        multiline: true,
      } as any,
    },
    defaults: {
      modelLabel: 'OCR Correction',
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
        doc.properties['ocr-correction'][0].label = options.modelLabel;
      }
      if (options.crowdsourcingInstructions) {
        doc.instructions = options.crowdsourcingInstructions;
      }
      if (options.modelDescription) {
        doc.properties['ocr-correction'][0].description = options.modelDescription;
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
