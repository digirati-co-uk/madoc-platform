import {Revisions} from '../../src/frontend/shared/capture-models/editor/stores/revisions/index';
import { URLContextExplorer } from '../../src/frontend/shared/components/ContentExplorer';
import * as React from 'react';
import { TinyButton } from '../../src/frontend/shared/navigation/Button';
import { text } from '@storybook/addon-knobs';
import { RevisionNavigation } from '../../src/frontend/shared/capture-models/RevisionNavigation';
import { VaultProvider } from 'react-iiif-vault';
import { ViewExternalContent } from '../../src/frontend/shared/components/ViewExternalContent';
import '../../src/frontend/shared/capture-models/refinements/index';

export default { title: 'Legacy/Capture models' };

const exampleModel: any = {
  id: '0e1cf2ad-6a8a-4a50-93dc-147c78c107a5',
  structure: {
    id: 'd2fc5e9f-b234-4e0f-8e6d-152c666d4a6d',
    type: 'choice',
    label: 'Testing this change ',
    items: [
      {
        id: '1f49d09c-c55e-407e-b25c-4c4cc58086b1',
        type: 'model',
        label: 'test 2 3 4',
        fields: [
          ['paragraph', [
            ['lines', ['text']],
          ]],
        ],
      },
    ],
  },
  document: {
    id: '1a87e8f3-84d7-4c8e-b48f-c88dca685418',
    type: 'entity',
    label: 'Untitled document',
    properties: {
      paragraph: [{
        'allowMultiple': true,
        'description': 'Region of the page denoting a single paragraph',
        'id': 'ac582375-e2c6-47be-aa9e-0aea1e8a0e1f',
        'label': 'Paragraph',
        'labelledBy': 'lines',
        'pluralLabel': 'Paragraphs',
        'properties': {
          'lines': [{
            'allowMultiple': true,
            'description': 'All of the lines inside of a paragraph',
            'id': 'edd85199-61e8-4917-8850-b0aa1aaa5dfa',
            'label': 'Line',
            'labelledBy': 'text',
            'pluralLabel': 'Lines',
            'properties': {
              'text': [{
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '0ff256d9-bd7b-46da-aedc-d566b0e346ec',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',
                'selector': {
                  'id': 'df5e77b6-4b92-480f-8229-3ec08fae6095',
                  'state': { 'height': '50', 'width': '172', 'x': '111', 'y': '177' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Schon',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '24e9f410-8e17-45df-9244-56e5b616cbe6',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',
                'selector': {
                  'id': '603e79cc-0756-45e7-9490-002ad6fa32a4',
                  'state': { 'height': '50', 'width': '85', 'x': '324', 'y': '178' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'die',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'cdfb8ff2-6765-46f4-9dd4-2e0cc5257091',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',
                'selector': {
                  'id': 'c2647f7c-1da1-4514-aa3e-eb4fcedd749e',
                  'state': { 'height': '50', 'width': '300', 'x': '449', 'y': '178' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Gelehrten',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '36b8ce55-06b8-47b8-8412-75fff391f853',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',
                'selector': {
                  'id': '081fc4eb-be5c-478a-a010-53a1deeb0c72',
                  'state': { 'height': '44', 'width': '376', 'x': '789', 'y': '197' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'vergangener',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'a4716d5c-63dd-4c41-8b69-615e32dabcb9',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',
                'selector': {
                  'id': 'dfc8d959-2d14-453e-8bf5-9f4fb731b2e8',
                  'state': { 'height': '49', 'width': '190', 'x': '1203', 'y': '178' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Zeiten',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '87913150-cd8b-4bc2-bb27-c6aa657fcf58',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',
                'selector': {
                  'id': '84aadba1-c3d8-4013-b8fc-fb7ccf9363f2',
                  'state': { 'height': '50', 'width': '178', 'x': '1432', 'y': '176' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'haben',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '4f41fd3b-5e9b-4cce-a35a-c5e567344953',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',
                'selector': {
                  'id': '5ecdbd03-628e-4672-bf1e-6f9fb93e3873',
                  'state': { 'height': '51', 'width': '106', 'x': '1650', 'y': '175' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'sich',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '83bdffc8-674a-42bd-bfbf-3da689317219',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',
                'selector': {
                  'id': '36b312bc-eeb5-4a94-96b5-5d4b5e3f67a3',
                  'state': { 'height': '49', 'width': '82', 'x': '1797', 'y': '174' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'oft',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '53fb4748-95d1-4c82-ad9e-2f998f0a2502',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',
                'selector': {
                  'id': 'be77a759-75af-4286-8982-66aa11b53ff6',
                  'state': { 'height': '50', 'width': '113', 'x': '1920', 'y': '173' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'und',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '0b94b23a-b4d0-4599-884e-84f4fd18edf0',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',
                'selector': {
                  'id': '798666b9-02e8-49c4-8b4a-ed23fe26b176',
                  'state': { 'height': '63', 'width': '182', 'x': '2071', 'y': '171' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'h\u00e4ufig',
              }],
            },
            'selector': {
              'id': '1c95ec65-d37f-4f47-a7bc-ac34dcf00ecd',
              'state': { 'height': '70', 'width': '2142', 'x': '111', 'y': '171' },
              'type': 'box-selector',
            },
            'type': 'entity',
          }, {
            'allowMultiple': true,
            'description': 'All of the lines inside of a paragraph',
            'id': 'fb29620d-dee5-4521-8d2c-293c6d8e4dbf',
            'label': 'Line',
            'labelledBy': 'text',
            'pluralLabel': 'Lines',
            'properties': {
              'text': [{
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'fee3bc44-81ac-41d0-b208-01c22221bf0f',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',
                'selector': {
                  'id': '1f75bdde-8fde-42c0-b444-4657906ba08f',
                  'state': { 'height': '51', 'width': '106', 'x': '113', 'y': '250' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'den',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '20ad5208-11c2-441f-a825-03aa15698de0',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',
                'selector': {
                  'id': 'bc44c2db-b6cb-496a-8d11-b12af23123c0',
                  'state': { 'height': '65', 'width': '156', 'x': '257', 'y': '249' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Kopf',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'cf868222-9a3c-4b1b-9002-483c978ea4bf',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '7d50496b-b629-45d3-aa12-3a16d59916bd',
                  'state': { 'height': '49', 'width': '240', 'x': '455', 'y': '251' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'dar\u00fcber',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'c022a686-b329-419f-a23f-7102dcc9820a',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'e0a98dfc-8a61-41a9-b08f-644dad8e8c7a',
                  'state': { 'height': '60', 'width': '348', 'x': '734', 'y': '250' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'zerbrochen,',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '7a2a9b24-bf0e-4af4-adf6-4cdd3033f7cf',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'feeebf54-937d-4a6d-b83b-4ed09685f3f9',
                  'state': { 'height': '30', 'width': '80', 'x': '1123', 'y': '269' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'wo',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '92fc779a-675a-452d-a404-3444c6da8b00',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'ea0bdfd2-9d5c-401b-9e99-7eb4a45485ba',
                  'state': { 'height': '49', 'width': '144', 'x': '1247', 'y': '249' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'wohl',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '726700e9-a4d8-41c8-bfc3-f8ec254b7e1c',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'bbb6af59-f9b3-4d63-983a-f4d6b7aa8581',
                  'state': { 'height': '49', 'width': '93', 'x': '1434', 'y': '249' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'das',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '3704c8fd-4eb0-4a68-a6d6-83cbc284b816',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'a5ab2333-1bf4-41f5-bd21-9d3ee51d2afd',
                  'state': { 'height': '63', 'width': '211', 'x': '1568', 'y': '248' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Erbgut',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '6ac377f1-0f67-45ae-96b2-d586847a5fe4',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'bed24df8-3cdd-4e8a-b8b1-94879f066512',
                  'state': { 'height': '50', 'width': '218', 'x': '1821', 'y': '246' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'stecken',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '4359fe93-8701-456f-b062-bbf3cad98488',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'f3447db3-580b-45da-b78b-78f8fcedf439',
                  'state': { 'height': '59', 'width': '177', 'x': '2077', 'y': '249' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'm\u00f6ge,',
              }],
            },

            'selector': {
              'id': '3202b599-9433-45de-a608-c91fa8f1edfb',
              'state': { 'height': '68', 'width': '2141', 'x': '113', 'y': '246' },
              'type': 'box-selector',
            },
            'type': 'entity',
          }, {
            'allowMultiple': true,
            'description': 'All of the lines inside of a paragraph',
            'id': '022c8cca-7382-41d8-9105-0f03471f68bf',
            'label': 'Line',
            'labelledBy': 'text',
            'pluralLabel': 'Lines',
            'properties': {
              'text': [{
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'cbf687e3-f2d7-4a34-aaee-e694ec54e563',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'b18dbffa-df15-4070-b082-fa1f2b6f2f65',
                  'state': { 'height': '51', 'width': '93', 'x': '113', 'y': '322' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'das',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '064bf6be-cc2c-438c-9368-73eb804da048',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '01043b00-5522-4d8a-854c-9587d30c560e',
                  'state': { 'height': '49', 'width': '146', 'x': '253', 'y': '323' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'diese',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'fa0d7652-1391-47ea-89d9-ba94a4f53286',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'c3f933ae-0fe2-4baa-9344-799e17838fc1',
                  'state': { 'height': '56', 'width': '350', 'x': '446', 'y': '316' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': '\u00c4hnlichkeit',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'bfdad4e3-81ed-4ad9-9e57-e72ec5920eda',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'afa8b9d6-317b-4800-90a8-d7b5a402d34a',
                  'state': { 'height': '29', 'width': '107', 'x': '840', 'y': '343' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'von',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '9e02f546-78aa-45ae-9142-836c80b0329e',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'b39ea9d6-e067-4ccb-b9b6-968b317f071d',
                  'state': { 'height': '50', 'width': '335', 'x': '993', 'y': '322' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Gro\u00dfeltern',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '662f6732-e557-41ee-be2b-cb47369e8453',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '6d4c34e7-e856-4d9e-97a1-588498f4b24c',
                  'state': { 'height': '28', 'width': '66', 'x': '1372', 'y': '342' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'zu',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '480d550f-ac1c-4e33-a9f3-8ac40e913c3e',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '02c896b2-1b6f-4957-a081-1b50adaf7110',
                  'state': { 'height': '58', 'width': '209', 'x': '1483', 'y': '321' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Eltern,',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'f3b01780-d446-4529-94af-6fae536e9cc1',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'a229f8e7-3b01-4fc9-b406-4200b61822a2',
                  'state': { 'height': '29', 'width': '66', 'x': '1737', 'y': '339' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'zu',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '659827e9-2761-4b89-ad15-80dbc7d006ad',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '68d6abd6-93ac-4608-a3c6-e2b183f1680a',
                  'state': { 'height': '51', 'width': '253', 'x': '1846', 'y': '317' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Kindern',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '1380502f-fbc0-47ee-a9f7-3eb47b9fbec9',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '35d55dd9-3461-4962-88d6-36b57a0ac203',
                  'state': { 'height': '50', 'width': '113', 'x': '2142', 'y': '315' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'und',
              }],
            },

            'selector': {
              'id': '6765518b-3509-4fd2-942e-bfc9913cf423',
              'state': { 'height': '64', 'width': '2142', 'x': '113', 'y': '315' },
              'type': 'box-selector',
            },
            'type': 'entity',
          }, {
            'allowMultiple': true,
            'description': 'All of the lines inside of a paragraph',
            'id': 'e81cdd7c-45dd-465d-8fac-8c8347bb148e',
            'label': 'Line',
            'labelledBy': 'text',
            'pluralLabel': 'Lines',
            'properties': {
              'text': [{
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '782075d9-8a10-445c-b3fd-5efa230d1216',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '16fe740a-5da2-4b86-82f3-7aa012073ced',
                  'state': { 'height': '50', 'width': '454', 'x': '112', 'y': '395' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Kindeskindern',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '5ba52cb1-44ff-4a5d-a492-22e0c12b8256',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'af6709a7-077a-424c-aaf1-fc888fcd7d58',
                  'state': { 'height': '64', 'width': '253', 'x': '590', 'y': '395' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'bewirkt,',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '74628e35-91e0-4633-b716-34a4361784bf',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'beda9659-443c-4a9a-a178-81ea908e5ba6',
                  'state': { 'height': '49', 'width': '113', 'x': '868', 'y': '395' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'und',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '169defb2-f675-45d0-8fa8-5f52c74347aa',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '6873077a-7e65-4b84-929b-eb0bc1f662f7',
                  'state': { 'height': '47', 'width': '75', 'x': '1009', 'y': '397' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'sie',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '99878938-76ff-481a-9f37-03a7dc6bfa02',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '64ffad60-ef78-4a21-88d3-2b51c80260bf',
                  'state': { 'height': '49', 'width': '230', 'x': '1112', 'y': '394' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'dachten',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '70fa4aac-5861-430e-89f6-b64d670fd213',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'fe54fd4c-8edb-4524-838e-5e4da126012f',
                  'state': { 'height': '49', 'width': '130', 'x': '1370', 'y': '394' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'auch',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '233bc6d0-be49-46bf-a31b-73ee9dc346bc',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '9b64389f-79e7-4936-b2f6-2c835e30bf7d',
                  'state': { 'height': '49', 'width': '162', 'x': '1527', 'y': '393' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'schon',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'c162fc08-b5cf-472f-8f2e-1c3b250c0a99',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '14c7cc67-0a60-452c-99d4-3c7ac2e2daa6',
                  'state': { 'height': '52', 'width': '240', 'x': '1716', 'y': '390' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'dar\u00fcber',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '03305302-cfaa-43ae-a81a-8d0edd864a11',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '8c4ea4b3-639a-401a-9bda-602945529119',
                  'state': { 'height': '59', 'width': '152', 'x': '1980', 'y': '390' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'nach,',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '6d712915-f41d-4a3e-b64f-1f485a73c2af',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '098aa493-5a27-4a84-a2ad-9b011d94e1fc',
                  'state': { 'height': '49', 'width': '94', 'x': '2161', 'y': '389' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'auf',
              }],
            },

            'selector': {
              'id': '46aaf834-396d-4a59-b574-a36d21f826e8',
              'state': { 'height': '70', 'width': '2143', 'x': '112', 'y': '389' },
              'type': 'box-selector',
            },
            'type': 'entity',
          }, {
            'allowMultiple': true,
            'description': 'All of the lines inside of a paragraph',
            'id': '0b46a786-579c-4322-93b0-db9fbd39e04e',
            'label': 'Line',
            'labelledBy': 'text',
            'pluralLabel': 'Lines',
            'properties': {
              'text': [{
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'fd11fafc-8901-4c32-879b-81a3ee8fb9fa',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '2cb7e2ad-776f-4791-b6ab-ac8c634e59f1',
                  'state': { 'height': '51', 'width': '196', 'x': '112', 'y': '466' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'welche',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'd4fd88df-b771-42bd-9a7f-afb61f1cd78e',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '67d4226d-c95e-42d2-b679-fe5031fbaa00',
                  'state': { 'height': '50', 'width': '178', 'x': '353', 'y': '467' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Weise',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '0429bba0-3bbb-494e-a2d4-4751431573dc',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '5c228907-f67d-403e-a2c3-22c88bcd20af',
                  'state': { 'height': '50', 'width': '147', 'x': '577', 'y': '467' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'diese',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '7888d019-9d9d-49c4-abd8-cd3a79d9c3d4',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '46872b6b-70ac-4f2b-8d1e-0f3baca9258d',
                  'state': { 'height': '55', 'width': '351', 'x': '768', 'y': '461' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': '\u00c4hnlichkeit',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '5563e0f6-cc4b-4c39-afe7-c7520be9ab84',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'd7af7b53-5d89-47f4-ba56-f9ec8a0e3140',
                  'state': { 'height': '65', 'width': '466', 'x': '1162', 'y': '464' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'hervorgebracht',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '4eef2811-d715-49a5-b034-4457bffec76f',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '4cd9976d-a966-4c13-aec6-c207a5565e5f',
                  'state': { 'height': '59', 'width': '207', 'x': '1670', 'y': '463' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'werde;',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '70fc3559-53ae-46b7-8b13-0cb5fa8ccc2c',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'd0021383-4465-4189-a27a-d6e22eea3e39',
                  'state': { 'height': '49', 'width': '84', 'x': '1922', 'y': '463' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'oft',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '27bf9299-8a19-4fa7-8614-ad41b450d704',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '8c85cc67-db21-4320-b6bc-8a6e1c58862e',
                  'state': { 'height': '50', 'width': '205', 'x': '2050', 'y': '461' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'scheint',
              }],
            },

            'selector': {
              'id': 'bed7c509-8def-4806-a518-0f86766fc218',
              'state': { 'height': '68', 'width': '2143', 'x': '112', 'y': '461' },
              'type': 'box-selector',
            },
            'type': 'entity',
          }, {
            'allowMultiple': true,
            'description': 'All of the lines inside of a paragraph',
            'id': '89ba9bec-d13c-434d-bbbe-6a6caf6844b4',
            'label': 'Line',
            'labelledBy': 'text',
            'pluralLabel': 'Lines',
            'properties': {
              'text': [{
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'b2f05294-107a-4ce2-bf92-e954b5b2e3a1',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '2a8cc4c3-1b2a-47bf-a2cb-dfeff9c85dea',
                  'state': { 'height': '50', 'width': '92', 'x': '114', 'y': '540' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'das',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '32fc85cd-808d-4cc1-92d8-2903b76d5c3e',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'f59addc2-4f08-43fb-9e48-8e225a685994',
                  'state': { 'height': '63', 'width': '211', 'x': '251', 'y': '540' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Erbgut',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '45444df2-4384-40b2-a659-6f021a7e7993',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '46d34176-90a1-44be-b083-ed5de00a24f9',
                  'state': { 'height': '49', 'width': '230', 'x': '506', 'y': '540' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'n\u00e4mlich',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '201bd7eb-6ec3-4381-a368-d4c4fde1d299',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '8600263e-cfa6-4549-8d1d-e4a4affb2961',
                  'state': { 'height': '46', 'width': '55', 'x': '781', 'y': '542' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'in',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '9224483c-9a94-4bdf-9ac9-1c04286a3b1c',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'c52fe460-23b3-4021-a987-bf2b0014f6a9',
                  'state': { 'height': '64', 'width': '270', 'x': '883', 'y': '539' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'geradezu',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'b24a39cf-1862-47ed-8272-eb18a5311d90',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '91928fe9-7604-4fae-9668-5832a4d7da90',
                  'state': { 'height': '51', 'width': '396', 'x': '1198', 'y': '537' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'wunderbarer',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '4af82b4f-d722-4c56-940f-acf5665e26f0',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'f61c09da-1775-46f9-a5a8-1a0b6db322a1',
                  'state': { 'height': '50', 'width': '179', 'x': '1640', 'y': '536' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Weise',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '9f7815a6-2305-4437-b416-cb317f870ca0',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'eb3d1a05-d609-4fd3-985b-f1e1335a0208',
                  'state': { 'height': '43', 'width': '167', 'x': '1867', 'y': '554' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'ganze',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '4f1b18e0-2fb7-448b-87bd-4f87151209c6',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'a6574bc0-d09e-45e6-9dba-a68b6a9b5d1b',
                  'state': { 'height': '50', 'width': '172', 'x': '2082', 'y': '534' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Gene\u00ac',
              }],
            },

            'selector': {
              'id': '64a975bd-5776-497f-b94f-793a972b2e40',
              'state': { 'height': '69', 'width': '2140', 'x': '114', 'y': '534' },
              'type': 'box-selector',
            },
            'type': 'entity',
          }, {
            'allowMultiple': true,
            'description': 'All of the lines inside of a paragraph',
            'id': 'eb386139-a359-4b0e-a363-6b6e8d0368f4',
            'label': 'Line',
            'labelledBy': 'text',
            'pluralLabel': 'Lines',
            'properties': {
              'text': [{
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '8665a288-d8ea-42ab-945d-24958bebbdd5',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'd52c0d5f-f29c-4e86-a4b1-dc3e103368c8',
                  'state': { 'height': '47', 'width': '252', 'x': '114', 'y': '615' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'rationen',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'c46b1c4f-9767-4778-8282-21a7abc336c0',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '60a8a713-0c6c-4689-9e6f-43cec7d6ce67',
                  'state': { 'height': '29', 'width': '66', 'x': '396', 'y': '632' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'zu',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '2b0c6e18-2cbd-4d34-a62a-c55c13b3cd3c',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '785018a4-c3dd-4c2b-aca9-3fa0b24792af',
                  'state': { 'height': '63', 'width': '418', 'x': '493', 'y': '612' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': '\u00fcberspringen,',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '307bec04-a89e-4413-a292-01411b4af75b',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '65b0ec71-8186-4eb5-b9cc-a527e9200518',
                  'state': { 'height': '49', 'width': '143', 'x': '944', 'y': '612' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'dann',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '17244267-d818-437c-880e-b7732d2ac168',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '668aff62-3d4d-4602-9b07-6a1b0f6586ab',
                  'state': { 'height': '49', 'width': '129', 'x': '1121', 'y': '612' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'aber',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'a759d85d-745c-4d9d-a9c1-fc8c59e818ad',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '63c56cab-3090-4fb5-a098-5011b8b563bb',
                  'state': { 'height': '48', 'width': '115', 'x': '1281', 'y': '612' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'l\u00e4\u00dft',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '1295144e-b478-4f03-9a8f-3efd396cde96',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'f849d7a2-57f0-4b41-aed7-dcc5a43b9a00',
                  'state': { 'height': '30', 'width': '53', 'x': '1430', 'y': '630' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'es',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '06ba43d2-c98f-402d-88aa-e6cd704a6c5b',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'c2fb011d-b478-4a79-b1e2-e3e6329143e3',
                  'state': { 'height': '48', 'width': '94', 'x': '1517', 'y': '611' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'auf',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'e2f073f1-81a7-4cda-84ec-a836a6e0ade2',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '0fdc824d-6206-43f9-a93e-fd79a0090c39',
                  'state': { 'height': '51', 'width': '200', 'x': '1642', 'y': '607' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'einmal',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'e2b36f6e-689b-493c-8a0f-02f6bfab8103',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '99c671bf-a94e-4dae-a092-99069464e8d8',
                  'state': { 'height': '50', 'width': '103', 'x': '1875', 'y': '607' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'den',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '09b75cd0-64cd-445d-9599-e62ac629ce7b',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '4689840a-6d5a-4fee-9082-9ae7e58dc698',
                  'state': { 'height': '51', 'width': '247', 'x': '2009', 'y': '606' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Urenkel',
              }],
            },

            'selector': {
              'id': '836f6dea-ad7c-43a8-b564-6f73060c3071',
              'state': { 'height': '69', 'width': '2142', 'x': '114', 'y': '606' },
              'type': 'box-selector',
            },
            'type': 'entity',
          }, {
            'allowMultiple': true,
            'description': 'All of the lines inside of a paragraph',
            'id': 'c8434a0d-3257-4d51-a657-c69da2185fd6',
            'label': 'Line',
            'labelledBy': 'text',
            'pluralLabel': 'Lines',
            'properties': {
              'text': [{
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'c179800f-8a16-4150-96f6-b3b2a1da076b',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '22ae2da0-806d-4159-9925-a4ebb64b1537',
                  'state': { 'height': '49', 'width': '120', 'x': '114', 'y': '686' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'aufs',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'e5b936ad-91c8-4f33-bccf-9667ff63db98',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '2bc62fec-8221-46ba-90b5-947935d3c17a',
                  'state': { 'height': '51', 'width': '436', 'x': '282', 'y': '684' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'verbl\u00fcffendste',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'f1f0b2fb-80ca-475a-9ac6-0b70cdc13076',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '4ea68b54-7366-43ea-a6c3-70787b01436a',
                  'state': { 'height': '49', 'width': '122', 'x': '768', 'y': '685' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'dem',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '3b74fe58-5e59-45e6-b228-d1f06f768a74',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '622e5170-7149-4cd5-9c19-88dfb3cf1c21',
                  'state': { 'height': '50', 'width': '191', 'x': '937', 'y': '684' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Urahn',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '8b6485dd-c3e4-47c8-9b71-f7f066d404bb',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'a6ea3d9c-605e-417e-923f-fed8712c8843',
                  'state': { 'height': '66', 'width': '254', 'x': '1176', 'y': '682' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'gleichen.',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'c1f85d88-74fe-48c3-bb73-a58c19f04128',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'f6c83945-f090-42db-8c41-1a1e741ef4fc',
                  'state': { 'height': '49', 'width': '102', 'x': '1480', 'y': '683' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Die',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '85401a69-75a0-4c10-aecf-66ac6559114e',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '1e7e0a5e-0656-40c4-b628-a68d952a5464',
                  'state': { 'height': '62', 'width': '436', 'x': '1631', 'y': '681' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Bildergalerien',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '1c9570fb-eaea-4be3-8783-c97fb459cf87',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '6778d02d-b1ca-40f3-9f12-27c319fa9ee6',
                  'state': { 'height': '49', 'width': '138', 'x': '2117', 'y': '680' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'alter',
              }],
            },

            'selector': {
              'id': '31a7c047-9eea-4120-ae58-b87c25520ca1',
              'state': { 'height': '68', 'width': '2141', 'x': '114', 'y': '680' },
              'type': 'box-selector',
            },
            'type': 'entity',
          }, {
            'allowMultiple': true,
            'description': 'All of the lines inside of a paragraph',
            'id': '69b58773-f418-4091-a3e0-72d09886f66f',
            'label': 'Line',
            'labelledBy': 'text',
            'pluralLabel': 'Lines',
            'properties': {
              'text': [{
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'f097c9f7-1f78-4b4b-a877-27a4e9b51a22',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '6be8e236-ff0b-4e3a-8399-95073a3318e7',
                  'state': { 'height': '50', 'width': '262', 'x': '115', 'y': '756' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'F\'amilien',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '0fe4b60f-1d61-4cd7-9050-11f7dadb073a',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '421a283b-9419-473a-9689-ad173c4aaeac',
                  'state': { 'height': '50', 'width': '186', 'x': '407', 'y': '757' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'bieten',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '41731de1-21a7-4334-92eb-49a5cfcdeb73',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '74085636-119b-4a50-aa16-0d3ccad2a4b4',
                  'state': { 'height': '50', 'width': '140', 'x': '624', 'y': '757' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'viele',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'c5e28398-9cdd-47dd-bcd0-e91694672d5a',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'f12e7569-5709-42f4-95c8-524803373ce6',
                  'state': { 'height': '63', 'width': '272', 'x': '795', 'y': '757' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Beispiele',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '90b596cc-03f8-48ea-bc2b-31ce56b1f26d',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '83b963a4-8189-4885-aef0-b0ab72ac1b69',
                  'state': { 'height': '49', 'width': '92', 'x': '1099', 'y': '757' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'f\u00fcr',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'd1aa46f2-69be-40d1-a0ac-3653768d56e6',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '6f985f8f-3e5e-4245-9c1f-4f9f2653446e',
                  'state': { 'height': '49', 'width': '146', 'x': '1224', 'y': '757' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'diese',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'bde3bec4-9139-45e7-9805-89f2bc9fd34a',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'bf8c09ff-21ab-4aa2-9ff9-dd7fe9853407',
                  'state': { 'height': '66', 'width': '519', 'x': '1403', 'y': '752' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Sprunghaftigkeit',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '8f307a77-290e-4982-b3d8-c8735b50125b',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'afc5371a-4a16-4a35-b164-b7566d52764b',
                  'state': { 'height': '49', 'width': '95', 'x': '1956', 'y': '753' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'der',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '44bc6ca7-9e3d-46b2-97cf-c82e4a0af664',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '1bc2c622-aa5f-4316-8eb9-3e58ecb50bc7',
                  'state': { 'height': '50', 'width': '174', 'x': '2081', 'y': '751' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Fami\u00ac',
              }],
            },

            'selector': {
              'id': '444801db-19d4-4391-954d-e9d9badf2664',
              'state': { 'height': '69', 'width': '2140', 'x': '115', 'y': '751' },
              'type': 'box-selector',
            },
            'type': 'entity',
          }, {
            'allowMultiple': true,
            'description': 'All of the lines inside of a paragraph',
            'id': '8a89fda0-5263-4bcd-bb38-8a83dd57e8ad',
            'label': 'Line',
            'labelledBy': 'text',
            'pluralLabel': 'Lines',
            'properties': {
              'text': [{
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '60a91517-ef57-462b-bb8e-1dd1356dc06b',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'c4996e58-de3e-4e89-8db7-98887289982e',
                  'state': { 'height': '50', 'width': '463', 'x': '114', 'y': '829' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'lien\u00e4hnlichkeit.',
              }],
            },

            'selector': {
              'id': '895b19f2-702e-457d-a9d1-97124a0a970c',
              'state': { 'height': '50', 'width': '463', 'x': '114', 'y': '829' },
              'type': 'box-selector',
            },
            'type': 'entity',
          }, {
            'allowMultiple': true,
            'description': 'All of the lines inside of a paragraph',
            'id': '00a95af8-1c91-4df6-af21-35d35801a379',
            'label': 'Line',
            'labelledBy': 'text',
            'pluralLabel': 'Lines',
            'properties': {
              'text': [{
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '8ed17ea1-f3cc-4caf-abe3-d2b86355c648',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'd77aeb13-77b3-414c-aa76-60e11371cc85',
                  'state': { 'height': '49', 'width': '102', 'x': '184', 'y': '902' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Die',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '60b9c395-a9b0-4b66-9369-4b1f4b40f226',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '53fdff03-52ec-4b7f-9258-162e9eaedf89',
                  'state': { 'height': '50', 'width': '168', 'x': '325', 'y': '902' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Suche',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '2792370c-4473-4444-b93b-4ab8b2760477',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '15180af7-ee1b-4413-955b-8819e1643400',
                  'state': { 'height': '48', 'width': '132', 'x': '530', 'y': '903' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'nach',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '90301759-a291-4ad4-a2eb-e4111c1eaee0',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '6b1ea56f-f294-4ec5-a6a3-ddc7d1150425',
                  'state': { 'height': '50', 'width': '122', 'x': '702', 'y': '902' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'dem',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '585791bd-9115-42d4-aaa6-9e7ade132104',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'f8f936aa-a4c7-49b5-a634-aa630c35baf2',
                  'state': { 'height': '63', 'width': '211', 'x': '860', 'y': '902' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Erbgut',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '21f79af0-b37b-421e-a71c-04aaa9184d6b',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'ef9f64b0-c280-4171-90ea-858448c048e1',
                  'state': { 'height': '50', 'width': '188', 'x': '1106', 'y': '902' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'wurde',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'dd5c5b03-7ac6-4a84-bc1c-531422572583',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'f1ffaadc-436b-4830-a8b0-64e1c3e883b6',
                  'state': { 'height': '49', 'width': '145', 'x': '1332', 'y': '902' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'nicht',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '98b4f7e6-f261-432e-a2ca-f7b24a07ecc9',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '7984f66a-d86d-46ca-a517-e05740d2093a',
                  'state': { 'height': '59', 'width': '295', 'x': '1516', 'y': '902' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'einfacher,',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '9f20de35-50c3-4529-8b57-7bef9f2e94d8',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'a0615c1d-78dd-4a9a-b0cb-0f85b59b9e85',
                  'state': { 'height': '50', 'width': '75', 'x': '1851', 'y': '902' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'als',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '5c98fd91-281d-45b5-bced-7b8f6e9ba1eb',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'bc5d4fd9-645d-4017-aa47-e75e0e760296',
                  'state': { 'height': '29', 'width': '100', 'x': '1964', 'y': '923' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'vor',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '147052c9-f4b3-43dc-aa48-73df3da67c20',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '72dcdb28-1b7c-4b1a-ab65-0ad2cf39d480',
                  'state': { 'height': '50', 'width': '156', 'x': '2102', 'y': '901' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'mehr',
              }],
            },

            'selector': {
              'id': '36f4f344-ed05-4473-ac09-9f660b0f4f64',
              'state': { 'height': '64', 'width': '2074', 'x': '184', 'y': '901' },
              'type': 'box-selector',
            },
            'type': 'entity',
          }, {
            'allowMultiple': true,
            'description': 'All of the lines inside of a paragraph',
            'id': '681f22ff-6355-40e9-97aa-bad63c8646dd',
            'label': 'Line',
            'labelledBy': 'text',
            'pluralLabel': 'Lines',
            'properties': {
              'text': [{
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '78e6438e-7c00-43a5-8777-95561f8dd0e5',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '1557a1eb-9f4d-409b-91f7-60d1e28e732a',
                  'state': { 'height': '50', 'width': '74', 'x': '115', 'y': '974' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'als',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'dbbb2d5d-57be-4647-b3f3-d4e3b8a2ded4',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '1a37787a-bd95-4b14-934e-248adf6261ed',
                  'state': { 'height': '50', 'width': '240', 'x': '237', 'y': '973' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'hundert',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'e98b9ead-37a8-4c6e-83d9-c973c156a7b4',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '37dc7ccd-8a6f-44dd-ba3c-424b3560d936',
                  'state': { 'height': '54', 'width': '204', 'x': '525', 'y': '974' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Jahren',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '7fe39a55-4019-4b98-b825-7d6544ce6fa2',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'c6f4b3f5-68ae-4264-bc3b-c0849da3af53',
                  'state': { 'height': '49', 'width': '84', 'x': '779', 'y': '975' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'die',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '3d7b4bd8-2fd3-4a85-96f6-195d80cf1b21',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '8b9a9b19-379b-46e0-8cd8-18a6ee6e9454',
                  'state': { 'height': '65', 'width': '313', 'x': '910', 'y': '974' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Forschung',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '397383f2-f846-493c-94a4-26bc2eee47a6',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '9c8b44c1-61b0-486d-9165-3860715a0678',
                  'state': { 'height': '49', 'width': '84', 'x': '1272', 'y': '975' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'die',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '44451ea7-6ab4-45f6-baa4-63a21cd3ab26',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '3a69c203-e6a5-4814-b3dd-7a2afabd36f2',
                  'state': { 'height': '50', 'width': '363', 'x': '1406', 'y': '975' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'erstaunliche',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '3d732f45-c2b2-46ef-bde7-7f7e7453bc9e',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '8cfbace2-1fec-4828-a627-06d3eae77412',
                  'state': { 'height': '51', 'width': '261', 'x': '1817', 'y': '974' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Tatsache',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '9a22cbcc-fe45-4987-a2e4-3093c39c63a7',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'd079dd5b-e4a8-4ccb-ad6e-beb6a2f28e16',
                  'state': { 'height': '48', 'width': '132', 'x': '2125', 'y': '976' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'fest\u00ac',
              }],
            },

            'selector': {
              'id': '19cf0ec1-df8b-4fb3-b9dd-45e3b2272a4c',
              'state': { 'height': '66', 'width': '2142', 'x': '115', 'y': '973' },
              'type': 'box-selector',
            },
            'type': 'entity',
          }, {
            'allowMultiple': true,
            'description': 'All of the lines inside of a paragraph',
            'id': '39795c5f-71cd-4621-bc49-6149b18ec44d',
            'label': 'Line',
            'labelledBy': 'text',
            'pluralLabel': 'Lines',
            'properties': {
              'text': [{
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '4997fea2-860c-4bc8-96ef-174ca7f214fd',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '00bc3e59-ca32-4127-9c6e-98de9dc1421c',
                  'state': { 'height': '50', 'width': '182', 'x': '115', 'y': '1046' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'stellte',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'd04c3f99-a851-4805-87c0-5d2bf03cad8a',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'fcb79139-d122-4314-85bf-363b3f6d0a96',
                  'state': { 'height': '48', 'width': '113', 'x': '345', 'y': '1048' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'und',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '5ecb9cc7-159e-46f2-8173-145c4ef90578',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'c0a78b79-8e54-4769-b240-b920d35af2b7',
                  'state': { 'height': '47', 'width': '194', 'x': '503', 'y': '1049' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'immer',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'c3ae69ec-2b45-450f-b2c9-e9f99971a4bb',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '56a8bee8-95a9-4e22-a4ea-8fc809606d4b',
                  'state': { 'height': '50', 'width': '204', 'x': '745', 'y': '1047' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'wieder',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'b91ab794-9875-480c-b490-71f7ece40300',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '41daf438-fab0-4e75-b647-a5fc5346c958',
                  'state': { 'height': '63', 'width': '317', 'x': '996', 'y': '1047' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'best\u00e4tigte,',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '5a122ace-2ff4-44f7-b8ed-be5958a3ed05',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '8169660f-d394-431e-8fe2-fb2b1bc16a23',
                  'state': { 'height': '49', 'width': '103', 'x': '1363', 'y': '1048' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'da\u00df',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'b1ece5be-00ed-47bd-94cf-b80098674fd8',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '227c4c13-112d-4b5f-88ad-cfdd2026134e',
                  'state': { 'height': '43', 'width': '174', 'x': '1518', 'y': '1068' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'genau',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'ba29215e-64eb-438b-8cf4-ee00f039e1b2',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'fe311c04-4f88-4ba9-9aa8-cdc971a33c7e',
                  'state': { 'height': '47', 'width': '101', 'x': '1740', 'y': '1050' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'wie',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '70b7ffd4-8d82-4eb1-87a8-cb3daa231a83',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '58c11b33-6893-45b7-a5a0-c0204d6cd5c9',
                  'state': { 'height': '50', 'width': '147', 'x': '1889', 'y': '1047' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'beim',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'dbec1444-eb43-4822-9fe6-491c5730e38b',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '25cd2357-5370-4dcd-8bc6-f21b5420d7de',
                  'state': { 'height': '64', 'width': '175', 'x': '2083', 'y': '1045' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Vogel',
              }],
            },

            'selector': {
              'id': '15ab85ae-3bb7-4464-9118-4fdad889b9e5',
              'state': { 'height': '66', 'width': '2143', 'x': '115', 'y': '1045' },
              'type': 'box-selector',
            },
            'type': 'entity',
          }, {
            'allowMultiple': true,
            'description': 'All of the lines inside of a paragraph',
            'id': '44bad5c7-962a-48d1-bfa8-5bf8abfb7385',
            'label': 'Line',
            'labelledBy': 'text',
            'pluralLabel': 'Lines',
            'properties': {
              'text': [{
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'c3b1bb9f-15dc-4793-ab8f-ba8fc7a13b91',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '895b94c7-e186-4000-ad36-af07d6fecfd0',
                  'state': { 'height': '59', 'width': '18', 'x': '111', 'y': '1121' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'j',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '79882b18-7939-4102-a518-25e9efa99635',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '4317ae29-f4e5-4e71-b385-a0ee3d6ccd95',
                  'state': { 'height': '29', 'width': '26', 'x': '156', 'y': '1139' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'e',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'ecbf7814-c556-4f28-abf2-ffa21c2bbbe5',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'ece7a569-8c7e-4078-996c-a273e0fe92bf',
                  'state': { 'height': '50', 'width': '39', 'x': '201', 'y': '1118' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'id',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '2d8980bd-f97c-43ae-90f2-9f25b0776311',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '381324ad-e245-495b-bafc-633e5464185a',
                  'state': { 'height': '29', 'width': '26', 'x': '265', 'y': '1139' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'e',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '84508101-45be-4ce5-b117-d30e8193a765',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'cb84c049-12d7-4fe7-bf2b-4010e61f183f',
                  'state': { 'height': '30', 'width': '20', 'x': '315', 'y': '1138' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 's',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '5b0ff838-3d6d-482d-867c-814321cd4e34',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'da16077b-7176-4bab-b3af-abd439af1fb8',
                  'state': { 'height': '61', 'width': '202', 'x': '374', 'y': '1119' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Leben,',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'd9573510-36cd-462d-8d1e-3c1d395e79e7',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '35760cd8-59d9-42d6-89bc-360315267a7d',
                  'state': { 'height': '61', 'width': '153', 'x': '616', 'y': '1120' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'jedes',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '57336333-35c4-414f-bc75-bd5d33b3e4f0',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '976d8a6a-df46-4814-9548-e13e28623763',
                  'state': { 'height': '50', 'width': '327', 'x': '810', 'y': '1119' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Lebewesen',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '98c8bedb-9fe4-4d22-8e95-ec5a4aeea685',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'bddaf1ad-c5a3-48a8-815f-9afa4431c52d',
                  'state': { 'height': '63', 'width': '316', 'x': '1178', 'y': '1120' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': '\u00fcberhaupt',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '9c45fd49-1a42-4d56-9831-856e96e06060',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '2328699b-4ac4-4ee6-aa5a-aae3dc6dbdee',
                  'state': { 'height': '46', 'width': '101', 'x': '1535', 'y': '1123' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'mit',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'b802c5ed-c52d-42ed-b0c2-96e8a7d054e5',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '403ecae7-3ee6-4dca-85be-68e1477949b8',
                  'state': { 'height': '47', 'width': '179', 'x': '1678', 'y': '1122' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'einem',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'e65f5e69-15ff-4783-9855-cdfc07be0e12',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '894540c8-bd5b-4995-b001-3ac19440dbcb',
                  'state': { 'height': '51', 'width': '64', 'x': '1897', 'y': '1119' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Ei',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '6e847ea6-5bc5-46bb-bfcc-066c76c6a561',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '54b0c44e-49be-4641-b3ba-dcc5a5ad6955',
                  'state': { 'height': '63', 'width': '255', 'x': '2003', 'y': '1120' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'beginne.',
              }],
            },

            'selector': {
              'id': '317d129f-189e-4f74-94c6-5aa799e4a715',
              'state': { 'height': '65', 'width': '2147', 'x': '111', 'y': '1118' },
              'type': 'box-selector',
            },
            'type': 'entity',
          }, {
            'allowMultiple': true,
            'description': 'All of the lines inside of a paragraph',
            'id': '2cda903d-1417-4094-a91f-6c6a7a95571e',
            'label': 'Line',
            'labelledBy': 'text',
            'pluralLabel': 'Lines',
            'properties': {
              'text': [{
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '456ccc1b-eaa5-4dd5-b1a8-35e304df8ad0',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'b73bd42d-e3d2-4eb9-924e-4e226c396190',
                  'state': { 'height': '50', 'width': '248', 'x': '116', 'y': '1191' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Freilich:',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '259ad631-95d3-43e2-bf8e-5833c24798d2',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '69e01269-83dc-4433-a8dd-ac85b4d4cf0f',
                  'state': { 'height': '64', 'width': '185', 'x': '414', 'y': '1191' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Fliege',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'f0a88ec9-82f6-4450-a861-d7a6c39fc438',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '787177e3-c806-4012-86fb-f1b8062948d0',
                  'state': { 'height': '48', 'width': '113', 'x': '647', 'y': '1193' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'und',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '7180b622-c080-4d2d-9f35-fd8387aed6e5',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '874af403-50e2-4c9e-ba7c-3eebf7d662dc',
                  'state': { 'height': '61', 'width': '220', 'x': '808', 'y': '1193' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Spinne,',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'b66cf2d2-c972-4417-95bb-b725a0b1feeb',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '81d7e73d-3f79-42d0-a93c-15c816d89ec4',
                  'state': { 'height': '51', 'width': '179', 'x': '1076', 'y': '1192' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Krebs',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '32f65329-c8e3-4d0e-b96a-a5a7989c9a2f',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '3ff61197-5413-409c-a1b5-b1e802df20fb',
                  'state': { 'height': '49', 'width': '113', 'x': '1304', 'y': '1193' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'und',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'b24b6a34-3217-46cb-9fe6-616ef04ebcbd',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'd5d508e0-1528-4bda-9549-b7f2b7b847af',
                  'state': { 'height': '63', 'width': '194', 'x': '1464', 'y': '1192' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Qualle',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '8bb7294d-ebb8-4fdd-9b4e-4938c66060dd',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '7f24e646-9c51-403d-9f23-25c1a18a9ce3',
                  'state': { 'height': '50', 'width': '249', 'x': '1709', 'y': '1192' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'scheinen',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '7ef2c4bf-2c1c-4cbd-b475-0604cc8d1a6c',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'd02f2eb3-b690-4b55-b861-6f594a808707',
                  'state': { 'height': '48', 'width': '146', 'x': '2005', 'y': '1193' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'nicht',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '19e9565f-2dac-4ffb-855f-c4df26313cb8',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '61d182e0-9303-49be-b718-82d334d1ddea',
                  'state': { 'height': '30', 'width': '57', 'x': '2200', 'y': '1211' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'so',
              }],
            },

            'selector': {
              'id': '78fd7ec1-ed7a-45fa-a524-3b121a32ad16',
              'state': { 'height': '64', 'width': '2141', 'x': '116', 'y': '1191' },
              'type': 'box-selector',
            },
            'type': 'entity',
          }, {
            'allowMultiple': true,
            'description': 'All of the lines inside of a paragraph',
            'id': '15e4142c-a9bd-4059-a746-96c2fd213e9f',
            'label': 'Line',
            'labelledBy': 'text',
            'pluralLabel': 'Lines',
            'properties': {
              'text': [{
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'd0c78a6a-e8b6-4249-98e8-befdf573f346',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '97bc60ae-7286-4e8e-a627-eaa9cbf6aae2',
                  'state': { 'height': '62', 'width': '167', 'x': '116', 'y': '1265' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'gro\u00dfe',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '4c1a7123-1710-43a5-b0d0-2e7e18259ebd',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'f179062c-2719-431c-9879-e4bbc1776035',
                  'state': { 'height': '49', 'width': '128', 'x': '323', 'y': '1265' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Eier',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'ece48873-d5ea-45b1-9282-7767efb7d276',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '9baa91a0-3fb1-407b-8af4-e8e4b1a9d337',
                  'state': { 'height': '29', 'width': '65', 'x': '488', 'y': '1285' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'zu',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '447daea1-a555-45d0-9238-feadd911d883',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'c6cea9cf-582e-48c3-aae3-c5a653a7d6c4',
                  'state': { 'height': '50', 'width': '177', 'x': '593', 'y': '1264' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'haben',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'ea8d6333-2190-4ffc-8b4c-38ff28e8de61',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'bd7f7cf8-c9f9-4d1d-9279-5ae54b863a4a',
                  'state': { 'height': '47', 'width': '101', 'x': '807', 'y': '1268' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'wie',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '703ea67b-b364-44a4-8615-af6bb69fcae2',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '6753f88b-4b24-45e8-8464-0cae98f05655',
                  'state': { 'height': '49', 'width': '167', 'x': '947', 'y': '1265' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Huhn',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'f39b51aa-dff7-4e4a-9862-ae8d29d00f35',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'dfb6c998-6679-494c-a136-00e9aea669ce',
                  'state': { 'height': '49', 'width': '113', 'x': '1152', 'y': '1266' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'und',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '85dc27dc-c302-4feb-9269-bf9ad3b76a10',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '6f6886d8-040e-470a-8b77-a5be06eb015f',
                  'state': { 'height': '49', 'width': '202', 'x': '1304', 'y': '1265' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Taube.',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'dc60c0bd-1bae-4d86-8031-9735c1000e21',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '001130bf-20e1-4bf1-b8d0-16017fb64e3f',
                  'state': { 'height': '50', 'width': '149', 'x': '1548', 'y': '1265' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Aber',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '073ca126-6944-4844-9aea-5dbab7f786d4',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'f60db5a4-8aae-4159-9dce-ded37075c35f',
                  'state': { 'height': '50', 'width': '147', 'x': '1735', 'y': '1265' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'beim',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '7fe1ca87-4583-4973-843d-bae86b5ec3b8',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'a8eb6040-29f1-40d3-b684-f540a2369a4c',
                  'state': { 'height': '63', 'width': '335', 'x': '1923', 'y': '1265' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'gefiederten',
              }],
            },

            'selector': {
              'id': '13cae878-6361-40d1-8f9f-8183c8365d79',
              'state': { 'height': '64', 'width': '2142', 'x': '116', 'y': '1264' },
              'type': 'box-selector',
            },
            'type': 'entity',
          }, {
            'allowMultiple': true,
            'description': 'All of the lines inside of a paragraph',
            'id': '9856367c-cdfe-4822-b867-f631ce25303d',
            'label': 'Line',
            'labelledBy': 'text',
            'pluralLabel': 'Lines',
            'properties': {
              'text': [{
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'f37ee24d-ec30-41e0-a9a3-f57225febf5a',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'cd9878b9-79ad-4926-99fc-31e9b88d1a73',
                  'state': { 'height': '50', 'width': '145', 'x': '115', 'y': '1336' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Volk',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '4bdbbad0-cebe-4827-8e4b-f0ca867ecce1',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '9a10705c-9e41-4346-baf5-bb52b6a268ce',
                  'state': { 'height': '49', 'width': '212', 'x': '300', 'y': '1337' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 't\u00e4uscht',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'c84245dc-e1c9-42ed-b5f9-af7ba493c572',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '849d6f58-457b-4653-bd33-5afe668325c8',
                  'state': { 'height': '29', 'width': '126', 'x': '551', 'y': '1357' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'man',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'c542b80a-68db-4f4c-aa32-e9ea16bbfad6',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '77162424-6dbc-4e5e-a04d-48915968b3f7',
                  'state': { 'height': '50', 'width': '106', 'x': '718', 'y': '1337' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'sich',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'd0a1a8ae-58e3-466b-ac81-e16213ececb0',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'b923eb52-b8de-4417-ab0d-7ab2a825ea18',
                  'state': { 'height': '49', 'width': '137', 'x': '864', 'y': '1337' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': '\u00fcber',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '78064d03-5701-4a76-8c64-e84faa2a6888',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'da8559c8-fa57-44ab-bce6-80ee67c5e9ef',
                  'state': { 'height': '49', 'width': '84', 'x': '1045', 'y': '1338' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'die',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '18cde14d-b654-49bd-be94-49da0ddad34c',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '3c13d1bf-0a5e-41cb-b4d7-d20a7a6ac3c4',
                  'state': { 'height': '49', 'width': '184', 'x': '1170', 'y': '1338' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'wahre',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'd8ac2930-8890-43e7-a774-01878d900c2f',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '3e6d3eb4-55f8-4d5c-aacf-c346ab9acbca',
                  'state': { 'height': '49', 'width': '185', 'x': '1397', 'y': '1338' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Gr\u00f6\u00dfe',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '21f4b3a1-460e-4903-9b4a-ae428d608a82',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '0f43e91d-7b6d-4491-99d1-13f9898ff8f6',
                  'state': { 'height': '50', 'width': '91', 'x': '1626', 'y': '1338' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'des',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'f266ebf6-b8e9-492c-922b-1d04e35ed2e5',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '01efca1f-67d4-40c4-a8ab-9b82640f1739',
                  'state': { 'height': '49', 'width': '316', 'x': '1759', 'y': '1337' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'wirklichen',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'c7665b90-2f02-4151-90b1-69040a117561',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'b747126b-0c68-4eac-a242-0ef7c63f151b',
                  'state': { 'height': '49', 'width': '139', 'x': '2117', 'y': '1337' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Eies.',
              }],
            },

            'selector': {
              'id': 'ca5c5c73-c81e-4ee2-ac2e-8a31a4acb384',
              'state': { 'height': '52', 'width': '2141', 'x': '115', 'y': '1336' },
              'type': 'box-selector',
            },
            'type': 'entity',
          }, {
            'allowMultiple': true,
            'description': 'All of the lines inside of a paragraph',
            'id': '2b827a78-ad73-4e24-af3a-cf907028ff30',
            'label': 'Line',
            'labelledBy': 'text',
            'pluralLabel': 'Lines',
            'properties': {
              'text': [{
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '47aa828e-2f50-407a-a75a-7f227dc92cc1',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'd52efd65-792f-4152-a4da-c34f2e7c1b58',
                  'state': { 'height': '60', 'width': '127', 'x': '115', 'y': '1409' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Das,',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '603c91d6-a35d-4f5f-8ef5-790fb6206adb',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'ec45ccd6-b321-45c5-a5e5-8a374ecafb30',
                  'state': { 'height': '31', 'width': '107', 'x': '279', 'y': '1429' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'was',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '1d9e2c68-360f-4fe2-9128-1cda2e39d0c4',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'd2e5f27f-e3b2-4003-a335-80b760732449',
                  'state': { 'height': '29', 'width': '123', 'x': '425', 'y': '1430' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'zum',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '325371d0-ad47-4bf7-b6ae-f7e2e56dbb11',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '88123b11-088d-4419-8e0c-44d4cdcbe83a',
                  'state': { 'height': '64', 'width': '240', 'x': '585', 'y': '1408' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Beispiel',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '09ca4168-2a4b-4904-a580-3f8045ecc568',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'bfb2f439-b47c-4252-88b9-f841b42e3a79',
                  'state': { 'height': '49', 'width': '123', 'x': '864', 'y': '1410' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'dem',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '54178202-3d03-46fc-a30b-0872c1913e07',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '9fac27c2-fb68-437a-a1c5-a899d43cd800',
                  'state': { 'height': '59', 'width': '256', 'x': '1025', 'y': '1414' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'sp\u00e4teren',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '7c95db4c-30a7-4b35-82d7-7fdb2dc71027',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'a94011b8-549d-4a95-8dfb-77d8a7c4a5d4',
                  'state': { 'height': '49', 'width': '223', 'x': '1319', 'y': '1410' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'K\u00fccken',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '8cd9581a-608c-4ca1-91be-00a7b4f67642',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '8423a247-6920-41e3-9e3b-0784bdeadef9',
                  'state': { 'height': '51', 'width': '92', 'x': '1582', 'y': '1410' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'das',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'b97fd8d1-6357-4a19-a9d5-41eb06d588b2',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'ebbcf9ee-61bb-4aa0-aea9-272c8b7f97fb',
                  'state': { 'height': '50', 'width': '184', 'x': '1713', 'y': '1409' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Leben',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '1360d116-9040-4f2b-beb2-5b25968af7b1',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '798a790f-eb65-4905-90ba-bd9c8dcfd5ab',
                  'state': { 'height': '58', 'width': '325', 'x': '1934', 'y': '1409' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'vermittelt,',
              }],
            },

            'selector': {
              'id': 'bcefb3e5-8251-4cca-8351-561381ece99f',
              'state': { 'height': '65', 'width': '2144', 'x': '115', 'y': '1408' },
              'type': 'box-selector',
            },
            'type': 'entity',
          }, {
            'allowMultiple': true,
            'description': 'All of the lines inside of a paragraph',
            'id': 'c8e2f852-75d7-4dad-9b7f-a454831250d8',
            'label': 'Line',
            'labelledBy': 'text',
            'pluralLabel': 'Lines',
            'properties': {
              'text': [{
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '93f36bf5-70c8-49fd-ba90-5af988ccae89',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'c8fe02b3-d97e-43a7-a9c5-fc246fea724e',
                  'state': { 'height': '48', 'width': '69', 'x': '115', 'y': '1484' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'ist',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '9870aa6d-5b2c-4ccc-a613-de29469d04b8',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'aa95baea-6344-49ef-b2f0-4629fce23c4a',
                  'state': { 'height': '50', 'width': '146', 'x': '219', 'y': '1482' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'beim',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '0601dd82-17fd-4c8c-b265-be56e3d12e6a',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '0339da91-1b63-4489-93dd-4027d37d6735',
                  'state': { 'height': '50', 'width': '286', 'x': '399', 'y': '1482' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'H\u00fchnerei',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'a8249196-c24b-433c-9f58-db01ffa65869',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '8bb90322-347e-43bc-83b3-49c5495e1f83',
                  'state': { 'height': '29', 'width': '104', 'x': '719', 'y': '1502' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'nur',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '6e1d464c-d5c7-458b-bc0a-275f8f6b5255',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '3e52542e-5280-4b40-80a2-02245488ca93',
                  'state': { 'height': '46', 'width': '87', 'x': '861', 'y': '1485' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'ein',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '952e2a21-52bc-435c-8f95-4f1f69a81915',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '56618e9a-81d3-419a-9336-901a21f073aa',
                  'state': { 'height': '60', 'width': '255', 'x': '982', 'y': '1485' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'winziges',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '572414f5-8a8c-4ad7-ab1a-6a716e036535',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '85e46932-27c4-4bc5-a749-4379bd153970',
                  'state': { 'height': '50', 'width': '418', 'x': '1273', 'y': '1482' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Keimbl\u00e4schen',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '5bdd5e1d-5ce8-4346-8010-02c5fcea1e62',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '4fd80eb1-36cb-4f19-99f5-e89086ebb88d',
                  'state': { 'height': '48', 'width': '256', 'x': '1727', 'y': '1484' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'inmitten',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'd0807e53-6fee-4156-81c0-6027881d2df6',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'da308f11-abd2-4c31-b643-6d0ab6ed20eb',
                  'state': { 'height': '50', 'width': '96', 'x': '2021', 'y': '1482' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'der',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '4075166a-6850-4f8e-92a1-68d7309fd76d',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '32af3313-6153-4d6b-b831-b1f528f10ea0',
                  'state': { 'height': '30', 'width': '107', 'x': '2152', 'y': '1501' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'von',
              }],
            },

            'selector': {
              'id': '851c0bf2-f004-4cf8-ad3b-f93932319011',
              'state': { 'height': '63', 'width': '2144', 'x': '115', 'y': '1482' },
              'type': 'box-selector',
            },
            'type': 'entity',
          }, {
            'allowMultiple': true,
            'description': 'All of the lines inside of a paragraph',
            'id': 'ae42d831-56d7-4dce-b86f-fb0922ccdb83',
            'label': 'Line',
            'labelledBy': 'text',
            'pluralLabel': 'Lines',
            'properties': {
              'text': [{
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '08258504-4a52-4fb7-bce7-67e0903ef5a9',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '5dfca011-67bd-426c-a5e0-b3ffc5253275',
                  'state': { 'height': '51', 'width': '97', 'x': '117', 'y': '1554' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'der',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'afbf5eb8-b0ed-46a5-a661-bdca2336cb54',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '6b3ade9c-949f-48b7-a448-a2abc3ef8447',
                  'state': { 'height': '50', 'width': '184', 'x': '248', 'y': '1555' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Schale',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'fd982a00-cd60-4057-8171-18ebd6aca413',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '8d9080ab-601f-4695-94ac-5f3f0639d92b',
                  'state': { 'height': '50', 'width': '308', 'x': '466', 'y': '1555' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'umh\u00fcllten',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'b1944e9a-c719-4d2e-bfb5-ca8ba6802323',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '6d689e4a-8df8-4323-b0a8-d037304e5556',
                  'state': { 'height': '50', 'width': '259', 'x': '808', 'y': '1555' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Eimasse.',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'ab35149a-143c-4090-978a-0b89cf2e9ae0',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '2f24945e-b287-4e86-b625-bd923185056b',
                  'state': { 'height': '65', 'width': '191', 'x': '1102', 'y': '1554' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Eigelb',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '389b43b4-ca7f-4e28-8e1c-6619b3fcc7fe',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'ac188d86-de22-4e9b-bc7e-483bac3eb6b2',
                  'state': { 'height': '48', 'width': '113', 'x': '1328', 'y': '1556' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'und',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'f8bf2795-79bb-476a-b61f-20aa2ee46014',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'f1d878ba-7f84-4890-85b6-cca527af9f5d',
                  'state': { 'height': '50', 'width': '206', 'x': '1474', 'y': '1555' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Eiwei\u00df',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '3658e487-a3aa-4fe3-9ba5-a4055936b3d9',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '49b89580-d70e-43f6-aed3-6638da672fb3',
                  'state': { 'height': '50', 'width': '181', 'x': '1717', 'y': '1555' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'selber',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '198ba66d-448b-4d48-9f14-84bc7b34b774',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'd989a08b-4fcc-4c95-9344-22e71170d3d4',
                  'state': { 'height': '50', 'width': '121', 'x': '1934', 'y': '1555' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'sind',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '22f9b5e7-eb57-4952-b617-7f8c2e0d33b5',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'c94e470f-cf78-4d8b-9b05-f3a67d971d74',
                  'state': { 'height': '50', 'width': '172', 'x': '2087', 'y': '1554' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'nichts',
              }],
            },

            'selector': {
              'id': '2e7f4e25-7631-46ff-9f77-105c3f1a50c4',
              'state': { 'height': '65', 'width': '2142', 'x': '117', 'y': '1554' },
              'type': 'box-selector',
            },
            'type': 'entity',
          }, {
            'allowMultiple': true,
            'description': 'All of the lines inside of a paragraph',
            'id': '5bdd3a69-8f14-46a1-8a29-fe783b9fdcd0',
            'label': 'Line',
            'labelledBy': 'text',
            'pluralLabel': 'Lines',
            'properties': {
              'text': [{
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '1ac7328b-d0e6-4fb4-9c4b-f3ff69a8f500',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '20147ea1-753a-49f4-8351-ef594a9d2e78',
                  'state': { 'height': '50', 'width': '228', 'x': '118', 'y': '1628' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'anderes',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'a3f3ecaf-333a-4394-91c1-cb15aec44818',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '2787293f-43eb-448e-92ea-2aadcc7810d4',
                  'state': { 'height': '51', 'width': '75', 'x': '398', 'y': '1627' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'als',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'ee259ad4-bd95-4124-85a7-53908cbb0be6',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'ca447164-3268-474e-a21b-5a5f34e0bff3',
                  'state': { 'height': '63', 'width': '289', 'x': '523', 'y': '1628' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'sorgf\u00e4ltig',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '05586865-10d8-4e16-9a55-734c3ecf18bb',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '7234e456-7838-41dd-a1fa-4bf0057d2571',
                  'state': { 'height': '49', 'width': '94', 'x': '860', 'y': '1629' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'f\u00fcr',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '417b61ea-7d78-424c-9e4b-aef030090733',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '32a81a77-6d5c-4455-b20e-12f86bdbff17',
                  'state': { 'height': '50', 'width': '102', 'x': '1004', 'y': '1627' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'den',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'bbdb3722-6368-43f8-98fe-392e5e4d34fc',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'e6dfdb19-286c-49a3-be8b-9b1cfc602ddf',
                  'state': { 'height': '50', 'width': '530', 'x': '1154', 'y': '1628' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'heranwachsenden',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'd1486d7c-2cc8-49a6-ad3a-e238d00fdc3e',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '7032c83e-8ebe-4518-be24-ad8b9d4ed337',
                  'state': { 'height': '64', 'width': '278', 'x': '1733', 'y': '1627' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Keimling',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '4163a54d-e75e-4535-97c0-446a033272e4',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '065d90d5-6df5-4489-9b7a-050f1fd8e1c0',
                  'state': { 'height': '50', 'width': '200', 'x': '2059', 'y': '1627' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'bereit\u00ac',
              }],
            },

            'selector': {
              'id': 'b9c85a17-f950-4f04-afbe-4da33f0f6a7a',
              'state': { 'height': '64', 'width': '2141', 'x': '118', 'y': '1627' },
              'type': 'box-selector',
            },
            'type': 'entity',
          }, {
            'allowMultiple': true,
            'description': 'All of the lines inside of a paragraph',
            'id': '2d4fd868-e208-4dbb-ad10-0c7e4fdfa4dc',
            'label': 'Line',
            'labelledBy': 'text',
            'pluralLabel': 'Lines',
            'properties': {
              'text': [{
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '09a82806-9024-46c5-9cfe-227177770c72',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '41e56971-4f54-4faf-8b89-326c6dfd2529',
                  'state': { 'height': '63', 'width': '250', 'x': '118', 'y': '1701' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'gestellte',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '3e4d32ee-d27d-4642-8040-af62f3062a09',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '071ffe1b-f117-4966-9c92-614ed5efc066',
                  'state': { 'height': '64', 'width': '283', 'x': '400', 'y': '1700' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Nahrung,',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '8adb928c-0aef-4930-adc0-3476151da5be',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '3d2ae266-109f-4b59-b691-d625b5d552e0',
                  'state': { 'height': '48', 'width': '94', 'x': '716', 'y': '1702' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'auf',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'a8769df9-b2d8-479f-9a6c-565a4bf01c8d',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '06fc2d43-fc6d-459e-b278-ab1f7af47955',
                  'state': { 'height': '49', 'width': '103', 'x': '842', 'y': '1701' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'da\u00df',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '5d1376cf-30ab-446d-9744-b4373c5dc208',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'd0141ea4-0392-4028-82d6-22805d26f35e',
                  'state': { 'height': '29', 'width': '57', 'x': '979', 'y': '1721' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'er',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '0a893acb-4ed3-477e-9a5d-cb5f1eeaecfd',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '2844f223-e367-4dcf-a52d-719bd4f28123',
                  'state': { 'height': '46', 'width': '55', 'x': '1066', 'y': '1703' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'in',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'e702208c-35c0-4f29-b6d7-16affbe5a699',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '0fa375e6-dabe-46c0-add4-017568380677',
                  'state': { 'height': '48', 'width': '179', 'x': '1153', 'y': '1703' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'seiner',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '4de6ba69-4ad9-442b-8cfa-95c99434b4c7',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'e149b5a3-b138-41b7-b860-57c57e1ab437',
                  'state': { 'height': '50', 'width': '327', 'x': '1362', 'y': '1700' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Kalkschale',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'cd152cdd-0d9f-4414-892b-171f8122bb99',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '08af4766-deec-4b7a-8fc8-dd9d6a6b7563',
                  'state': { 'height': '51', 'width': '145', 'x': '1720', 'y': '1699' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'nicht',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '17450bdb-f9bc-41bf-b5b0-f721e09f03a2',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'f4e18dd6-dcfb-47d8-b16e-9406783e2a6a',
                  'state': { 'height': '63', 'width': '365', 'x': '1896', 'y': '1700' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'verhungere,',
              }],
            },

            'selector': {
              'id': 'f5403f46-50df-4ae3-8be5-a17916e84af6',
              'state': { 'height': '65', 'width': '2143', 'x': '118', 'y': '1699' },
              'type': 'box-selector',
            },
            'type': 'entity',
          }, {
            'allowMultiple': true,
            'description': 'All of the lines inside of a paragraph',
            'id': '465b4784-d7aa-4aef-bc55-bd3eec81bd9d',
            'label': 'Line',
            'labelledBy': 'text',
            'pluralLabel': 'Lines',
            'properties': {
              'text': [{
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '70a695c3-09d8-4fd5-bbcc-7a3dbcf3bc1d',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '66c7fb96-d292-4aca-8f3e-feaeed3fe8ab',
                  'state': { 'height': '51', 'width': '81', 'x': '116', 'y': '1773' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'bis',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '65b2e984-4ee1-49a3-bfdc-82d88d446c9b',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'c83d9634-9f2f-4fbf-a1b4-aa9ff48af299',
                  'state': { 'height': '28', 'width': '58', 'x': '245', 'y': '1794' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'er',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '239cb5ac-3aae-4a27-81ae-cd408d84d971',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '19265713-0bd6-42fa-9921-dc3b8ebc9930',
                  'state': { 'height': '50', 'width': '209', 'x': '349', 'y': '1773' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'endlich',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '7cd4c832-461b-4718-849e-173ff9f0da19',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '2fb8a266-53e9-40c0-9255-3a5e8cb2da63',
                  'state': { 'height': '30', 'width': '93', 'x': '607', 'y': '1793' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'ans',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '7fc188d4-64d9-4eff-870f-6aaac1b551b0',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '59bbf973-cdf6-4b53-afd0-e14c3ab4fb4a',
                  'state': { 'height': '64', 'width': '304', 'x': '747', 'y': '1773' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Tageslicht',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '8a6e872d-0476-49b5-8410-153e3d8c9e9c',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '9f84dbd9-5a15-44d8-9738-9f163815f1f1',
                  'state': { 'height': '63', 'width': '282', 'x': '1098', 'y': '1773' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'schl\u00fcpfen',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '16d4aba9-7d9d-4670-8aaa-b8228730e65e',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'd1d3da6d-3085-4024-968b-e23e4a062435',
                  'state': { 'height': '49', 'width': '113', 'x': '1425', 'y': '1773' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'und',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '5448b9ce-0ba8-40e7-9a6c-5a113f9bc563',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '2aa61597-2afa-44de-a849-d36098099af5',
                  'state': { 'height': '50', 'width': '168', 'x': '1585', 'y': '1773' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'selbst',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '4988c03d-d9eb-4aa4-9ae5-83826fb08f77',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '849ed281-15c2-4d52-be7b-1a409153f216',
                  'state': { 'height': '48', 'width': '148', 'x': '1801', 'y': '1775' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'seine',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '9d7db20f-229e-4def-921b-f9f4bbf67de1',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'fba4f82b-05de-4518-9f04-31724887c9f3',
                  'state': { 'height': '62', 'width': '266', 'x': '1996', 'y': '1773' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Nahrung',
              }],
            },

            'selector': {
              'id': '0b5a940c-9e5f-4d7e-9aa5-3f56363965a0',
              'state': { 'height': '64', 'width': '2146', 'x': '116', 'y': '1773' },
              'type': 'box-selector',
            },
            'type': 'entity',
          }, {
            'allowMultiple': true,
            'description': 'All of the lines inside of a paragraph',
            'id': '036e8c48-caf9-4bfd-b38f-2bb66a79b4f4',
            'label': 'Line',
            'labelledBy': 'text',
            'pluralLabel': 'Lines',
            'properties': {
              'text': [{
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '7926ac75-4e25-4c5d-ada3-374ce9e37752',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '8740a00d-3261-4ae5-86fe-2c9be392e1cf',
                  'state': { 'height': '48', 'width': '195', 'x': '117', 'y': '1847' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'suchen',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '550a5c7f-db75-4206-9c3e-bfa2f9d82717',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '005a6d9b-2bef-400e-a928-2f24f90ebbc6',
                  'state': { 'height': '49', 'width': '165', 'x': '343', 'y': '1846' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'kann.',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '656502f0-3972-4bb4-9b8e-d2f2a05b0861',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '26579075-14e4-4090-8356-e2987fa6aa6b',
                  'state': { 'height': '49', 'width': '102', 'x': '539', 'y': '1847' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Die',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '3d4ea68f-0b9d-4cc8-8291-9c0e4ee2b2fa',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '693be07a-3ea0-4b82-9dfc-6b5d87676f2d',
                  'state': { 'height': '49', 'width': '129', 'x': '672', 'y': '1846' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Eier',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'bff6ffd0-d4dc-4316-9bf1-e18edeeb9cd1',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '73ee28c4-6468-4ae2-be5d-beebdc841d21',
                  'state': { 'height': '48', 'width': '135', 'x': '834', 'y': '1847' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'aller',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '2d935155-ebd7-4a4e-81d6-c110c1b80d4f',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'fd7ed741-83b4-45a9-a069-1811feab3751',
                  'state': { 'height': '64', 'width': '333', 'x': '999', 'y': '1845' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'gefl\u00fcgelten',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '326b6086-1031-4b00-b553-09d26d34aa5b',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'f0dd36d0-c5ad-41bc-9c8a-a85832f080ba',
                  'state': { 'height': '49', 'width': '113', 'x': '1364', 'y': '1846' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'und',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '9d6c924a-eb93-473c-b938-cff7dfcc1e44',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '3d18aa06-29d8-4369-81a1-96e80841ff16',
                  'state': { 'height': '63', 'width': '371', 'x': '1511', 'y': '1846' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'geschuppten',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '99030d01-53d0-4e2b-9b9a-8a30a0aea9c3',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '6126f332-578f-4614-a660-cacb4e18d5dd',
                  'state': { 'height': '60', 'width': '179', 'x': '1913', 'y': '1846' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Tiere,',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '76773581-2eec-4bc5-b5c3-d4a008d9e8b8',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '8bd66846-53e3-4416-a847-3cae2fc74c44',
                  'state': { 'height': '50', 'width': '137', 'x': '2125', 'y': '1845' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'aller',
              }],
            },

            'selector': {
              'id': '4a20029b-daa4-4502-bd9a-434402239d2a',
              'state': { 'height': '64', 'width': '2145', 'x': '117', 'y': '1845' },
              'type': 'box-selector',
            },
            'type': 'entity',
          }, {
            'allowMultiple': true,
            'description': 'All of the lines inside of a paragraph',
            'id': '7ab8d0dc-ac29-467d-af11-fd5810050612',
            'label': 'Line',
            'labelledBy': 'text',
            'pluralLabel': 'Lines',
            'properties': {
              'text': [{
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '68da3542-c1b4-4e14-a903-98286e398daf',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '47dafee0-281f-4226-8e77-2dda2692c4a8',
                  'state': { 'height': '49', 'width': '260', 'x': '117', 'y': '1918' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Insekten',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'd3ba57b1-4805-43ae-a31c-2207f66e4265',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'ffe5e5be-8466-4384-a9a8-8c62a9b4d16f',
                  'state': { 'height': '49', 'width': '114', 'x': '408', 'y': '1919' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'und',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '9dd7d6e2-c111-4dfb-a959-6b4d44ac578c',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '3e4bb975-5154-4e96-8ca4-467455ead293',
                  'state': { 'height': '59', 'width': '233', 'x': '551', 'y': '1918' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Krebse,',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '4de4f065-2366-450a-bdaa-ab8aa31ff9a3',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '63415626-d447-429a-82a7-98982e411793',
                  'state': { 'height': '49', 'width': '113', 'x': '816', 'y': '1918' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'und',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '7548b35e-91d5-41af-a899-329661ac5708',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '2fd71be4-0352-498c-9643-b0d210e696f7',
                  'state': { 'height': '50', 'width': '69', 'x': '963', 'y': '1917' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'all',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '67e351ae-e069-4eca-8baf-f0fec4af0f56',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '2254e4c0-df0f-4023-a220-c14c9baf794e',
                  'state': { 'height': '49', 'width': '97', 'x': '1065', 'y': '1918' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'der',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '3dff350f-68e6-449e-b6df-67feac62aac3',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'df2e75d0-4c16-4fdf-8a42-911caf89e8c3',
                  'state': { 'height': '49', 'width': '178', 'x': '1193', 'y': '1918' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'vielen',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '37861588-2219-4f74-a93f-a20d763e80da',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'a83cb600-b295-4883-855a-8519c452c22f',
                  'state': { 'height': '49', 'width': '134', 'x': '1404', 'y': '1918' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'noch',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '636e9c61-d621-4582-a792-dddf0371a71f',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'f5f38be1-cd8b-4eb9-a4ea-b69ecde64c42',
                  'state': { 'height': '62', 'width': '350', 'x': '1570', 'y': '1918' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'niedrigeren',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '8564b20f-87cd-4591-9345-81099cea66ae',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '59ae2a66-0705-4e12-9773-be6edd110d83',
                  'state': { 'height': '48', 'width': '310', 'x': '1952', 'y': '1919' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Tierwesen',
              }],
            },

            'selector': {
              'id': '69cb687d-a020-4b6e-82b9-cc968a918e7c',
              'state': { 'height': '63', 'width': '2145', 'x': '117', 'y': '1917' },
              'type': 'box-selector',
            },
            'type': 'entity',
          }, {
            'allowMultiple': true,
            'description': 'All of the lines inside of a paragraph',
            'id': 'e1cd9cd5-3d1b-4e05-b986-a7034b1855d1',
            'label': 'Line',
            'labelledBy': 'text',
            'pluralLabel': 'Lines',
            'properties': {
              'text': [{
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'f22f9a9c-5170-41bc-9b1b-d8b031f1368d',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'abed182e-e6e3-4088-bbd2-461c7157210c',
                  'state': { 'height': '49', 'width': '120', 'x': '119', 'y': '1992' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'sind',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'e6131276-0f27-40bf-a9e2-4113f25ff736',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '6eea8af7-24f8-4679-b9fc-48d023ebadd2',
                  'state': { 'height': '51', 'width': '172', 'x': '277', 'y': '1991' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'nichts',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'f324c816-bcd6-4630-8ece-2774870d9076',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '5ea6b245-3482-4f7d-95f1-de5410b186b3',
                  'state': { 'height': '46', 'width': '192', 'x': '489', 'y': '1994' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'weiter',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '0d6e49e1-0869-4a20-a308-0b12102cb3f1',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '5046bdc0-a101-44d1-824f-00e2503c2478',
                  'state': { 'height': '49', 'width': '74', 'x': '723', 'y': '1992' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'als',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '0f1640e2-3437-437d-8b99-ddfb9a3567d0',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'd7cc5afa-b981-4f5b-a11f-4ea557de3fd3',
                  'state': { 'height': '48', 'width': '120', 'x': '840', 'y': '1993' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'eine',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '9b1475c9-a2e2-4863-b8ad-46f5c64614a1',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '024ebc94-980e-4061-a17a-9276eef4cf9a',
                  'state': { 'height': '61', 'width': '208', 'x': '1002', 'y': '1993' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'einzige',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'fbe53b7e-c46d-4706-9b36-280a283e4ff4',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '51b24b84-42f0-4e71-a1e2-4715265a30c8',
                  'state': { 'height': '59', 'width': '165', 'x': '1252', 'y': '1991' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Zelle,',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '774749c8-6883-45f8-91d5-d1b2625d0a66',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '13f9c9a1-f7cd-4dc5-ab8f-9d6c8a9deb94',
                  'state': { 'height': '47', 'width': '101', 'x': '1456', 'y': '1993' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'wie',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'cdb905ff-c252-4cdc-b6e0-fc545c4f0b65',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '5ac6e5ee-8416-489f-b4ee-2af8a9ae0318',
                  'state': { 'height': '49', 'width': '85', 'x': '1601', 'y': '1991' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'die',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'e19100f4-1f80-4271-a6ae-9da9c132d459',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '11980cdf-7c57-46dd-a87a-ee2955073609',
                  'state': { 'height': '50', 'width': '391', 'x': '1727', 'y': '1990' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Wissenschaft',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'db15fe08-265f-4a7b-b5c4-cd034c89eb96',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '83a51e3e-e880-44ce-afdb-8c689da2f61c',
                  'state': { 'height': '49', 'width': '101', 'x': '2161', 'y': '1990' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'den',
              }],
            },

            'selector': {
              'id': '5409b7ca-c5cb-4005-93a0-ebf179d4942e',
              'state': { 'height': '64', 'width': '2143', 'x': '119', 'y': '1990' },
              'type': 'box-selector',
            },
            'type': 'entity',
          }, {
            'allowMultiple': true,
            'description': 'All of the lines inside of a paragraph',
            'id': '3255b44a-d7fd-4d12-9622-98347b7b9352',
            'label': 'Line',
            'labelledBy': 'text',
            'pluralLabel': 'Lines',
            'properties': {
              'text': [{
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'd942ddc6-132d-49a6-9ac1-eeb500ecdf3f',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'e633aa3a-82ca-4b8f-be1f-b75997ed5d55',
                  'state': { 'height': '50', 'width': '336', 'x': '119', 'y': '2064' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'einfachsten',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '67c565b3-638a-4ff1-9b77-e82bcb50efd2',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '866f1045-9a78-4ada-bd8e-1ed1f4e88f93',
                  'state': { 'height': '50', 'width': '263', 'x': '484', 'y': '2064' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Baustein',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'ac700dc0-5782-42bb-8faa-ff06140e5799',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '0fb62fd8-453a-4573-9e0e-f81c71c8e57e',
                  'state': { 'height': '49', 'width': '129', 'x': '779', 'y': '2064' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'alles',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '94953edd-fe3e-4fbf-a6ce-7a802191a03d',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '5e2c7957-07ed-4f1a-bfad-173751d3d491',
                  'state': { 'height': '63', 'width': '351', 'x': '937', 'y': '2063' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Lebendigen',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '28030ade-6069-47fb-b3bc-4677e3d16422',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '946f12a3-1ecf-442a-86b1-941873ffaa0c',
                  'state': { 'height': '36', 'width': '188', 'x': '1316', 'y': '2076' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'nennt.',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'ff108d60-3dc0-4093-8cdf-c4f1a40e9121',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'e7bb29a9-8880-468a-a2d7-e51c6dd6616d',
                  'state': { 'height': '48', 'width': '117', 'x': '1534', 'y': '2064' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Nur',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'ebce25c4-7178-43e0-88ca-8a9e246ca13c',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '236217c8-e9ac-48b6-b5d3-c0aa8a9fbaad',
                  'state': { 'height': '37', 'width': '164', 'x': '1680', 'y': '2075' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'unter',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'b6cfc8da-a97a-4439-80c4-3579b409a013',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '174b2a80-242f-4caa-8b38-df624f6f773c',
                  'state': { 'height': '49', 'width': '123', 'x': '1875', 'y': '2063' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'dem',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '416cd498-c06a-4bcd-b7ce-59838c6f3ad4',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '62a6140e-bff7-44e9-874b-8b81a2e0789e',
                  'state': { 'height': '49', 'width': '236', 'x': '2026', 'y': '2063' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Zauber\u00ac',
              }],
            },

            'selector': {
              'id': '0c4d8b82-736a-4c28-84c5-ea8564b65e81',
              'state': { 'height': '63', 'width': '2143', 'x': '119', 'y': '2063' },
              'type': 'box-selector',
            },
            'type': 'entity',
          }, {
            'allowMultiple': true,
            'description': 'All of the lines inside of a paragraph',
            'id': '90c5bc8e-5e7f-478d-bbe4-43a31892db16',
            'label': 'Line',
            'labelledBy': 'text',
            'pluralLabel': 'Lines',
            'properties': {
              'text': [{
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '04dafcae-3110-41c1-aee6-a158dae3c115',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'cf7fd48c-f5a9-4935-ad23-53cbec42d139',
                  'state': { 'height': '62', 'width': '112', 'x': '118', 'y': '2136' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'glas',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'aa0c2dde-c854-4056-bbc7-6380817dd508',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'f0f07634-47d6-4f1b-b59a-fd1c6360b115',
                  'state': { 'height': '51', 'width': '91', 'x': '271', 'y': '2136' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'des',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '63fc3504-6eca-41c7-9a61-07163b1c5795',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '747e15a1-f358-4994-aca7-c4fda4a5730e',
                  'state': { 'height': '67', 'width': '356', 'x': '401', 'y': '2131' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Mikroskops',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '50c98984-ce7b-442d-a384-4bb085635e9a',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '1bd1d084-a78a-4009-9aad-1d5f4d2ee9d1',
                  'state': { 'height': '50', 'width': '237', 'x': '798', 'y': '2135' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'erkennt',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '6b7f3c03-c08c-48cb-b7e6-704ed5cca3f7',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'dc0ef35a-e38b-4d3b-bb8d-9e4ed83388da',
                  'state': { 'height': '29', 'width': '125', 'x': '1073', 'y': '2155' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'man',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '8277a0ee-a25e-4de7-bb91-8c3ed0d146f7',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '584311d3-aba2-470c-b04b-af2cf948d20e',
                  'state': { 'height': '49', 'width': '92', 'x': '1240', 'y': '2136' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'das',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '60ea27a9-2cec-4e4a-8284-03f2478062a2',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '6e4cf6a4-c6e4-4095-85e9-b64d2d80fb56',
                  'state': { 'height': '47', 'width': '160', 'x': '1372', 'y': '2137' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'meist',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '6a2c3765-e1b7-4ac6-aa32-6abfab30138d',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '3e1ab162-2498-438c-82b3-def29ea0c458',
                  'state': { 'height': '48', 'width': '135', 'x': '1570', 'y': '2136' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'noch',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '5144d2cb-1205-4c93-9266-f228b25fe9e5',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'd10631ac-1e77-46c3-8de7-02604898592d',
                  'state': { 'height': '49', 'width': '146', 'x': '1743', 'y': '2134' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'nicht',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'c10f2d87-0620-47c9-86a1-9d5e40f09a28',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '90e4467b-184a-450f-a6c8-f76ed7282f55',
                  'state': { 'height': '50', 'width': '332', 'x': '1929', 'y': '2134' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'stecknadel\u00ac',
              }],
            },

            'selector': {
              'id': '46310c24-a0fe-4300-932e-d5f13eac580b',
              'state': { 'height': '67', 'width': '2143', 'x': '118', 'y': '2131' },
              'type': 'box-selector',
            },
            'type': 'entity',
          }, {
            'allowMultiple': true,
            'description': 'All of the lines inside of a paragraph',
            'id': 'd5ae9253-e52e-478f-a862-e9443ddbc357',
            'label': 'Line',
            'labelledBy': 'text',
            'pluralLabel': 'Lines',
            'properties': {
              'text': [{
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'bd27afa8-ef49-4bb7-90b0-acf1c6c5f1e4',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '002b2eff-9e05-4b51-8893-71f0c309b015',
                  'state': { 'height': '64', 'width': '311', 'x': '118', 'y': '2208' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'kopfgro\u00dfe',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '4e8dd1cc-5d82-4045-9fa0-313446d30062',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '757ecef7-b743-4ddb-947b-70d23f6a9774',
                  'state': { 'height': '64', 'width': '353', 'x': '474', 'y': '2208' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Zellgebilde,',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '74733b2a-b654-444a-af78-2250f5671136',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '52a5b6db-4fd6-4dd4-8713-b0d1f8bcb3e0',
                  'state': { 'height': '46', 'width': '88', 'x': '873', 'y': '2211' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'ein',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '5e1e7839-1e65-4079-833e-325704b2cffd',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '1eb3059c-3202-4f89-8cfb-6f873db896c2',
                  'state': { 'height': '62', 'width': '342', 'x': '1004', 'y': '2208' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Kl\u00fcmpchen',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'e581485e-2bed-4cf3-bc22-aace77f524dd',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '40206f1c-88b7-4079-bcfc-af8f90f647db',
                  'state': { 'height': '65', 'width': '743', 'x': '1391', 'y': '2206' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'schleimiges-halbfl\u00fcssiges',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '6842e6d1-1487-41f8-9a6b-9c7cc71109cd',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '6cbeec5e-75ab-464d-8310-b61acdcdc124',
                  'state': { 'height': '49', 'width': '84', 'x': '2179', 'y': '2205' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Ei\u00ac',
              }],
            },

            'selector': {
              'id': '673ea47f-5e8d-45a0-b1f5-e8ddd9c241ce',
              'state': { 'height': '67', 'width': '2145', 'x': '118', 'y': '2205' },
              'type': 'box-selector',
            },
            'type': 'entity',
          }, {
            'allowMultiple': true,
            'description': 'All of the lines inside of a paragraph',
            'id': 'e8b7445c-e131-4cec-9959-3add6f423ac7',
            'label': 'Line',
            'labelledBy': 'text',
            'pluralLabel': 'Lines',
            'properties': {
              'text': [{
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '43acdc7f-7da1-42ed-9631-b444dc74a9d8',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '43f8f886-bef1-4b64-a2ef-bc409faac78e',
                  'state': { 'height': '59', 'width': '155', 'x': '120', 'y': '2283' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'wei\u00df,',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '145cf638-a026-405c-9bca-98f9b825f4c2',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '73365f7b-eca2-4687-acbe-9452207ecb65',
                  'state': { 'height': '45', 'width': '56', 'x': '315', 'y': '2287' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'in',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '2e5a82ac-8713-42c2-974f-7e67ad6ffaa2',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '588bba49-73aa-44bb-87c1-1452078b5df7',
                  'state': { 'height': '50', 'width': '192', 'x': '415', 'y': '2283' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'dessen',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '4d0d8f75-42b9-4ff7-8dcd-2246ad44e096',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'd2bea86a-351d-49a8-9618-1327ab4f6a78',
                  'state': { 'height': '50', 'width': '204', 'x': '649', 'y': '2282' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Innern',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '641c7a19-1f0d-4a27-8172-e5b7ee73a152',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '6701f720-ea50-45ad-9f49-96bb56370a25',
                  'state': { 'height': '46', 'width': '87', 'x': '896', 'y': '2285' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'ein',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '581a6ff2-0dec-496f-908f-4c7e1ec362e6',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '10785565-4614-4fa0-9112-321beb086501',
                  'state': { 'height': '50', 'width': '371', 'x': '1024', 'y': '2281' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'verdichteter',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '137a7a8c-f33a-46b4-a881-c3417ad18c2a',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '232e23a6-6e7d-451c-8622-4f49f0700727',
                  'state': { 'height': '50', 'width': '187', 'x': '1437', 'y': '2280' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Punkt',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '686b0224-57f0-4ac9-b358-e61a1cec9439',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '92f4a33e-f735-4ff4-83f0-9c1c51d40eb3',
                  'state': { 'height': '52', 'width': '236', 'x': '1668', 'y': '2278' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'sichtbar',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'f2993c31-a611-4d3b-8d13-cec87e05ff05',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '54698921-37ea-4e95-9c1e-b8767acf05ba',
                  'state': { 'height': '47', 'width': '71', 'x': '1945', 'y': '2282' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'ist',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'a7f49790-aea7-4cad-8dd7-855c14b797b1',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'fc24933d-a9f3-48a3-84ed-0a2095ca4e39',
                  'state': { 'height': '5', 'width': '70', 'x': '2056', 'y': '2309' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': '\u2014',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '4ce526ec-6e6b-47be-88de-bb91528f5447',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'f5463461-3cbb-49a4-83d3-c67236034ad5',
                  'state': { 'height': '49', 'width': '96', 'x': '2169', 'y': '2278' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'der',
              }],
            },

            'selector': {
              'id': '6931371a-b4ad-490b-9175-251b14d4f450',
              'state': { 'height': '64', 'width': '2145', 'x': '120', 'y': '2278' },
              'type': 'box-selector',
            },
            'type': 'entity',
          }, {
            'allowMultiple': true,
            'description': 'All of the lines inside of a paragraph',
            'id': '9b47a786-0943-4824-bc34-a5213b5388e6',
            'label': 'Line',
            'labelledBy': 'text',
            'pluralLabel': 'Lines',
            'properties': {
              'text': [{
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'f1f556ec-c271-49be-b79d-57ddfd1d1e85',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'd0b5478f-f049-46c2-bbdd-985f5b48d944',
                  'state': { 'height': '51', 'width': '273', 'x': '118', 'y': '2355' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Zellkern.',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '62437feb-56fe-41bb-af11-f7164a0e7e1e',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '46d65867-a616-4823-a26b-a318bdf056fb',
                  'state': { 'height': '51', 'width': '179', 'x': '426', 'y': '2355' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Selbst',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '960b3a06-550f-48a9-97ba-bb4fc88279a9',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '78641802-7f9d-4801-8a0c-69f6a2a89fdf',
                  'state': { 'height': '49', 'width': '85', 'x': '639', 'y': '2356' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'die',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '0f320a23-e2d0-4c22-b3a6-83e832b8b7b8',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '288c56bf-4d3f-442f-b60e-60c6c6fd12e6',
                  'state': { 'height': '50', 'width': '574', 'x': '757', 'y': '2354' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'h\u00f6chstentwickelten',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '9b3e8e53-9bee-469a-a99f-deaf627a15cf',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'c16f6159-639f-4da0-819b-53424e44ed34',
                  'state': { 'height': '37', 'width': '164', 'x': '1364', 'y': '2365' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'unter',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '4936207f-e769-4221-af44-393792a9f0f6',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '9ee4802b-b93a-4974-8a6a-4670fdfd740c',
                  'state': { 'height': '49', 'width': '102', 'x': '1563', 'y': '2353' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'den',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'f71dec02-77e1-43bd-8c2c-c7c84be07680',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'c2d7cba0-17f1-4bb9-b6ca-c09807c056c3',
                  'state': { 'height': '57', 'width': '215', 'x': '1698', 'y': '2353' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Tieren,',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'bebd3c29-011c-4513-aefb-359d05752e68',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '8d753b17-5b66-4e28-bcf3-de7baab55e41',
                  'state': { 'height': '50', 'width': '85', 'x': '1949', 'y': '2351' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'die',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '7e593347-9c9c-4db6-b201-d4c848611a95',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '9b24c7d6-3834-4ec6-a949-cc75e31427da',
                  'state': { 'height': '62', 'width': '195', 'x': '2068', 'y': '2351' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'S\u00e4uge\u00ac',
              }],
            },

            'selector': {
              'id': 'd9d261b5-32ef-4663-ae6f-9e3a1c15f863',
              'state': { 'height': '62', 'width': '2145', 'x': '118', 'y': '2351' },
              'type': 'box-selector',
            },
            'type': 'entity',
          }, {
            'allowMultiple': true,
            'description': 'All of the lines inside of a paragraph',
            'id': '32e3013d-25af-4552-ac1c-1383df9c3579',
            'label': 'Line',
            'labelledBy': 'text',
            'pluralLabel': 'Lines',
            'properties': {
              'text': [{
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'e0f3bc22-5054-4e75-af2c-a85218e0c845',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'ae71f706-6b92-4e61-af5f-3d985d662cf0',
                  'state': { 'height': '48', 'width': '139', 'x': '120', 'y': '2431' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'tiere',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '61e02855-90ef-4cf9-b9f2-473ccae7f12e',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'ff521132-e38f-4c54-ac94-2b78e3c7cfca',
                  'state': { 'height': '5', 'width': '71', 'x': '283', 'y': '2459' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': '\u2014',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'd9305b76-5561-4d0b-9eb4-e50b96b537d9',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'c44fde8a-54a5-4529-9d1a-b2fe1bfb8d6c',
                  'state': { 'height': '50', 'width': '174', 'x': '376', 'y': '2428' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Pferd',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'b9160768-b7c0-43c9-a945-071dbb72dd2f',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '04bfa23a-c703-41bb-8859-c092d9e786d2',
                  'state': { 'height': '49', 'width': '113', 'x': '574', 'y': '2428' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'und',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'a83f838d-9a04-4b89-8818-499f97dbf5bd',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'e45ca6fe-9e21-4f7c-a489-1f7c92a4a444',
                  'state': { 'height': '59', 'width': '181', 'x': '711', 'y': '2428' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'L\u00f6we,',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '2b5fd51e-dd2b-4c59-8ad9-1db0d754bfb7',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '00c81ea6-9750-459c-89fe-305f7fe51499',
                  'state': { 'height': '50', 'width': '157', 'x': '917', 'y': '2427' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Maus',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '01929cf1-fb43-498d-b95e-136ab0fd697d',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '00bd56f1-e236-4caf-9076-c67948e13be0',
                  'state': { 'height': '50', 'width': '114', 'x': '1100', 'y': '2426' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'und',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '0486356e-bdbe-49eb-904c-789c1a7678d9',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '54f8bf59-81b1-415d-a5e5-dd7fa1b2527a',
                  'state': { 'height': '58', 'width': '243', 'x': '1237', 'y': '2426' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Elefant,',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '794f9185-eace-44bd-8c0d-fad112ee3850',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '8873ddd6-6575-483a-bf5f-0e85a1590568',
                  'state': { 'height': '49', 'width': '145', 'x': '1507', 'y': '2426' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Hase',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '61b23082-8073-49a7-bcfe-2d76cc482edb',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '0c8969a5-4b1c-4a37-a931-7cd97e7ac3a0',
                  'state': { 'height': '49', 'width': '113', 'x': '1679', 'y': '2424' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'und',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'f53f556b-bce6-4db2-9de6-d09b562f5afc',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '43338d13-221a-4621-bcc0-6edbfb771878',
                  'state': { 'height': '50', 'width': '357', 'x': '1816', 'y': '2423' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Fledermaus',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'de6ae85c-1d00-403c-8841-d66f3699712a',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'e919345b-5738-46ac-b8c3-34ed68405076',
                  'state': { 'height': '4', 'width': '71', 'x': '2197', 'y': '2452' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': '\u2014',
              }],
            },

            'selector': {
              'id': '01bd578f-5c40-4c5e-9681-a4f6b3db9fe1',
              'state': { 'height': '64', 'width': '2148', 'x': '120', 'y': '2423' },
              'type': 'box-selector',
            },
            'type': 'entity',
          }, {
            'allowMultiple': true,
            'description': 'All of the lines inside of a paragraph',
            'id': '7fcc4bf9-928c-4674-88e3-7eafb7401def',
            'label': 'Line',
            'labelledBy': 'text',
            'pluralLabel': 'Lines',
            'properties': {
              'text': [{
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'b46b88f9-4cdc-49c1-815c-695342c7b70f',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '168e1863-835f-4ae3-b42d-e03a7de11796',
                  'state': { 'height': '75', 'width': '276', 'x': '119', 'y': '2489' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'beginnen',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '3313065a-9339-4f06-94b6-b40bdc544284',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '5868ec46-4314-4bfe-9ff9-d4f11be1dafa',
                  'state': { 'height': '48', 'width': '88', 'x': '450', 'y': '2501' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'ihr',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '5c1245fc-b9f4-4831-b36e-3a2d802579b0',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'd0f3e8c7-7653-4f0b-8c8b-f1501b3cd7d2',
                  'state': { 'height': '49', 'width': '239', 'x': '592', 'y': '2500' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Werden',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '2e629c93-b14e-40cf-be77-ff37f1605ddf',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'c88599d8-da8d-473a-b948-64ddf04f30c4',
                  'state': { 'height': '47', 'width': '101', 'x': '886', 'y': '2502' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'mit',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'e4f6f7f1-c242-42c0-ba17-514cc0e00da4',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'b47d2bd9-2689-45e8-b6c6-e8843146e703',
                  'state': { 'height': '47', 'width': '152', 'x': '1044', 'y': '2501' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'einer',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '3e2d6526-8881-42c6-a93b-46b539e63820',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'f5a64cb6-f0b0-4d7a-b21b-251087e6cd63',
                  'state': { 'height': '30', 'width': '56', 'x': '1252', 'y': '2518' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'so',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '3e5b14a5-2f3f-46bb-9d29-4dddf6cb8d43',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'cc9325fd-e7cd-40a3-81f7-7d0e01a2a1f7',
                  'state': { 'height': '61', 'width': '270', 'x': '1365', 'y': '2499' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'winzigen',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'f12735cc-5b33-4856-99b7-05375a60ccc1',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '85036933-6331-47d6-a652-943b5860be9a',
                  'state': { 'height': '60', 'width': '226', 'x': '1689', 'y': '2495' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Eizelle,',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '2c5925f8-f439-4f19-bbb3-835934d6df14',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '05653032-8c27-4a15-a84a-69b25d9789a5',
                  'state': { 'height': '59', 'width': '135', 'x': '1967', 'y': '2495' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'und,',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '19275941-49c5-491e-8612-40bd039f188a',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '7fd1076f-72d3-4d82-9987-b61a9d4f3e2f',
                  'state': { 'height': '30', 'width': '106', 'x': '2159', 'y': '2513' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'was',
              }],
            },

            'selector': {
              'id': '83d0bfe0-4ba6-4238-a357-fb97406fd47f',
              'state': { 'height': '75', 'width': '2146', 'x': '119', 'y': '2489' },
              'type': 'box-selector',
            },
            'type': 'entity',
          }, {
            'allowMultiple': true,
            'description': 'All of the lines inside of a paragraph',
            'id': '102af794-2f1d-40f1-980e-1937bdd276db',
            'label': 'Line',
            'labelledBy': 'text',
            'pluralLabel': 'Lines',
            'properties': {
              'text': [{
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '28e3a262-a91b-4bb6-becb-a1accf52bcaf',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '26862c1e-5b37-491b-987a-632e90ab4cb6',
                  'state': { 'height': '48', 'width': '135', 'x': '117', 'y': '2575' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'noch',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'de0e7704-2994-4eb0-8546-02237e8ff364',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'd4a8f1ac-0b3d-4b4f-b698-f19300d627e7',
                  'state': { 'height': '49', 'width': '156', 'x': '298', 'y': '2573' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'mehr',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '0a914f2a-426d-412d-a093-bccb10fc0e91',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'fe69df94-bab7-4a32-907d-87713cf57373',
                  'state': { 'height': '60', 'width': '337', 'x': '497', 'y': '2572' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': '\u00fcberrascht,',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'f511ed08-0d36-4419-ac2d-6d464f64a2b5',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '97a73236-1777-4866-977c-bdfd49c8a603',
                  'state': { 'height': '44', 'width': '158', 'x': '880', 'y': '2591' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'sogar',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '0eae463a-9d9f-4b98-a948-3eb50106d005',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '817e8053-f106-4538-a8d4-0ca28fbc2621',
                  'state': { 'height': '62', 'width': '125', 'x': '1081', 'y': '2571' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'jede',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '807e5d7b-7676-4ddb-8464-a119da51048b',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '0fe445df-8565-4651-b970-aba1083f0d06',
                  'state': { 'height': '49', 'width': '243', 'x': '1251', 'y': '2570' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Pflanze:',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '694b15d9-2fdf-442d-9965-e207acc922fd',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '20314c60-e240-4a38-bf4f-25f49e1eb6f3',
                  'state': { 'height': '54', 'width': '137', 'x': '1541', 'y': '2569' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Eine',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '249769a5-6b2d-41db-9f1a-300605c0d572',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'befb12c0-9a36-45eb-b199-a277075b6f0a',
                  'state': { 'height': '50', 'width': '208', 'x': '1722', 'y': '2568' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Eizelle',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '994544fa-6b41-4682-bccc-ce51434d9358',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '9af873b9-4139-45fc-81be-0d3462a82704',
                  'state': { 'height': '51', 'width': '171', 'x': '1976', 'y': '2567' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'steckt',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '3fec692e-fa98-4a8e-8473-d432af81cca6',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '2bf83c3b-9763-4e81-a8cb-1ede3075bbc3',
                  'state': { 'height': '46', 'width': '75', 'x': '2191', 'y': '2569' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'im',
              }],
            },

            'selector': {
              'id': '0eacf162-03f7-4528-82ca-c3ad4ca260ba',
              'state': { 'height': '68', 'width': '2149', 'x': '117', 'y': '2567' },
              'type': 'box-selector',
            },
            'type': 'entity',
          }, {
            'allowMultiple': true,
            'description': 'All of the lines inside of a paragraph',
            'id': '098ed909-0769-4138-af33-adec7d5d212e',
            'label': 'Line',
            'labelledBy': 'text',
            'pluralLabel': 'Lines',
            'properties': {
              'text': [{
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '2311bb46-6da9-4672-98cb-951bc353da28',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '3fd309f3-b09c-4902-a6c9-bf7ca7ccc46a',
                  'state': { 'height': '51', 'width': '410', 'x': '121', 'y': '2644' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Fruchtknoten',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '724d7c07-04d8-4cac-9eeb-0ea6bb68f1d9',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '07a40c2b-bc97-48b0-a127-b25aa30f4c59',
                  'state': { 'height': '63', 'width': '156', 'x': '570', 'y': '2645' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'jeder',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'a1d3729e-b563-40ff-806f-57a2fdd5210a',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '1c06c9ba-9049-4c33-9c86-09fc19afb0da',
                  'state': { 'height': '50', 'width': '179', 'x': '764', 'y': '2644' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Bl\u00fcte.',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '46d57075-36bb-4c69-96e9-c167bfc6720f',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '6eab8054-7759-48a5-9483-3500e167aafd',
                  'state': { 'height': '50', 'width': '81', 'x': '985', 'y': '2643' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Ob',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '2216dc3a-8eff-425a-b1a6-b6507f758179',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '694012df-67db-48ec-bd72-648486fc13c0',
                  'state': { 'height': '50', 'width': '161', 'x': '1106', 'y': '2643' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Eiche',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '6e9c0884-8829-43c9-9380-2b57f484328b',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'bdc9f560-a266-4236-8870-7cd7a27c5a69',
                  'state': { 'height': '49', 'width': '134', 'x': '1308', 'y': '2643' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'oder',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '61ffdc15-a5bc-42ac-8c91-bf8be5bab6e5',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'a7804f0f-bca0-4e7a-8492-e2c4b736f36f',
                  'state': { 'height': '61', 'width': '174', 'x': '1480', 'y': '2641' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Moos,',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '7b791582-9d45-4580-a804-f334daf1bc88',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '026a452a-947c-4056-a5ae-d0b698ac36e6',
                  'state': { 'height': '50', 'width': '68', 'x': '1695', 'y': '2641' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'ob',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'e78582c9-d299-42b1-a34b-bf49689bb6f4',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '82e08146-e398-4190-b88f-481ee9fff1b0',
                  'state': { 'height': '60', 'width': '170', 'x': '1806', 'y': '2644' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'gr\u00fcne',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '5a47031e-6a00-4a42-a44c-78a5ee4d60a4',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'bd544aac-8f82-44ac-b0d1-5f39c2f222eb',
                  'state': { 'height': '64', 'width': '136', 'x': '2017', 'y': '2639' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Alge',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '75b5aad2-a1b8-4e3d-b5ae-dd5318a89105',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'f57610f8-93f4-4a94-95bf-476b63e4d344',
                  'state': { 'height': '46', 'width': '74', 'x': '2192', 'y': '2641' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'im',
              }],
            },

            'selector': {
              'id': 'e8ce00ee-1df7-4600-8088-adb3a8b617f5',
              'state': { 'height': '69', 'width': '2145', 'x': '121', 'y': '2639' },
              'type': 'box-selector',
            },
            'type': 'entity',
          }, {
            'allowMultiple': true,
            'description': 'All of the lines inside of a paragraph',
            'id': 'd609a851-af74-4ba3-862a-bc6f2fdaf00d',
            'label': 'Line',
            'labelledBy': 'text',
            'pluralLabel': 'Lines',
            'properties': {
              'text': [{
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'ca94f433-7d76-4187-a8c8-53458ad6af25',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '72495b59-2f91-4608-94a7-0fe13576173e',
                  'state': { 'height': '63', 'width': '431', 'x': '123', 'y': '2717' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Wassert\u00fcmpel',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '83ccb5e1-c759-45f2-bd77-7324026fb324',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '30de0551-f659-4357-900b-adf5f462ba1f',
                  'state': { 'height': '49', 'width': '133', 'x': '590', 'y': '2718' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'oder',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'df72c297-c9ea-4b1e-8a73-2e430167675b',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '1953a520-08f3-4d9c-892a-c67c94f0cc07',
                  'state': { 'height': '63', 'width': '240', 'x': '758', 'y': '2717' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'ragende',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'f9cafeec-4833-4e75-997e-08287189b300',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '424d6276-0707-435f-9074-4b3bd18c4aea',
                  'state': { 'height': '50', 'width': '187', 'x': '1034', 'y': '2716' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Tanne',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'b345d05d-12d6-447a-a001-e2299227a480',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '70302c0b-d399-4ceb-81cc-ac7d198f9da1',
                  'state': { 'height': '46', 'width': '74', 'x': '1256', 'y': '2719' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'im',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '6da7717e-c51f-4836-b8ac-3084c6bae2c9',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'd2d6ef1f-aa5e-495c-9a34-a2a47d3c7ae7',
                  'state': { 'height': '63', 'width': '255', 'x': '1366', 'y': '2714' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Gebirge,',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'ffe89cd6-f77d-4bb3-9f75-80e41b93de51',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '9738a2b9-ab60-4003-b048-80566c628a61',
                  'state': { 'height': '50', 'width': '67', 'x': '1658', 'y': '2713' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'ob',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '41fff4ac-abef-4e83-ae50-f9a75f63a51a',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '2da57a65-77f4-47da-8360-fa73faf48b87',
                  'state': { 'height': '50', 'width': '325', 'x': '1761', 'y': '2712' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'leuchtende',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '90c5eb3b-1c95-44d1-9ac8-9f685ca74e88',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'd3b5987e-7289-4e97-8af6-4c3ec43ac3e8',
                  'state': { 'height': '50', 'width': '142', 'x': '2123', 'y': '2711' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Rose',
              }],
            },

            'selector': {
              'id': 'fe5dc86b-c216-4dd3-a602-4a325b572860',
              'state': { 'height': '69', 'width': '2142', 'x': '123', 'y': '2711' },
              'type': 'box-selector',
            },
            'type': 'entity',
          }, {
            'allowMultiple': true,
            'description': 'All of the lines inside of a paragraph',
            'id': 'a7c91199-32d6-48a6-a853-24edc6df5d99',
            'label': 'Line',
            'labelledBy': 'text',
            'pluralLabel': 'Lines',
            'properties': {
              'text': [{
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '44c45aa6-174f-4cba-a79d-59777ecc695e',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '3b73f599-ec13-4301-85d2-89cf62666197',
                  'state': { 'height': '50', 'width': '133', 'x': '120', 'y': '2791' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'oder',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '0861455d-2c92-4f83-bf8f-e1d36207cf8e',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'a6003122-2a80-4a79-9490-932cc19d1bc9',
                  'state': { 'height': '49', 'width': '238', 'x': '282', 'y': '2791' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'bleicher',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '269b144e-1d92-4a10-ac82-7d5f6362772b',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '00b5e4b5-33e3-4582-94b9-c15c97fb3a84',
                  'state': { 'height': '62', 'width': '396', 'x': '551', 'y': '2790' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Schimmelpilz',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '702c0c8b-7adc-4923-b029-96b6f5520206',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '8f9b1e94-90ee-46c8-8e6c-4d12170596ea',
                  'state': { 'height': '4', 'width': '72', 'x': '974', 'y': '2819' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': '\u2014',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '53e5f70e-452e-4532-b6ff-15db7df82a97',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '45674516-4cc6-48e2-ad04-8bd355682a13',
                  'state': { 'height': '52', 'width': '129', 'x': '1075', 'y': '2787' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'alles',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'e769c884-5e99-4ad9-968f-06fe41453d72',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'a746d417-76c0-40eb-8836-7c16bbdd2318',
                  'state': { 'height': '64', 'width': '317', 'x': '1235', 'y': '2787' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'pflanzliche',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'ae8c0879-5bd3-4924-9fe3-62ddd10eca60',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '5c2b58d2-ed17-44dc-8f80-e356c2fe6565',
                  'state': { 'height': '50', 'width': '186', 'x': '1581', 'y': '2785' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Leben',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '4c917b9a-14b4-4e67-9337-aadde9c575e6',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '2e61edb6-27ee-421a-999a-36fec83a39ce',
                  'state': { 'height': '50', 'width': '132', 'x': '1797', 'y': '2784' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'hebt',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '652881a2-c901-4cf1-b8b8-c2592d6f1cfa',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'fb4beff9-12a2-43b6-81d0-f5d88e9f028e',
                  'state': { 'height': '44', 'width': '175', 'x': '1961', 'y': '2804' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'genau',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'e077a812-b30a-459a-abc3-2a6e00d35749',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'c8a186da-e878-4a23-b553-c8fee0c7d399',
                  'state': { 'height': '48', 'width': '101', 'x': '2165', 'y': '2785' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'wie',
              }],
            },

            'selector': {
              'id': '853784b3-2247-4f78-8944-329fc945c99e',
              'state': { 'height': '68', 'width': '2146', 'x': '120', 'y': '2784' },
              'type': 'box-selector',
            },
            'type': 'entity',
          }, {
            'allowMultiple': true,
            'description': 'All of the lines inside of a paragraph',
            'id': '5f19e07f-e785-4973-9f54-bf327ae89037',
            'label': 'Line',
            'labelledBy': 'text',
            'pluralLabel': 'Lines',
            'properties': {
              'text': [{
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '52e51296-9216-4adf-b7fc-577c5701f48b',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'a56c8b22-9a2b-4cea-b455-cd0d9509e32f',
                  'state': { 'height': '50', 'width': '130', 'x': '122', 'y': '2864' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'alles',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '219a62d0-f1a6-499e-820c-acd13b12814d',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '1631a85d-b9c7-4978-9e0e-5a05d23c341c',
                  'state': { 'height': '50', 'width': '252', 'x': '283', 'y': '2863' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'tierische',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'efc752ac-3642-43b1-8799-19ac34726358',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'cece0f82-558d-4448-b672-35669892baeb',
                  'state': { 'height': '50', 'width': '184', 'x': '566', 'y': '2863' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Leben',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'd4fd0efa-2164-47bf-9c8d-3e6b4d2f6545',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '2c4c1f11-31a1-41b7-8e8c-5cb881113e74',
                  'state': { 'height': '47', 'width': '99', 'x': '781', 'y': '2865' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'mit',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '402b4b5d-1436-49b5-98fb-dc72fec21114',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '8c7cbfbe-47f5-4f5e-b09a-87917fe188f0',
                  'state': { 'height': '47', 'width': '153', 'x': '912', 'y': '2865' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'einer',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '4f1d49dc-50fd-4dba-8bd9-05aa0a26e4c5',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '0c0b5a40-4e5f-40f5-a7f6-4327f829ec39',
                  'state': { 'height': '51', 'width': '204', 'x': '1094', 'y': '2862' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Eizelle',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'eda5ec25-0ca7-4209-926c-3dd6c1565b56',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '60880644-20e5-4614-a0db-af8e1459d58e',
                  'state': { 'height': '30', 'width': '82', 'x': '1333', 'y': '2882' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'an.',
              }],
            },

            'selector': {
              'id': '70bd3c62-5a9b-487e-b06f-4cf2672bc0e6',
              'state': { 'height': '52', 'width': '1293', 'x': '122', 'y': '2862' },
              'type': 'box-selector',
            },
            'type': 'entity',
          }, {
            'allowMultiple': true,
            'description': 'All of the lines inside of a paragraph',
            'id': '3ed8000f-d766-4e14-a2be-0b24f76bdfb9',
            'label': 'Line',
            'labelledBy': 'text',
            'pluralLabel': 'Lines',
            'properties': {
              'text': [{
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'f275df91-2eb4-448c-9eae-737fff53fe3f',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'eed7aba0-7400-4900-b261-ab3fa068154d',
                  'state': { 'height': '51', 'width': '104', 'x': '190', 'y': '2940' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Mit',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '22134b2c-605e-421d-8e7d-2d0a52179cfe',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '27a6717b-1379-4a18-89bf-da85f8e24fe8',
                  'state': { 'height': '50', 'width': '178', 'x': '324', 'y': '2941' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'dieser',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '0bdae30a-f43b-4148-b76d-5200f90f246c',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'c056284d-6710-4521-ada3-8ee5dca231ba',
                  'state': { 'height': '51', 'width': '337', 'x': '531', 'y': '2940' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Erkenntnis',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '4b76e115-924f-495a-ba9d-987696e2de4c',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '361a8116-79fd-404b-9f2b-6e6760acac2a',
                  'state': { 'height': '47', 'width': '70', 'x': '898', 'y': '2943' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'ist',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '661b3c4a-f480-4105-9468-2afccb1b0e77',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '5cfcee5f-eb11-4891-b054-129a6826b65d',
                  'state': { 'height': '51', 'width': '131', 'x': '1000', 'y': '2939' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'aber',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '3f9308df-0433-4029-968d-3d15fb584fe3',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '3b1295ab-4e02-47e3-99fb-34c7eb70cf51',
                  'state': { 'height': '49', 'width': '85', 'x': '1162', 'y': '2941' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'die',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'eb01d335-9b73-429a-9195-28768af55835',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '188d53d3-220a-43b2-88b2-32cdc08b32cc',
                  'state': { 'height': '64', 'width': '174', 'x': '1275', 'y': '2940' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Frage',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'a38e05c0-8255-4f3c-96cd-fc13b9ac08f9',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '392e37cb-2171-43ed-b0f6-8e487fbd3347',
                  'state': { 'height': '50', 'width': '132', 'x': '1479', 'y': '2940' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'nach',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '8110a10b-6b0e-41d5-9cbb-6e4a89a7e44a',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '6e29b285-0e28-48fb-ae15-8cec12d2383d',
                  'state': { 'height': '50', 'width': '123', 'x': '1642', 'y': '2940' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'dem',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '9ae6d816-dec0-4437-b1ed-58ad5a4ce970',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '0dcda4e4-889b-4a92-badd-8d9c40a0aace',
                  'state': { 'height': '64', 'width': '212', 'x': '1792', 'y': '2939' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Erbgut',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '6e5e3700-de17-4f72-9180-0edbe00b756e',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '2f9a59df-eda3-41e8-8cdb-09de6c3aee34',
                  'state': { 'height': '59', 'width': '234', 'x': '2032', 'y': '2944' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'wom\u00f6g\u00ac',
              }],
            },

            'selector': {
              'id': 'e0372db5-7ef9-47c6-ba22-38f565975349',
              'state': { 'height': '65', 'width': '2076', 'x': '190', 'y': '2939' },
              'type': 'box-selector',
            },
            'type': 'entity',
          }, {
            'allowMultiple': true,
            'description': 'All of the lines inside of a paragraph',
            'id': 'cb1575df-3989-4d9d-b347-87612a8b5f14',
            'label': 'Line',
            'labelledBy': 'text',
            'pluralLabel': 'Lines',
            'properties': {
              'text': [{
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '87303eb8-4ef4-42d3-bb00-ac00150f2a3a',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '65ba59f3-de4e-45bb-b5a8-15e6c41dd1cf',
                  'state': { 'height': '51', 'width': '99', 'x': '120', 'y': '3013' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'lich',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'b4655a17-e648-4c99-85d3-1d88ab27f486',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '1ab212db-bc9e-4304-be30-2bb8e5d7771b',
                  'state': { 'height': '30', 'width': '106', 'x': '254', 'y': '3033' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'nur',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '3dcf8102-b5e4-41ba-9281-ec4ca67703f4',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'f77ceba8-e59b-4d43-843b-31fa4be51c41',
                  'state': { 'height': '49', 'width': '137', 'x': '391', 'y': '3014' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'noch',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '12abea58-3dbe-4b17-93c1-993a2d903527',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'eb76b479-233b-48ca-b3eb-56bb9ed4e961',
                  'state': { 'height': '50', 'width': '354', 'x': '561', 'y': '3013' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'verzwickter',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '769b3da2-cd57-46bf-aaf1-672c0be0bda2',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'e249676f-cc56-4375-b85a-603b27d94d10',
                  'state': { 'height': '63', 'width': '310', 'x': '952', 'y': '3013' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'geworden:',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '4755506e-9b2d-4742-a632-6a914b6ab345',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '7569402d-6521-4508-8e8b-9e57946a9270',
                  'state': { 'height': '49', 'width': '163', 'x': '1300', 'y': '3013' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Kann',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'b28544de-d72a-4883-a07b-1b7ce5049681',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '648f04c7-f581-4c0a-bc1c-27a9ddf822c5',
                  'state': { 'height': '28', 'width': '126', 'x': '1497', 'y': '3033' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'man',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '4a4cbd21-8a07-466f-b7fc-34ed0e216bc6',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '6b31f98f-125f-4a5d-b50b-2cf6467b494c',
                  'state': { 'height': '50', 'width': '105', 'x': '1660', 'y': '3013' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'sich',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'fc4017f7-8ea9-4b3a-a0bf-b796b25d1b1c',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '8be4e3f4-9974-4f06-969f-2a5493bce6a1',
                  'state': { 'height': '49', 'width': '148', 'x': '1799', 'y': '3012' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'beim',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'af678602-1048-4d4c-a065-43db48f1fe6a',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '935647e2-2e71-40b3-b416-0ad90a094519',
                  'state': { 'height': '49', 'width': '287', 'x': '1981', 'y': '3013' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'H\u00fchnerei',
              }],
            },

            'selector': {
              'id': 'df2e6122-e0d3-426b-958b-d8ad05769d07',
              'state': { 'height': '64', 'width': '2148', 'x': '120', 'y': '3012' },
              'type': 'box-selector',
            },
            'type': 'entity',
          }, {
            'allowMultiple': true,
            'description': 'All of the lines inside of a paragraph',
            'id': 'a8ac8e1d-63e8-407f-b91c-8a7fdab37bc9',
            'label': 'Line',
            'labelledBy': 'text',
            'pluralLabel': 'Lines',
            'properties': {
              'text': [{
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '341fd18c-7262-43b4-94a8-3b4cb1b53830',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'e2ca9f66-bacd-4d83-bad6-079521350b1e',
                  'state': { 'height': '49', 'width': '133', 'x': '120', 'y': '3088' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'noch',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '29a77fca-0115-4c60-b9b5-972171e5437d',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '23d59e09-e6dc-43b2-9194-e60fcaad8265',
                  'state': { 'height': '59', 'width': '317', 'x': '291', 'y': '3087' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'vorstellen,',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '81d6cbe1-9fb9-42c3-ab46-fb024f6df69e',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '9bfea43b-0ab5-40f8-966f-77b261f4a29c',
                  'state': { 'height': '49', 'width': '103', 'x': '646', 'y': '3086' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'da\u00df',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '163adb88-a4ce-4bfd-b1fd-3c786bdf72f2',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'df1e94ba-30ef-45d9-86e5-3116860bb539',
                  'state': { 'height': '46', 'width': '55', 'x': '786', 'y': '3089' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'in',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '6f389871-e5c1-4802-b952-08f292947f53',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '8076fc61-8838-448d-a0b8-1772f6a18da1',
                  'state': { 'height': '48', 'width': '206', 'x': '879', 'y': '3088' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'seinem',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '6a90ed5e-52cf-4f2d-b334-36a16afd4ccb',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '9644af18-05d0-42ec-8c8c-bc7cba21d69f',
                  'state': { 'height': '49', 'width': '204', 'x': '1120', 'y': '3085' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'Innern',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '7026fbe6-300a-432b-88dd-241dab9cb91c',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '95469772-056f-4371-ba4b-e3b1fb72d44d',
                  'state': { 'height': '50', 'width': '92', 'x': '1362', 'y': '3085' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'das',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '59c54414-b663-464b-8168-e7c6ee247b8d',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '79cfa518-65dc-4685-9462-d514d6281a93',
                  'state': { 'height': '60', 'width': '242', 'x': '1491', 'y': '3085' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'K\u00fccken,',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'b89d8300-339a-4f94-b086-5165c6ef55cb',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '0e6d7a32-9d78-435a-8193-8ea95bdb98ec',
                  'state': { 'height': '30', 'width': '159', 'x': '1767', 'y': '3104' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'wenn',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '07be997b-d51d-41aa-8b9d-7125ca2a261a',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': '748dd828-654e-4d54-adc7-286f09ab64e5',
                  'state': { 'height': '49', 'width': '130', 'x': '1965', 'y': '3086' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'auch',
              }, {
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': '2e9816fd-8d75-4fd9-ace8-5fb18a214293',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'ce2a8b6a-ee88-44b2-bf2c-1732b4399878',
                  'state': { 'height': '49', 'width': '135', 'x': '2132', 'y': '3085' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': 'noch',
              }],
            },

            'selector': {
              'id': 'ba8ea381-3ec4-4857-ba27-99910659dc52',
              'state': { 'height': '61', 'width': '2147', 'x': '120', 'y': '3085' },
              'type': 'box-selector',
            },
            'type': 'entity',
          }],
        },

        'selector': {
          'id': 'eda9bbb6-f39a-4ab0-9d6c-122a1e55b775',
          'state': { 'height': '2987', 'width': '2256', 'x': '105', 'y': '165' },
          'type': 'box-selector',
        },
        'type': 'entity',
      }, {
        'allowMultiple': true,
        'description': 'Region of the page denoting a single paragraph',
        'id': 'f31e9e4e-bdc0-46af-92f1-203ebb93c2a0',
        'label': 'Paragraph',
        'labelledBy': 'lines',
        'pluralLabel': 'Paragraphs',
        'properties': {
          'lines': [{
            'allowMultiple': true,
            'description': 'All of the lines inside of a paragraph',
            'id': '7d5c8da8-f99c-4557-b42a-9ca8c93a8cf1',
            'label': 'Line',
            'labelledBy': 'text',
            'pluralLabel': 'Lines',
            'properties': {
              'text': [{
                'allowMultiple': true,
                'description': 'Single word, phrase or the whole line',
                'id': 'cf0b4794-5841-4de3-a941-8530598bce1e',
                'label': 'Text of line',
                'previewInline': true,
                'pluralField': 'Text of lines',

                'selector': {
                  'id': 'b2bf3a63-7e7e-4b55-9ee3-2b44dcca3bef',
                  'state': { 'height': '47', 'width': '29', 'x': '1178', 'y': '3232' },
                  'type': 'box-selector',
                },
                'type': 'text-field',
                'value': '3',
              }],
            },

            'selector': {
              'id': '6c04cb5e-53c8-4eb9-9d74-caa0a723a73d',
              'state': { 'height': '47', 'width': '29', 'x': '1178', 'y': '3232' },
              'type': 'box-selector',
            },
            'type': 'entity',
          }],
        },

        'selector': {
          'id': '793318fd-23b1-4511-847d-d3bad520ee5e',
          'state': { 'height': '3120', 'width': '2256', 'x': '105', 'y': '165' },
          'type': 'box-selector',
        },
        'type': 'entity',
      }],
    },
  },
  contributors: {
    'urn:madoc:user:1': {
      id: 'urn:madoc:user:1',
      type: 'Person',
      name: 'Madoc TS',
    },
  },
};

export const CaptureModelSandbox: React.FC = () => {
  const defaultManifest = text('Manifest', 'https://wellcomelibrary.org/iiif/b18035723/manifest');

  const type = React.useMemo(() => {
    return { type: 'Manifest', id: defaultManifest };
  }, [defaultManifest]);

  return (
    <VaultProvider>
      <h3>Preview</h3>
      <Revisions.Provider captureModel={exampleModel}>
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <div style={{ width: '67%' }}>
            <URLContextExplorer
              defaultResource={type}
              renderChoice={(canvasId, manifestId, reset) => (
                <React.Suspense fallback={<>Loading</>}>
                  <div>
                    <ViewExternalContent
                      target={[
                        { type: 'Canvas', id: canvasId },
                        { type: 'Manifest', id: manifestId },
                      ]}
                    />
                    <TinyButton onClick={reset}>Select different image</TinyButton>
                  </div>
                </React.Suspense>
              )}
            />
          </div>
          <div style={{ width: '33%', padding: '1em' }}>
            <RevisionNavigation
              key={exampleModel}
              structure={exampleModel.structure}
              onSaveRevision={async (rev, status) => {
                console.log(rev, status);
              }}
            />
          </div>
        </div>
      </Revisions.Provider>
    </VaultProvider>
  );
};
