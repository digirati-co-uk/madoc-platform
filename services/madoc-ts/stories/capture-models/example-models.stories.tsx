import { captureModelShorthand } from '../../src/frontend/shared/capture-models/helpers/capture-model-shorthand';
import * as React from 'react';
import { slotConfig } from '../../src/extensions/capture-models/Paragraphs/Paragraphs.slots';
import { EditShorthandCaptureModel } from '../../src/frontend/shared/capture-models/EditorShorthandCaptureModel';
import { BackToChoicesButton } from '../../src/frontend/shared/capture-models/new/components/BackToChoicesButton';
import { DefaultAdjacentNavigation } from '../../src/frontend/shared/capture-models/new/components/DefaultAdjacentNavigation';
import { EditorSlots } from '../../src/index';
import { captureModelShorthandModifier } from '../../src/utility/capture-model-shorthand-modifier';
import { ModelStorybookProvider } from './helpers';
import { ocrCorrectionModel } from './models/ocr-correction';

export default {
  title: 'Capture models/Example models',
  component: DefaultAdjacentNavigation,
  args: {},
};

const Remote = (_props: any) => {
  const { url, ...props } = _props;
  const [loaded, setLoaded] = React.useState<any>();

  React.useEffect(() => {
    if (!url) {
      throw new Error('No URL');
    }

    fetch(url)
      .then(r => r.json())
      .then(resp => {
        setLoaded(resp);
      });
  }, [url]);

  if (!loaded) {
    return <>Loading...</>;
  }

  return <Template {...props} document={loaded.document} structure={loaded.structure} />;
};

const Template = (_props: any) => {
  const { shorthand, data, document, structure, slotConfig: _slotConfig, ...props } = _props;

  return (
    <ModelStorybookProvider>
      <EditShorthandCaptureModel
        slotConfig={_slotConfig}
        data={data}
        template={shorthand || document}
        structure={structure}
        fullDocument={!!document}
        keepExtraFields
      >
        {structure ? <BackToChoicesButton /> : null}
        <EditorSlots.TopLevelEditor {...props} />
      </EditShorthandCaptureModel>
    </ModelStorybookProvider>
  );
};

export const SimpleTranscription = Template.bind({});
SimpleTranscription.args = {
  document: captureModelShorthand({
    transcription: {
      type: 'text-field',
      label: 'Transcription',
      multiline: true,
      allowMultiple: false,
    },
  }),
};
export const SimpleTranscriptionWithBox = Template.bind({});
SimpleTranscriptionWithBox.args = {
  document: captureModelShorthand({
    transcription: {
      type: 'text-field',
      label: 'Transcription',
      multiline: true,
      selector: { type: 'box-selector', value: null },
      allowMultiple: false,
    },
  }),
};

export const MultipleTranscriptions = Template.bind({});
MultipleTranscriptions.args = {
  document: captureModelShorthand({
    transcription: {
      type: 'text-field',
      label: 'Transcription',
      multiline: true,
      allowMultiple: true,
    },
  }),
};
export const MultipleTranscriptionsWithBox = Template.bind({});
MultipleTranscriptionsWithBox.args = {
  document: captureModelShorthand({
    transcription: {
      type: 'text-field',
      label: 'Transcription',
      multiline: true,
      selector: { type: 'box-selector', value: null },
      allowMultiple: true,
    },
  }),
};

export const SimplePerson = Template.bind({});
SimplePerson.args = {
  document: captureModelShorthandModifier(
    {
      'person.firstName': { type: 'text-field', label: 'First name' },
      'person.lastName': 'text-field',
    },
    doc => {
      doc.properties.person[0].label = 'Person';
      doc.properties.person[0].labelledBy = '{firstName} {lastName} {@empty/Unknown person}';
      doc.properties.person[0].allowMultiple = false;
    }
  ),
  data: { person: { firstName: '', lastName: '' } },
};

export const MultiplePeople = Template.bind({});
MultiplePeople.args = {
  document: captureModelShorthandModifier(
    {
      'person.firstName': { type: 'text-field', label: 'First name' },
      'person.lastName': 'text-field',
    },
    doc => {
      doc.properties.person[0].label = 'Person';
      doc.properties.person[0].labelledBy = '{firstName} {lastName} {@empty/Unknown person}';
      doc.properties.person[0].allowMultiple = true;
    }
  ),
  data: { person: { firstName: '', lastName: '' } },
};

export const GhentAnnotationTranscription = Template.bind({});
GhentAnnotationTranscription.args = {
  document: {
    id: '423823cd-8689-40f6-80aa-b828b66c65b9',
    type: 'entity',
    label: 'vertalingen en annotaties',
    properties: {
      Vertaling: [
        {
          id: 'bb10d099-53db-427f-bbc1-3130fa931345',
          type: 'text-field',
          label: 'translation',
          value: '',
          allowMultiple: true,
          selector: {
            id: '38141f4b-5e47-45c4-832e-14fc2abfc01e',
            type: 'box-selector',
            state: null,
          },
          multiline: true,
        },
      ],
      Annotatie: [
        {
          id: '14059e79-3405-40cf-a991-9bf62c52008c',
          type: 'text-field',
          label: 'annotation',
          value: '',
          allowMultiple: true,
          selector: {
            id: 'cfb9d3f0-c0be-47a1-967a-961cd6964ad4',
            type: 'box-selector',
            state: null,
          },
          multiline: true,
        },
      ],
    },
  },
  data: {
    Vertaling: '',
    Annotatie: '',
  },
};

export const GhentFeministModel = Template.bind({});
GhentFeministModel.args = {
  document: {
    id: '072e96f4-30c2-47e5-8831-919dec32e003',
    type: 'entity',
    label: 'Eva',
    properties: {
      'Algemene informatie (Gedicht)': [
        {
          id: 'f976df07-36ab-48e5-ae21-fd8e32424173',
          type: 'entity',
          label: 'Algemene informatie (Gedicht)',
          properties: {
            Auteur: [
              {
                id: '466a943d-3021-4b92-adce-b5c873a0591b',
                type: 'entity',
                label: 'Auteur',
                labelledBy: 'Achternaam',
                properties: {
                  Achternaam: [
                    {
                      id: 'fd9d3d4a-7138-4b1f-9c47-8b79644116c8',
                      type: 'text-field',
                      label: 'Achternaam',
                      value: '',
                    },
                  ],
                  Voornaam: [
                    {
                      id: 'c1bbbad2-dd5c-488d-9cf4-5a4181174f2b',
                      type: 'text-field',
                      label: 'Voornaam',
                      value: '',
                    },
                  ],
                  'Geboorte- en sterfdatum': [
                    {
                      id: '614ad6fb-4607-44c4-a330-621b61534c04',
                      type: 'text-field',
                      label: 'Geboorte- en sterfdatum',
                      value: '',
                    },
                  ],
                  Nationaliteit: [
                    {
                      id: '515248ad-13f7-487a-aa2f-da01a3670dc5',
                      type: 'text-field',
                      label: 'Nationaliteit',
                      value: '',
                    },
                  ],
                },
              },
            ],
            'Vertaling?': [
              {
                id: '9fa12fb7-5185-4956-b6db-448e9f8f3daf',
                type: 'entity',
                label: 'Origineel',
                properties: {
                  Vertaling: [
                    {
                      id: 'a9898dcd-5bc7-40cf-a993-37008ec933ce',
                      type: 'entity',
                      label: 'Vertaling',
                      properties: {
                        'Vertaald vanuit': [
                          {
                            id: '2b31175f-479b-4be2-9363-8e16441c4ed7',
                            type: 'text-field',
                            label: 'Vertaald vanuit',
                            value: '',
                          },
                        ],
                        'Vertaald door': [
                          {
                            id: 'f1085faf-8744-45cb-9e57-a2330af4494c',
                            type: 'text-field',
                            label: 'Vertaald door',
                            value: '',
                          },
                        ],
                      },
                      selector: {
                        id: '1c1a4262-5afd-4c34-8df5-533eb57617aa',
                        type: 'box-selector',
                        state: null,
                      },
                    },
                  ],
                  'Verhouding met origineel': [
                    {
                      id: 'a38ec93e-1f1d-47bf-916e-767ab3bd6757',
                      type: 'entity',
                      label: 'Verhouding met origineel',
                      properties: {
                        Lengte: [
                          {
                            id: 'eeab41b6-074c-4137-ae13-5eea3cc90c9b',
                            type: 'text-field',
                            label: 'Lengte',
                            value: '',
                          },
                        ],
                        Stilistisch: [
                          {
                            id: '6b9c8c42-a822-43ad-826f-7b648bcaaee4',
                            type: 'text-field',
                            label: 'Stilistisch',
                            value: '',
                          },
                        ],
                        'Vergelijking context origineel vs. in De Vrouw': [
                          {
                            id: 'b8619ace-3225-4a07-90ac-8efa16086ff5',
                            type: 'text-field',
                            label: 'Vergelijking context origineel vs. in De Vrouw',
                            value: '',
                          },
                        ],
                      },
                    },
                  ],
                  'URL Origineel': [
                    {
                      id: '8f06ab8e-b954-4b0a-9f55-c3f01c08835a',
                      type: 'text-field',
                      label: 'URL Origineel',
                      value: '',
                    },
                  ],
                },
                selector: {
                  id: 'e4a81077-7a6b-4027-a6e5-2aa36702d38e',
                  type: 'box-selector',
                  state: null,
                },
              },
            ],
            Titel: [
              {
                id: '79ede668-08e4-4ee9-9568-781711588eb1',
                type: 'text-field',
                label: 'Titel',
                value: '',
              },
            ],
          },
          selector: {
            id: '730ed75f-6153-4bc3-b7f7-f1cb1328fcaf',
            type: 'box-selector',
            state: null,
          },
        },
      ],
      'PoÎtische eigenschappen': [
        {
          id: '0f2f100c-4c59-4f5e-aedc-e89a81487b1c',
          type: 'entity',
          label: 'PoÎtische eigenschappen',
          properties: {
            'Analyse vorm en inhoud gedicht': [
              {
                id: 'b65b2383-1369-4fd1-974f-c2cc630e71ab',
                type: 'text-field',
                label: 'Analyse vorm en inhoud gedicht',
                value: '',
              },
            ],
            Rijmschema: [
              {
                id: 'd176c663-d070-44c0-b0a4-bf6b79538269',
                type: 'text-field',
                label: 'Rijmschema',
                value: '',
              },
            ],
            'Aantal strofes': [
              {
                id: '8a987e7b-5128-4833-b0b9-75c42faf0f0f',
                type: 'text-field',
                label: 'Aantal strofes',
                value: '',
              },
            ],
            'Aantal versregels': [
              {
                id: '6367d247-657b-4fd0-bda2-b056255e24ab',
                type: 'text-field',
                label: 'Aantal versregels',
                value: '',
              },
            ],
          },
        },
      ],
      'Relatie tussen gedicht en De Vrouw': [
        {
          id: '087f89a9-da06-45af-9236-f925947056fc',
          type: 'entity',
          label: 'Relatie tussen gedicht en De Vrouw',
          properties: {
            'Omliggend artikel': [
              {
                id: '035f82d4-3fbc-43ef-8901-5db65efaa3e5',
                type: 'entity',
                label: 'Omliggend artikel',
                allowMultiple: true,
                properties: {
                  Titel: [
                    {
                      id: '959a92e5-5d21-4ca8-ab49-7ad9b6c35d0c',
                      type: 'text-field',
                      label: 'Titel',
                      value: '',
                    },
                  ],
                  Auteur: [
                    {
                      id: '04a8319c-3af6-4d9b-bece-5d49ae07a2d3',
                      type: 'text-field',
                      label: 'Auteur',
                      value: '',
                    },
                  ],
                  Pagina: [
                    {
                      id: '71c8d1a7-95e8-44ab-a6a0-2ab33ad1de32',
                      type: 'text-field',
                      label: 'Pagina',
                      value: '',
                    },
                  ],
                },
              },
            ],
            'Effect van inbedding': [
              {
                id: '5601f778-8f86-4b93-957e-b1d379f22ee5',
                type: 'entity',
                label: 'Effect van inbedding',
                properties: {
                  'Waarde van het gedicht in context': [
                    {
                      id: 'b46d45e6-8286-401f-9854-bc4ab04bc262',
                      type: 'text-field',
                      label: 'Waarde van het gedicht in context',
                      value: '',
                    },
                  ],
                  'Aansluiting bij inhoud artikels': [
                    {
                      id: 'c9be9b00-78c3-4a42-af10-5a0204ba3760',
                      type: 'text-field',
                      label: 'Aansluiting bij inhoud artikels',
                      value: '',
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
      "Verhouding tot tentoonstelling 'Vrouwenarbeid' 1898": [
        {
          id: '33bc32f6-1f97-4fde-bdd0-78368bc037f4',
          type: 'text-field',
          label: "Verhouding tot tentoonstelling 'Vrouwenarbeid' 1898",
          value: '',
        },
      ],
    },
  },
};

export const GettyModel = Template.bind({});
GettyModel.args = {
  document: {
    id: '23662a89-a000-44fa-bbf8-b1d439f9b426',
    type: 'entity',
    label: 'Illustrations and Scribes',
    properties: {
      illustrations: [
        {
          id: '5922bcfa-336f-4ab7-911c-4726fff87d17',
          type: 'entity',
          label: 'Illustration',
          pluralLabel: 'Illustrations',
          description: 'Any illustrations you can identify in the image',
          allowMultiple: true,
          labelledBy: 'artist',
          properties: {
            notes: [
              {
                id: '8feab1cc-72fc-4ef9-b820-c17502e4f1a7',
                type: 'text-field',
                label: 'Notes',
                value: '',
                minLines: 6,
                multiline: true,
              },
            ],
            identifier: [
              {
                id: '17a26975-596d-4d55-8a5b-3c4aa1aef023',
                type: 'text-field',
                label: 'Identifier',
                value: '',
                description: 'A unique external identifier for this illustration.',
              },
            ],
            artist: [
              {
                id: '155c40b3-8954-48ab-b366-279ef87d09cc',
                type: 'dropdown-field',
                label: 'Artist',
                value: null,
                options: [
                  {
                    text: 'Artist A',
                    value: 'artist-a',
                  },
                  {
                    text: 'Artist B',
                    value: 'artist-b',
                  },
                  {
                    text: 'Artist C',
                    value: 'artist-c',
                  },
                  {
                    text: 'Artist D',
                    value: 'artist-d',
                  },
                  {
                    text: 'Artist E',
                    value: 'artist-e',
                  },
                  {
                    text: 'Artist F',
                    value: 'artist-f',
                  },
                  {
                    text: 'Artist G',
                    value: 'artist-g',
                  },
                  {
                    text: 'Artist H',
                    value: 'artist-h',
                  },
                  {
                    text: 'Artist I',
                    value: 'artist-i',
                  },
                  {
                    text: 'Artist J',
                    value: 'artist-j',
                  },
                  {
                    text: 'Artist K',
                    value: 'artist-k',
                  },
                  {
                    text: 'Artist L',
                    value: 'artist-l',
                  },
                  {
                    text: 'Artist M',
                    value: 'artist-m',
                  },
                  {
                    text: 'Artist N',
                    value: 'artist-n',
                  },
                  {
                    text: 'Artist O',
                    value: 'artist-o',
                  },
                  {
                    text: 'Artist P',
                    value: 'artist-p',
                  },
                  {
                    text: 'Artist Q',
                    value: 'artist-q',
                  },
                  {
                    text: 'Artist R',
                    value: 'artist-r',
                  },
                  {
                    text: 'Artist S',
                    value: 'artist-s',
                  },
                  {
                    text: 'Artist T',
                    value: 'artist-t',
                  },
                  {
                    text: 'Artist U',
                    value: 'artist-u',
                  },
                  {
                    text: 'Artist V',
                    value: 'artist-v',
                  },
                  {
                    text: 'Artist W',
                    value: 'artist-w',
                  },
                  {
                    text: 'Artist X',
                    value: 'artist-x',
                  },
                  {
                    text: 'Artist Y',
                    value: 'artist-y',
                  },
                  {
                    text: 'Artist Z',
                    value: 'artist-z',
                  },
                ],
                clearable: true,
                pluralField: 'Artists',
              },
            ],
            isDecorative: [
              {
                id: 'f0c3d49c-17ce-4669-a1a1-a74d070e4da2',
                type: 'checkbox-field',
                label: 'Is this a decorative element?',
                value: false,
                inlineLabel: 'Decorative element',
              },
            ],
          },
          selector: {
            id: '6e4ebb8e-ac80-4f2b-a405-448bb06e0f8f',
            type: 'box-selector',
            state: null,
          },
        },
      ],
      regions: [
        {
          id: 'a94474cc-c1e0-476d-bddf-3379df745edf',
          type: 'entity',
          label: 'Region of text',
          pluralLabel: 'Regions of text',
          description: 'Regions of text written by distinct scribes',
          allowMultiple: true,
          labelledBy: 'scribal-hand',
          properties: {
            notes: [
              {
                id: 'cf260a71-e6a7-4d7e-ba3e-e1c171a13215',
                type: 'text-field',
                label: 'Notes',
                value: '',
                minLines: 6,
                multiline: true,
              },
            ],
            'scribal-hand': [
              {
                id: 'f18be66a-53de-454e-bda8-4647a3ff6a9e',
                type: 'dropdown-field',
                label: 'Scribal hand',
                value: null,
                options: [
                  {
                    text: 'Scribe A',
                    value: 'scribe-a',
                  },
                  {
                    text: 'Scribe B',
                    value: 'scribe-b',
                  },
                  {
                    text: 'Scribe C',
                    value: 'scribe-c',
                  },
                  {
                    text: 'Scribe D',
                    value: 'scribe-d',
                  },
                  {
                    text: 'Scribe E',
                    value: 'scribe-e',
                  },
                  {
                    text: 'Scribe F',
                    value: 'scribe-f',
                  },
                  {
                    text: 'Scribe G',
                    value: 'scribe-g',
                  },
                  {
                    text: 'Scribe H',
                    value: 'scribe-h',
                  },
                  {
                    text: 'Scribe I',
                    value: 'scribe-i',
                  },
                  {
                    text: 'Scribe J',
                    value: 'scribe-j',
                  },
                  {
                    text: 'Scribe K',
                    value: 'scribe-k',
                  },
                  {
                    text: 'Scribe L',
                    value: 'scribe-l',
                  },
                  {
                    text: 'Scribe M',
                    value: 'scribe-m',
                  },
                  {
                    text: 'Scribe N',
                    value: 'scribe-n',
                  },
                  {
                    text: 'Scribe O',
                    value: 'scribe-o',
                  },
                  {
                    text: 'Scribe P',
                    value: 'scribe-p',
                  },
                  {
                    text: 'Scribe Q',
                    value: 'scribe-q',
                  },
                  {
                    text: 'Scribe R',
                    value: 'scribe-r',
                  },
                  {
                    text: 'Scribe S',
                    value: 'scribe-s',
                  },
                  {
                    text: 'Scribe T',
                    value: 'scribe-t',
                  },
                  {
                    text: 'Scribe U',
                    value: 'scribe-u',
                  },
                  {
                    text: 'Scribe V',
                    value: 'scribe-v',
                  },
                  {
                    text: 'Scribe W',
                    value: 'scribe-w',
                  },
                  {
                    text: 'Scribe X',
                    value: 'scribe-x',
                  },
                  {
                    text: 'Scribe Y',
                    value: 'scribe-y',
                  },
                  {
                    text: 'Scribe Z',
                    value: 'scribe-z',
                  },
                ],
                clearable: true,
              },
            ],
          },
          selector: {
            id: '3a40c69f-510b-413b-a883-97597304eb80',
            type: 'box-selector',
            state: null,
          },
        },
      ],
      decorative: [
        {
          id: 'd9e402cc-1d9e-408a-91e4-95cd06c2e155',
          type: 'entity',
          label: 'Decorative element',
          pluralLabel: 'Decorative elements',
          allowMultiple: true,
          properties: {
            identifier: [
              {
                id: 'fc3508d8-a40b-4e82-a311-a055599a12fc',
                type: 'text-field',
                label: 'Identifier',
                value: '',
                description: 'A unique external identifier for this illustration.',
              },
            ],
            artist: [
              {
                id: '80ad80fc-7dfe-4c9d-997b-95d7ca6998fd',
                type: 'dropdown-field',
                label: 'Artist',
                value: null,
                options: [
                  {
                    text: 'Artist A',
                    value: 'artist-a',
                  },
                  {
                    text: 'Artist B',
                    value: 'artist-b',
                  },
                  {
                    text: 'Artist C',
                    value: 'artist-c',
                  },
                  {
                    text: 'Artist D',
                    value: 'artist-d',
                  },
                  {
                    text: 'Artist E',
                    value: 'artist-e',
                  },
                  {
                    text: 'Artist F',
                    value: 'artist-f',
                  },
                  {
                    text: 'Artist G',
                    value: 'artist-g',
                  },
                  {
                    text: 'Artist H',
                    value: 'artist-h',
                  },
                  {
                    text: 'Artist I',
                    value: 'artist-i',
                  },
                  {
                    text: 'Artist J',
                    value: 'artist-j',
                  },
                  {
                    text: 'Artist K',
                    value: 'artist-k',
                  },
                  {
                    text: 'Artist L',
                    value: 'artist-l',
                  },
                  {
                    text: 'Artist M',
                    value: 'artist-m',
                  },
                  {
                    text: 'Artist N',
                    value: 'artist-n',
                  },
                  {
                    text: 'Artist O',
                    value: 'artist-o',
                  },
                  {
                    text: 'Artist P',
                    value: 'artist-p',
                  },
                  {
                    text: 'Artist Q',
                    value: 'artist-q',
                  },
                  {
                    text: 'Artist R',
                    value: 'artist-r',
                  },
                  {
                    text: 'Artist S',
                    value: 'artist-s',
                  },
                  {
                    text: 'Artist T',
                    value: 'artist-t',
                  },
                  {
                    text: 'Artist U',
                    value: 'artist-u',
                  },
                  {
                    text: 'Artist V',
                    value: 'artist-v',
                  },
                  {
                    text: 'Artist W',
                    value: 'artist-w',
                  },
                  {
                    text: 'Artist X',
                    value: 'artist-x',
                  },
                  {
                    text: 'Artist Y',
                    value: 'artist-y',
                  },
                  {
                    text: 'Artist Z',
                    value: 'artist-z',
                  },
                ],
                clearable: true,
              },
            ],
            notes: [
              {
                id: 'e0f4909a-08c8-468c-82c8-aafdf7d888c0',
                type: 'text-field',
                label: 'Notes',
                value: '',
                minLines: 6,
                multiline: true,
              },
            ],
          },
          selector: {
            id: 'e2db6c13-6bdb-4731-8ad5-e05505565ca8',
            type: 'box-selector',
            state: null,
          },
        },
      ],
    },
  },
};

const AmesModel = Template.bind({});
AmesModel.args = {
  document: {
    document: {
      id: '7abd9702-d2ab-48ae-be6a-d6846c8371d7',
      type: 'entity',
      label: 'Massachusetts SCJ',
      description: 'Court records from the Massachusetts Superior Court of Judicature',
      properties: {
        Annotation: [
          {
            id: '2a085df9-d99a-4837-b15c-6876182abc4c',
            type: 'entity',
            label: 'Court Term Opening',
            pluralLabel: 'Court Term Openings',
            description:
              'Fields that pertain the a specific court term, e.g. time period, location, and participants (justices).',
            allowMultiple: true,
            properties: {
              'Court Term Participant': [
                {
                  id: '4eb59805-ba16-41b2-9db6-a515dd5e84ad',
                  type: 'text-field',
                  label: 'Court Term Participant',
                  value: '',
                  description:
                    'The name of a justice, juror, or other participant who is listed in the court term opening record, and the role that they play in the term.',
                  allowMultiple: true,
                  pluralField: 'Court Term Participants',
                },
              ],
              'Tribunal Name': [
                {
                  id: '9ac1ac61-bde3-414b-8a28-011388b8d41d',
                  type: 'text-field',
                  label: 'Tribunal Name',
                  value: '',
                  description: 'The name of the court, e.g. Massachusetts Superior Court of Judicature.',
                  selector: {
                    id: '9df4d9b0-d00f-4f89-b221-2924ac4f3362',
                    type: 'box-selector',
                    state: null,
                  },
                },
              ],
              'Term Month and Year': [
                {
                  id: '59b1a666-6822-45ea-8e0b-dc1caec07c01',
                  type: 'text-field',
                  label: 'Term Month and Year',
                  value: '',
                  description: 'The month and year in which the term began.',
                },
              ],
              'Term Location': [
                {
                  id: '8fe11655-614f-4035-9f65-893a56abcd64',
                  type: 'text-field',
                  label: 'Term Location',
                  value: '',
                  description: 'The City and County in which the court was held.',
                },
              ],
            },
            selector: {
              id: '71a1e07b-b5ac-44de-b6b9-2e94013dea39',
              type: 'box-selector',
              state: null,
            },
          },
        ],
        'General Proceeding': [
          {
            id: 'ec2fc563-6cb0-4080-a105-3b8cddb998a3',
            type: 'entity',
            label: 'General Proceeding',
            description: 'Fields which apply to any type of court proceeding.',
            properties: {
              'Important Event': [
                {
                  id: '379dddd7-8e26-4314-b577-17ff86f459b1',
                  type: 'text-field',
                  label: 'Important Event',
                  value: '',
                  description:
                    'The name (or general category) of an important event that has bearing on the court proceeding.  This field will frequently be left blank.',
                },
              ],
              'Proceeding Name': [
                {
                  id: '3d853156-0600-473b-9ea4-a5bc9077b8a0',
                  type: 'text-field',
                  label: 'Proceeding Name',
                  value: '',
                  description: 'The name of the proceeding as it appears in the margin of the court record',
                  selector: {
                    id: 'b5e1972a-8822-4ea6-a6d5-0179513abec2',
                    type: 'box-selector',
                    state: null,
                  },
                },
              ],
              'Party to the Proceeding': [
                {
                  id: 'a61ca096-459f-4dec-8348-ed7d591bb95b',
                  type: 'text-field',
                  label: 'Party to the Proceeding',
                  value: '',
                  description:
                    'The name of the person bring suit or defending the suit, therefore there will be two instances of this field. The field will contain the name of the person, their occupation (if known), and their primary role in the proceeding. The only roles that are valid for a civil proceeding are Appellant, Appellee, Complainant (Appellee), Defendant, Petitioner, and Plaintiff.  The roles that are valid for a criminal proceeding are Defendant, Plaintiff, Appellant, and Appellee.',
                  allowMultiple: true,
                  pluralField: 'Parties to the Proceeding',
                },
              ],
              'Proceeding Type': [
                {
                  id: '1ca7be2b-2109-420b-a3a6-5db82cc8c6a8',
                  type: 'dropdown-field',
                  label: 'Proceeding Type',
                  value: null,
                  options: [
                    {
                      text: 'Admission of Attorneys',
                      value: 'Admission of Attorneys',
                    },
                    {
                      text: 'Appeal [judges only]',
                      value: 'Appeal [judges only]',
                    },
                    {
                      text: 'Appeal by Review',
                      value: 'Appeal by Review',
                    },
                    {
                      text: 'Appeal by Chancery',
                      value: 'Appeal by Chancery',
                    },
                    {
                      text: 'Appeal with Jury',
                      value: 'Appeal with Jury',
                    },
                    {
                      text: 'Appeal with Referee',
                      value: 'Appeal with Referee',
                    },
                    {
                      text: 'Arraignment',
                      value: 'Arraignment',
                    },
                    {
                      text: 'Complaint for Failure to Prosecute',
                      value: 'Complaint for Failure to Prosecute',
                    },
                    {
                      text: 'Request for Discontinuance',
                      value: 'Request for Discontinuance',
                    },
                    {
                      text: 'Hearing',
                      value: 'Hearing',
                    },
                    {
                      text: 'Naturalization',
                      value: 'Naturalization',
                    },
                    {
                      text: 'Trial of First Instance',
                      value: 'Trial of First Instance',
                    },
                    {
                      text: 'Unknown',
                      value: 'Unknown',
                    },
                  ],
                  clearable: true,
                },
              ],
            },
            selector: {
              id: '11f57b79-eaef-4919-abad-3263b91fc71a',
              type: 'box-selector',
              state: null,
            },
          },
        ],
        'Civil Proceeding': [
          {
            id: '78a74d23-3e3b-4e04-9f6d-307beba33df2',
            type: 'entity',
            label: 'Civil Proceeding',
            properties: {
              'Proceeding Type': [
                {
                  id: '4b627fee-20c9-4a0e-a13a-a785e7d1be82',
                  type: 'dropdown-field',
                  label: 'Proceeding Type',
                  value: null,
                  options: [
                    {
                      text: 'Admission of Attorneys',
                      value: 'Admission of Attorneys',
                    },
                    {
                      text: 'Appeal (judges only)',
                      value: 'Appeal (judges only)',
                    },
                    {
                      text: 'Appeal by Review',
                      value: 'Appeal by Review',
                    },
                    {
                      text: 'Appeal by Chancery',
                      value: 'Appeal by Chancery',
                    },
                    {
                      text: 'Appeal with Jury',
                      value: 'Appeal with Jury',
                    },
                    {
                      text: 'Appeal with Referee',
                      value: 'Appeal with Referee',
                    },
                    {
                      text: 'Arraignment',
                      value: 'Arraignment',
                    },
                    {
                      text: 'Complaint for Failure to Prosecute',
                      value: 'Complaint for Failure to Prosecute',
                    },
                    {
                      text: 'Request for Discontinuance',
                      value: 'Request for Discontinuance',
                    },
                    {
                      text: 'Hearing',
                      value: 'Hearing',
                    },
                    {
                      text: 'Naturalization',
                      value: 'Naturalization',
                    },
                    {
                      text: 'Trial of First Instance',
                      value: 'Trial of First Instance',
                    },
                    {
                      text: 'Unknown',
                      value: 'Unknown',
                    },
                  ],
                },
              ],
              'Civil Proceeding Outcome': [
                {
                  id: '22bbc0c1-90e1-4226-9cf8-cbabc74dc735',
                  type: 'dropdown-field',
                  label: 'Civil Proceeding Outcome',
                  value: null,
                  options: [
                    {
                      text: 'Continued',
                      value: 'Continued',
                    },
                    {
                      text: 'Discontinuance Granted',
                      value: 'Discontinuance Granted',
                    },
                    {
                      text: 'Dismissed',
                      value: 'Dismissed',
                    },
                    {
                      text: 'Dismissed with Prejudice',
                      value: 'Dismissed with Prejudice',
                    },
                    {
                      text: 'Fine',
                      value: 'Fine',
                    },
                    {
                      text: 'Nonsuit - neither party appeared',
                      value: 'Nonsuit - neither party appeared',
                    },
                    {
                      text: 'Nonsuit - one or both parties deceased',
                      value: 'Nonsuit - one or both parties deceased',
                    },
                    {
                      text: 'Judgment Affirmed',
                      value: 'Judgment Affirmed',
                    },
                    {
                      text: 'Judgment Reversed',
                      value: 'Judgment Reversed',
                    },
                    {
                      text: 'Judgment Affirmed in Part & Reversed in Part',
                      value: 'Judgment Affirmed in Part & Reversed in Part',
                    },
                    {
                      text: 'Judgment for Defendant (trial of first instance)',
                      value: 'Judgment for Defendant (trial of first instance)',
                    },
                    {
                      text: 'Judgment for Plaintiff (trial of first instance)',
                      value: 'Judgment for Plaintiff (trial of first instance)',
                    },
                    {
                      text: 'Petition Granted',
                      value: 'Petition Granted',
                    },
                    {
                      text: 'Petition Denied',
                      value: 'Petition Denied',
                    },
                    {
                      text: 'Settled',
                      value: 'Settled',
                    },
                    {
                      text: 'Unknown',
                      value: 'Unknown',
                    },
                  ],
                },
              ],
              'Party to Civil Proceeding': [
                {
                  id: 'c8596da3-9cd9-40a5-b340-c5cca26023a4',
                  type: 'text-field',
                  label: 'Party to Civil Proceeding',
                  value: '',
                  allowMultiple: true,
                },
              ],
              'Damages and Costs': [
                {
                  id: '36033603-bc6d-44e1-8fc8-0d697e461e9e',
                  type: 'dropdown-field',
                  label: 'Damages and Costs',
                  value: null,
                  options: [
                    {
                      text: 'Small',
                      value: 'Small',
                    },
                    {
                      text: 'Moderate',
                      value: 'Moderate',
                    },
                    {
                      text: 'Large',
                      value: 'Large',
                    },
                    {
                      text: 'Very Large',
                      value: 'Very Large',
                    },
                    {
                      text: 'None',
                      value: 'None',
                    },
                    {
                      text: 'Unknown',
                      value: 'Unknown',
                    },
                  ],
                },
              ],
              'Significant Event': [
                {
                  id: 'b58f2814-bcef-4e99-8b86-73a1a0a9f153',
                  type: 'text-field',
                  label: 'Significant Event',
                  value: '',
                },
              ],
              'Civil Proceeding Name': [
                {
                  id: '95623481-43f6-4e3a-aa0a-ea5cba9d9da1',
                  type: 'text-field',
                  label: 'Civil Proceeding Name',
                  value: '',
                },
              ],
              'Civil Proceeding Type': [
                {
                  id: '686dc77e-9b4f-489e-9bd2-f7c79ed8aa01',
                  type: 'dropdown-field',
                  label: 'Civil Proceeding Type',
                  value: null,
                  options: [
                    {
                      text: 'Assistance',
                      value: 'Assistance',
                    },
                    {
                      text: 'Assumpsit',
                      value: 'Assumpsit',
                    },
                    {
                      text: 'Attachment',
                      value: 'Attachment',
                    },
                    {
                      text: 'Conversion',
                      value: 'Conversion',
                    },
                    {
                      text: 'Covenant',
                      value: 'Covenant',
                    },
                    {
                      text: 'Debt',
                      value: 'Debt',
                    },
                    {
                      text: 'Debt (bond)',
                      value: 'Debt (bond)',
                    },
                    {
                      text: 'Detinue',
                      value: 'Detinue',
                    },
                    {
                      text: 'Division of Real Estate',
                      value: 'Division of Real Estate',
                    },
                    {
                      text: 'Dower',
                      value: 'Dower',
                    },
                    {
                      text: 'Ejectment',
                      value: 'Ejectment',
                    },
                    {
                      text: 'Fiere facias (FiFa)',
                      value: 'Fiere facias (FiFa)',
                    },
                    {
                      text: 'Fraud',
                      value: 'Fraud',
                    },
                    {
                      text: 'Nuisance',
                      value: 'Nuisance',
                    },
                    {
                      text: 'Pleas of Account',
                      value: 'Pleas of Account',
                    },
                    {
                      text: 'Replevin',
                      value: 'Replevin',
                    },
                    {
                      text: 'Sale of Real Estate',
                      value: 'Sale of Real Estate',
                    },
                    {
                      text: 'Scrire facias (SciFa)',
                      value: 'Scrire facias (SciFa)',
                    },
                    {
                      text: 'Supersedeas',
                      value: 'Supersedeas',
                    },
                    {
                      text: 'Trespass',
                      value: 'Trespass',
                    },
                    {
                      text: 'Trespass on the Case (account)',
                      value: 'Trespass on the Case (account)',
                    },
                    {
                      text: 'Trespass on the Case (debt)',
                      value: 'Trespass on the Case (debt)',
                    },
                    {
                      text: 'Trespass on the Case (libel)',
                      value: 'Trespass on the Case (libel)',
                    },
                    {
                      text: 'Trespass on the Case (slander)',
                      value: 'Trespass on the Case (slander)',
                    },
                    {
                      text: 'Trover',
                      value: 'Trover',
                    },
                    {
                      text: 'Write of Assistance',
                      value: 'Write of Assistance',
                    },
                    {
                      text: 'Unknown',
                      value: 'Unknown',
                    },
                  ],
                },
              ],
            },
            selector: {
              id: '85fd97e1-89f2-4784-88f1-529f1e1a2c1f',
              type: 'box-selector',
              state: null,
            },
          },
        ],
        'Criminal Proceeding': [
          {
            id: '68dd068d-b0e0-48f8-8913-9ee2e8d780aa',
            type: 'entity',
            label: 'Criminal Proceeding',
            properties: {
              'Criminal Proceeding Outcome': [
                {
                  id: 'a30f94e1-4ca3-45b5-9cba-9c73bd756f57',
                  type: 'dropdown-field',
                  label: 'Criminal Proceeding Outcome',
                  value: null,
                  options: [
                    {
                      text: 'Acquitted',
                      value: 'Acquitted',
                    },
                    {
                      text: 'Affirmed',
                      value: 'Affirmed',
                    },
                    {
                      text: 'Continued',
                      value: 'Continued',
                    },
                    {
                      text: 'Convicted',
                      value: 'Convicted',
                    },
                    {
                      text: 'Discontinuance Granted',
                      value: 'Discontinuance Granted',
                    },
                    {
                      text: 'Dismissed',
                      value: 'Dismissed',
                    },
                    {
                      text: 'Reversed',
                      value: 'Reversed',
                    },
                    {
                      text: 'Unknown',
                      value: 'Unknown',
                    },
                  ],
                },
              ],
              'Proceeding Type': [
                {
                  id: 'e95a8178-3c3e-4cb5-816f-c9d2cdb26470',
                  type: 'dropdown-field',
                  label: 'Proceeding Type',
                  value: null,
                  options: [
                    {
                      text: 'Admission of Attorneys',
                      value: 'Admission of Attorneys',
                    },
                    {
                      text: 'Appeal (judges only)',
                      value: 'AdmissionAppeal (judges only)',
                    },
                    {
                      text: 'Appeal by Review',
                      value: 'Appeal by Review',
                    },
                    {
                      text: 'Appeal by Chancery',
                      value: 'Appeal by Chancery',
                    },
                    {
                      text: 'Appeal with Jury',
                      value: 'Appeal with Jury',
                    },
                    {
                      text: 'Appeal with Referee',
                      value: 'Appeal with Referee',
                    },
                    {
                      text: 'Arraignment',
                      value: 'Arraignment',
                    },
                    {
                      text: 'Complaint for Failure to Prosecute',
                      value: 'Complaint for Failure to Prosecute',
                    },
                    {
                      text: 'Request for Discontinuance',
                      value: 'Request for Discontinuance',
                    },
                    {
                      text: 'Hearing',
                      value: 'Hearing',
                    },
                    {
                      text: 'Naturalization',
                      value: 'Naturalization',
                    },
                    {
                      text: 'Trial of First Instance',
                      value: 'Trial of First Instance',
                    },
                    {
                      text: 'Unknown',
                      value: 'Unknown',
                    },
                  ],
                },
              ],
              'Criminal Proceeding Name': [
                {
                  id: '01b6ded9-8b3a-448a-afe1-22919b9478b4',
                  type: 'text-field',
                  label: 'Criminal Proceeding Name',
                  value: '',
                },
              ],
              'Corporal Punishment?': [
                {
                  id: '40228179-dbc3-4d94-a6d0-e2c38862ea0d',
                  type: 'checkbox-field',
                  label: 'Corporal Punishment?',
                  value: false,
                },
              ],
              'Party to Criminal Proceeding': [
                {
                  id: '4eac5558-2b30-49e7-a268-500eff8245dc',
                  type: 'text-field',
                  label: 'Party to Criminal Proceeding',
                  value: '',
                  allowMultiple: true,
                },
              ],
              'Fines and Costs': [
                {
                  id: '7df23d24-bd86-4938-9971-678dd915a73d',
                  type: 'dropdown-field',
                  label: 'Fines and Costs',
                  value: null,
                  options: [
                    {
                      text: 'Small',
                      value: 'Small',
                    },
                    {
                      text: 'Moderate',
                      value: 'Moderate',
                    },
                    {
                      text: 'Large',
                      value: 'Large',
                    },
                    {
                      text: 'Very Large',
                      value: 'Very Large',
                    },
                    {
                      text: 'None',
                      value: 'None',
                    },
                    {
                      text: 'Unknown',
                      value: 'Unknown',
                    },
                  ],
                },
              ],
              'Incarceration?': [
                {
                  id: '7b1b5760-711a-4711-ae89-281ff99d7450',
                  type: 'checkbox-field',
                  label: 'Incarceration?',
                  value: false,
                },
              ],
              'Criminal Proceeding Type': [
                {
                  id: '6b4658a2-35b1-4310-bc52-2dfc2331b58e',
                  type: 'dropdown-field',
                  label: 'Criminal Proceeding Type',
                  value: null,
                  options: [
                    {
                      text: 'Adultery',
                      value: 'Adultery',
                    },
                    {
                      text: 'Apostasy',
                      value: 'Apostasy',
                    },
                    {
                      text: 'Arson',
                      value: 'Arson',
                    },
                    {
                      text: 'Attempted Arson',
                      value: 'Attempted Arson',
                    },
                    {
                      text: 'Assault',
                      value: 'Assault',
                    },
                    {
                      text: 'Battery',
                      value: 'Battery',
                    },
                    {
                      text: 'Beastiality',
                      value: 'Beastiality',
                    },
                    {
                      text: 'Bigamy',
                      value: 'Bigamy',
                    },
                    {
                      text: 'Blackmail',
                      value: 'Blackmail',
                    },
                    {
                      text: 'Blasphemy',
                      value: 'Blasphemy',
                    },
                    {
                      text: 'Bribery',
                      value: 'Bribery',
                    },
                    {
                      text: 'Burglary',
                      value: 'Burglary',
                    },
                    {
                      text: 'Attempted Burglary',
                      value: 'Attempted Burglary',
                    },
                    {
                      text: 'Defamation',
                      value: 'Defamation',
                    },
                    {
                      text: 'Forgery',
                      value: 'Forgery',
                    },
                    {
                      text: 'Fornication',
                      value: 'Fornication',
                    },
                    {
                      text: 'Fraud',
                      value: 'Fraud',
                    },
                    {
                      text: 'Incest',
                      value: 'Incest',
                    },
                    {
                      text: 'Kidnapping',
                      value: 'Kidnapping',
                    },
                    {
                      text: 'Larceny',
                      value: 'Larceny',
                    },
                    {
                      text: 'Attempted Larceny',
                      value: 'Attempted Larceny',
                    },
                    {
                      text: 'Murder',
                      value: 'Murder',
                    },
                    {
                      text: 'Attempted Murder',
                      value: 'Attempted Murder',
                    },
                    {
                      text: 'Obscenity',
                      value: 'Obscenity',
                    },
                    {
                      text: 'Perjury',
                      value: 'Perjury',
                    },
                    {
                      text: 'Rape',
                      value: 'Rape',
                    },
                    {
                      text: 'Attempted Rape',
                      value: 'Attempted Rape',
                    },
                    {
                      text: 'Robbery',
                      value: 'Robbery',
                    },
                    {
                      text: 'Attempted Robbery',
                      value: 'Attempted Robbery',
                    },
                    {
                      text: 'Sodomy',
                      value: 'Sodomy',
                    },
                    {
                      text: 'Smuggling',
                      value: 'Smuggling',
                    },
                    {
                      text: 'Treason',
                      value: 'Treason',
                    },
                    {
                      text: 'Unknown',
                      value: 'Unknown',
                    },
                  ],
                },
              ],
              'Important Event': [
                {
                  id: '240dfc18-f7fe-45b0-98c7-152271ff718c',
                  type: 'text-field',
                  label: 'Important Event',
                  value: '',
                },
              ],
            },
            selector: {
              id: '30a3122a-5e9a-487a-ad81-e506583afe51',
              type: 'box-selector',
              state: null,
            },
          },
        ],
        Transcription: [
          {
            id: '0906cad5-42cc-4ce7-a54c-a75ffd8a8c29',
            type: 'text-field',
            label: 'Transcription',
            value: '',
            description: 'A single field that contains a digital copy of a hand-written court record.',
            selector: {
              id: '94af068a-3e9c-4239-abbb-36dce18a8b32',
              type: 'box-selector',
              state: null,
            },
            dataSources: ['plaintext-source'],
            minLines: 1,
            multiline: true,
            pluralField: 'Transcriptions',
          },
        ],
      },
    },
  },
};

export const OCRCorrectionModel = Template.bind({});
OCRCorrectionModel.args = {
  slotConfig: {
    components: slotConfig,
  },
  document: ocrCorrectionModel,
};

export const OCRCorrectionModelWithoutCustomisations = Template.bind({});
OCRCorrectionModelWithoutCustomisations.args = {
  document: ocrCorrectionModel,
};

// fixtures/01-basic/01-single-field.json
export const Basic01SingleField = Remote.bind({});
Basic01SingleField.args = {
  url: 'https://raw.githubusercontent.com/digirati-co-uk/capture-models/master/fixtures/01-basic/01-single-field.json',
};

// fixtures/01-basic/02-multiple-fields.json
export const Basic02MultipleFields = Remote.bind({});
Basic02MultipleFields.args = {
  url:
    'https://raw.githubusercontent.com/digirati-co-uk/capture-models/master/fixtures/01-basic/02-multiple-fields.json',
};

// fixtures/01-basic/03-multiple-choice.json
export const Basic03MultipleChoice = Remote.bind({});
Basic03MultipleChoice.args = {
  url:
    'https://raw.githubusercontent.com/digirati-co-uk/capture-models/master/fixtures/01-basic/03-multiple-choice.json',
};

// fixtures/01-basic/04-nested-choice.json
export const Basic04NestedChoice = Remote.bind({});
Basic04NestedChoice.args = {
  url: 'https://raw.githubusercontent.com/digirati-co-uk/capture-models/master/fixtures/01-basic/04-nested-choice.json',
};

// fixtures/01-basic/05-multiple-fields-multiple-values.json
export const Basic05MultipleFields = Remote.bind({});
Basic05MultipleFields.args = {
  url:
    'https://raw.githubusercontent.com/digirati-co-uk/capture-models/master/fixtures/01-basic/05-multiple-fields-multiple-values.json',
};

// fixtures/01-basic/06-single-field-value.json
export const Basic06SingleFieldValue = Remote.bind({});
Basic06SingleFieldValue.args = {
  url:
    'https://raw.githubusercontent.com/digirati-co-uk/capture-models/master/fixtures/01-basic/06-single-field-value.json',
};

// fixtures/01-basic/07-choice-example.json
export const Basic07ChoiceExample = Remote.bind({});
Basic07ChoiceExample.args = {
  url:
    'https://raw.githubusercontent.com/digirati-co-uk/capture-models/master/fixtures/01-basic/07-choice-example.json',
};

// fixtures/02-nesting/01-nested-model.json
export const Nesting01NestedModel = Remote.bind({});
Nesting01NestedModel.args = {
  url:
    'https://raw.githubusercontent.com/digirati-co-uk/capture-models/master/fixtures/02-nesting/01-nested-model.json',
};

// fixtures/02-nesting/02-nested-mixed.json
export const Nesting02NestedMix = Remote.bind({});
Nesting02NestedMix.args = {
  url:
    'https://raw.githubusercontent.com/digirati-co-uk/capture-models/master/fixtures/02-nesting/02-nested-mixed.json',
};

// fixtures/02-nesting/03-deeply-nested-subset.json
export const Nesting03DeeplyNestedSubset = Remote.bind({});
Nesting03DeeplyNestedSubset.args = {
  url:
    'https://raw.githubusercontent.com/digirati-co-uk/capture-models/master/fixtures/02-nesting/03-deeply-nested-subset.json',
};

// fixtures/02-nesting/04-deeply-nested-mixed-instance.json
export const Nesting04 = Remote.bind({});
Nesting04.args = {
  url:
    'https://raw.githubusercontent.com/digirati-co-uk/capture-models/master/fixtures/02-nesting/04-deeply-nested-mixed-instance.json',
};

// fixtures/02-nesting/05-nested-model-multiple.json
export const Nesting05 = Remote.bind({});
Nesting05.args = {
  url:
    'https://raw.githubusercontent.com/digirati-co-uk/capture-models/master/fixtures/02-nesting/05-nested-model-multiple.json',
};

// fixtures/02-nesting/06-ocr.json
export const Nesting06 = Remote.bind({});
Nesting06.args = {
  url: 'https://raw.githubusercontent.com/digirati-co-uk/capture-models/master/fixtures/02-nesting/06-ocr.json',
};

// fixtures/03-revisions/01-single-field-with-revision.json
export const Revisions01 = Remote.bind({});
Revisions01.args = {
  url:
    'https://raw.githubusercontent.com/digirati-co-uk/capture-models/master/fixtures/03-revisions/01-single-field-with-revision.json',
};

// fixtures/03-revisions/02-single-field-with-multiple-revisions.json
export const Revisions02 = Remote.bind({});
Revisions02.args = {
  url:
    'https://raw.githubusercontent.com/digirati-co-uk/capture-models/master/fixtures/03-revisions/02-single-field-with-multiple-revisions.json',
};

// fixtures/03-revisions/03-nested-revision.json
export const Revisions03 = Remote.bind({});
Revisions03.args = {
  url:
    'https://raw.githubusercontent.com/digirati-co-uk/capture-models/master/fixtures/03-revisions/03-nested-revision.json',
};

// fixtures/03-revisions/04-dual-transcription.json
export const Revisions04 = Remote.bind({});
Revisions04.args = {
  url:
    'https://raw.githubusercontent.com/digirati-co-uk/capture-models/master/fixtures/03-revisions/04-dual-transcription.json',
};

// fixtures/03-revisions/05-allow-multiple-transcriptions.json
export const Revisions05 = Remote.bind({});
Revisions05.args = {
  url:
    'https://raw.githubusercontent.com/digirati-co-uk/capture-models/master/fixtures/03-revisions/05-allow-multiple-transcriptions.json',
};

// fixtures/03-revisions/06-model-root.json
export const Revisions06 = Remote.bind({});
Revisions06.args = {
  url:
    'https://raw.githubusercontent.com/digirati-co-uk/capture-models/master/fixtures/03-revisions/06-model-root.json',
};

// fixtures/03-revisions/07-single-field-with-values.json
export const Revisions07 = Remote.bind({});
Revisions07.args = {
  url:
    'https://raw.githubusercontent.com/digirati-co-uk/capture-models/master/fixtures/03-revisions/07-single-field-with-values.json',
};

// fixtures/04-selectors/01-simple-selector.json
export const Selectors01 = Remote.bind({});
Selectors01.args = {
  url:
    'https://raw.githubusercontent.com/digirati-co-uk/capture-models/master/fixtures/04-selectors/01-simple-selector.json',
};

// fixtures/04-selectors/02-multiple-selectors.json
export const Selectors02 = Remote.bind({});
Selectors02.args = {
  url:
    'https://raw.githubusercontent.com/digirati-co-uk/capture-models/master/fixtures/04-selectors/02-multiple-selectors.json',
};

// fixtures/04-selectors/03-nested-selector.json
export const Selectors03 = Remote.bind({});
Selectors03.args = {
  url:
    'https://raw.githubusercontent.com/digirati-co-uk/capture-models/master/fixtures/04-selectors/03-nested-selector.json',
};

// fixtures/04-selectors/04-mulitple-nested-selectors.json
export const Selectors04 = Remote.bind({});
Selectors04.args = {
  url:
    'https://raw.githubusercontent.com/digirati-co-uk/capture-models/master/fixtures/04-selectors/04-mulitple-nested-selectors.json',
};

// fixtures/04-selectors/05-wunder-selector.json
export const Selectors05 = Remote.bind({});
Selectors05.args = {
  url:
    'https://raw.githubusercontent.com/digirati-co-uk/capture-models/master/fixtures/04-selectors/05-wunder-selector.json',
};

// fixtures/04-selectors/06-entity-selector.json
export const Selectors06 = Remote.bind({});
Selectors06.args = {
  url:
    'https://raw.githubusercontent.com/digirati-co-uk/capture-models/master/fixtures/04-selectors/06-entity-selector.json',
};

// fixtures/04-selectors/07-top-level-selector.json
export const Selectors07 = Remote.bind({});
Selectors07.args = {
  url:
    'https://raw.githubusercontent.com/digirati-co-uk/capture-models/master/fixtures/04-selectors/07-top-level-selector.json',
};

// fixtures/04-selectors/08-hocr-output.json
export const Selectors08 = Remote.bind({});
Selectors08.args = {
  url:
    'https://raw.githubusercontent.com/digirati-co-uk/capture-models/master/fixtures/04-selectors/08-hocr-output.json',
};

// fixtures/05-profiles/01-comments.json
export const Profiles01 = Remote.bind({});
Profiles01.args = {
  url: 'https://raw.githubusercontent.com/digirati-co-uk/capture-models/master/fixtures/05-profiles/01-comments.json',
};

// fixtures/05-profiles/02-tabs.json
export const Profiles02 = Remote.bind({});
Profiles02.args = {
  url: 'https://raw.githubusercontent.com/digirati-co-uk/capture-models/master/fixtures/05-profiles/02-tabs.json',
};

// fixtures/05-profiles/03-listing.json
export const Profiles03 = Remote.bind({});
Profiles03.args = {
  url: 'https://raw.githubusercontent.com/digirati-co-uk/capture-models/master/fixtures/05-profiles/03-listing.json',
};

// fixtures/05-profiles/04-transcription.json
export const Profiles04 = Remote.bind({});
Profiles04.args = {
  url:
    'https://raw.githubusercontent.com/digirati-co-uk/capture-models/master/fixtures/05-profiles/04-transcription.json',
};

// fixtures/05-profiles/05-tagging.json
export const Profiles05 = Remote.bind({});
Profiles05.args = {
  url: 'https://raw.githubusercontent.com/digirati-co-uk/capture-models/master/fixtures/05-profiles/05-tagging.json',
};

// // fixtures/97-bugs/02-selector-nuking.json
// export const Basic01SingleField = Remote.bind({});
// Basic01SingleField.args = {
//   url:
//     'https://raw.githubusercontent.com/digirati-co-uk/capture-models/master/fixtures/97-bugs/02-selector-nuking.json',
// };
//
// // fixtures/97-bugs/02-selector-nuking-bad-revision.json
// export const Basic01SingleField = Remote.bind({});
// Basic01SingleField.args = {
//   url:
//     'https://raw.githubusercontent.com/digirati-co-uk/capture-models/master/fixtures/97-bugs/02-selector-nuking-bad-revision.json',
// };
//
// // fixtures/97-bugs/02-selector-nuking-revision.json
// export const Basic01SingleField = Remote.bind({});
// Basic01SingleField.args = {
//   url:
//     'https://raw.githubusercontent.com/digirati-co-uk/capture-models/master/fixtures/97-bugs/02-selector-nuking-revision.json',
// };
//
// // fixtures/97-bugs/03-delete-entity.json
// export const Basic01SingleField = Remote.bind({});
// Basic01SingleField.args = {
//   url: 'https://raw.githubusercontent.com/digirati-co-uk/capture-models/master/fixtures/97-bugs/03-delete-entity.json',
// };
//
// // fixtures/97-bugs/03-delete-entity-req.json
// export const Basic01SingleField = Remote.bind({});
// Basic01SingleField.args = {
//   url:
//     'https://raw.githubusercontent.com/digirati-co-uk/capture-models/master/fixtures/97-bugs/03-delete-entity-req.json',
// };
//
// // fixtures/97-bugs/04-missing-selector.json
// export const Basic01SingleField = Remote.bind({});
// Basic01SingleField.args = {
//   url:
//     'https://raw.githubusercontent.com/digirati-co-uk/capture-models/master/fixtures/97-bugs/04-missing-selector.json',
// };
//
// // fixtures/97-bugs/04-source.json
// export const Basic01SingleField = Remote.bind({});
// Basic01SingleField.args = {
//   url: 'https://raw.githubusercontent.com/digirati-co-uk/capture-models/master/fixtures/97-bugs/04-source.json',
// };
//
// // fixtures/98-revision-requests/add-ocr-line.json
// export const Basic01SingleField = Remote.bind({});
// Basic01SingleField.args = {
//   url:
//     'https://raw.githubusercontent.com/digirati-co-uk/capture-models/master/fixtures/98-revision-requests/add-ocr-line.json',
// };
//
// // fixtures/98-revision-requests/add-ocr-text.json
// export const Basic01SingleField = Remote.bind({});
// Basic01SingleField.args = {
//   url:
//     'https://raw.githubusercontent.com/digirati-co-uk/capture-models/master/fixtures/98-revision-requests/add-ocr-text.json',
// };
