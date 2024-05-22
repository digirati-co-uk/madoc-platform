import { captureModelToRevisionList } from '../../../src/frontend/shared/capture-models/helpers/capture-model-to-revision-list';
import { CaptureModel } from '../../../src/frontend/shared/capture-models/types/capture-model';

// @ts-ignore
import single01 from '../../../fixtures/03-revisions/01-single-field-with-revision.json';
// @ts-ignore
import single02 from '../../../fixtures/03-revisions/02-single-field-with-multiple-revisions.json';
// @ts-ignore
import single03 from '../../../fixtures/03-revisions/03-nested-revision.json';
// @ts-ignore
import single04 from '../../../fixtures/03-revisions/04-dual-transcription.json';
// @ts-ignore
import single05 from '../../../fixtures/03-revisions/05-allow-multiple-transcriptions.json';
// @ts-ignore
import ames02 from '../../../fixtures/99-unrealistic/02-ames.json';
// @ts-ignore
import ns62 from '../../../fixtures/97-bugs/06-model-root-filter.json';

describe('capture model to revision list', () => {
  test('single-field-with-revision', () => {
    expect(captureModelToRevisionList(single01 as CaptureModel)).toMatchInlineSnapshot(`
      [
        {
          "captureModelId": "b329e009-1c8a-4bed-bfde-c2a587a22f97",
          "document": {
            "description": "",
            "id": "3353dc03-9f35-49e7-9b81-4090fa533c64",
            "label": "Simple document",
            "properties": {
              "name": [
                {
                  "description": "The name of the thing",
                  "id": "eafb62d7-71b7-47bd-b887-def8655d8d2a",
                  "label": "Name",
                  "revision": "7c26cf57-5950-4849-b533-11e0ee4afa4b",
                  "type": "text-field",
                  "value": "Some value that was submitted",
                },
              ],
            },
            "type": "entity",
          },
          "revision": {
            "fields": [
              "name",
            ],
            "id": "7c26cf57-5950-4849-b533-11e0ee4afa4b",
            "structureId": "31b27c9b-2388-47df-b6f4-73fb4878c1fa",
          },
          "source": "structure",
        },
      ]
    `);
  });

  test('single-field-with-revision', () => {
    expect(captureModelToRevisionList(single02 as CaptureModel)).toMatchInlineSnapshot(`
      [
        {
          "captureModelId": "93d09b85-9332-4b71-8e27-1294c8a963f3",
          "document": {
            "description": "",
            "id": "b3f53013-23cc-45db-825a-12500bf3c20e",
            "label": "Simple document",
            "properties": {
              "name": [
                {
                  "description": "The name of the thing",
                  "id": "baf51d8c-ce99-4bf4-afd0-0ca2092a7784",
                  "label": "Name",
                  "revision": "514c8d52-80b0-49c1-ab97-24a67f29d194",
                  "type": "text-field",
                  "value": "Person A wrote this",
                },
              ],
            },
            "type": "entity",
          },
          "revision": {
            "authors": [
              "514c8d52-80b0-49c1-ab97-24a67f29d194",
            ],
            "fields": [
              "name",
            ],
            "id": "514c8d52-80b0-49c1-ab97-24a67f29d194",
            "status": "draft",
          },
          "source": "unknown",
        },
        {
          "captureModelId": "93d09b85-9332-4b71-8e27-1294c8a963f3",
          "document": {
            "description": "",
            "id": "b3f53013-23cc-45db-825a-12500bf3c20e",
            "label": "Simple document",
            "properties": {
              "name": [
                {
                  "description": "The name of the thing",
                  "id": "205c9b62-48e3-43ff-8853-222dcd357710",
                  "label": "Name",
                  "revision": "b4077dff-3bea-4783-9712-32b52a1146e3",
                  "type": "text-field",
                  "value": "Person B wrote this",
                },
              ],
            },
            "type": "entity",
          },
          "revision": {
            "authors": [
              "b4077dff-3bea-4783-9712-32b52a1146e3",
            ],
            "fields": [
              "name",
            ],
            "id": "b4077dff-3bea-4783-9712-32b52a1146e3",
            "status": "draft",
          },
          "source": "unknown",
        },
      ]
    `);
  });

  test('nested-revision', () => {
    expect(captureModelToRevisionList(single03 as CaptureModel)).toMatchInlineSnapshot(`
      [
        {
          "captureModelId": "2cc4131d-4f8d-4ceb-b140-48cd513b5e4f",
          "document": {
            "description": "",
            "id": "a8d5ff43-adb2-456a-a615-3d24fbfa05f7",
            "label": "Nested choices",
            "properties": {
              "name": [
                {
                  "description": "The name of the thing",
                  "id": "a1ed84d2-c44c-4877-ac3d-10559acd7fce",
                  "label": "Name",
                  "type": "text-field",
                  "value": "",
                },
              ],
              "person": [
                {
                  "description": "Describe a person",
                  "id": "5c8a5874-8bca-422c-be71-300612d67c72",
                  "label": "Person",
                  "properties": {
                    "firstName": [
                      {
                        "id": "dda6d8bc-ca6d-48e0-8bcc-a24537586346",
                        "label": "First name",
                        "revision": "fa500021-7408-4318-ab05-ac6e4d4a3096",
                        "type": "text-field",
                        "value": "Some value",
                      },
                    ],
                    "lastName": [
                      {
                        "id": "f5e7480c-411e-486d-a91e-0bf24f146ab5",
                        "label": "Last name",
                        "type": "text-field",
                        "value": "",
                      },
                    ],
                  },
                  "type": "entity",
                },
              ],
            },
            "type": "entity",
          },
          "revision": {
            "fields": [
              [
                "person",
                [
                  "firstName",
                  "lastName",
                ],
              ],
              "name",
            ],
            "id": "fa500021-7408-4318-ab05-ac6e4d4a3096",
          },
          "source": "unknown",
        },
      ]
    `);
  });

  test('dual-transcription', () => {
    expect(captureModelToRevisionList(single04 as CaptureModel)).toMatchInlineSnapshot(`
      [
        {
          "captureModelId": "737150d3-2c72-4eeb-9fd4-42ad085cdf7f",
          "document": {
            "id": "279e8fb2-13c3-43cc-aff2-2b41d9025828",
            "label": "Name of entity",
            "properties": {
              "transcription": [
                {
                  "allowMultiple": false,
                  "id": "c0ac6fd6-9146-4eac-a2b3-0067bc689cb6",
                  "label": "Transcription",
                  "revises": "762eff26-1590-4194-b93b-5a337ae40ad2",
                  "revision": "04267f75-bb8d-4321-8046-12db3f9d6ceb",
                  "type": "text-field",
                  "value": "Person A created this one",
                },
              ],
            },
            "type": "entity",
          },
          "revision": {
            "authors": [
              "04267f75-bb8d-4321-8046-12db3f9d6ceb",
            ],
            "fields": [
              "transcription",
            ],
            "id": "04267f75-bb8d-4321-8046-12db3f9d6ceb",
          },
          "source": "unknown",
        },
        {
          "captureModelId": "737150d3-2c72-4eeb-9fd4-42ad085cdf7f",
          "document": {
            "id": "279e8fb2-13c3-43cc-aff2-2b41d9025828",
            "label": "Name of entity",
            "properties": {
              "transcription": [
                {
                  "allowMultiple": false,
                  "id": "c2b68f02-cce4-4a12-940b-d1359d89e807",
                  "label": "Transcription",
                  "revises": "762eff26-1590-4194-b93b-5a337ae40ad2",
                  "revision": "81ab315e-200e-4649-bb11-99db766a5f66",
                  "type": "text-field",
                  "value": "Person B created this one",
                },
              ],
            },
            "type": "entity",
          },
          "revision": {
            "authors": [
              "81ab315e-200e-4649-bb11-99db766a5f66",
            ],
            "fields": [
              "transcription",
            ],
            "id": "81ab315e-200e-4649-bb11-99db766a5f66",
          },
          "source": "unknown",
        },
      ]
    `);
  });

  test('dual-transcription', () => {
    expect(captureModelToRevisionList(single05 as CaptureModel)).toMatchInlineSnapshot(`
      [
        {
          "captureModelId": "143d9c4a-5d4e-4ca2-89f3-dc4bd7b45e3e",
          "document": {
            "id": "47e8a9d8-76f8-422b-91af-b457d1c624a0",
            "label": "Name of entity",
            "properties": {
              "transcription": [
                {
                  "allowMultiple": true,
                  "id": "2666cf79-ef2f-419f-a3f4-038216a89783",
                  "label": "Transcription",
                  "revises": "1615a172-b2c5-4192-bcc1-606a871b6230",
                  "revision": "f496a9aa-25eb-4b1d-9d94-9cdcef03e527",
                  "type": "text-field",
                  "value": "Person A created this one, which revises the original",
                },
              ],
            },
            "type": "entity",
          },
          "revision": {
            "approved": true,
            "fields": [
              "transcription",
            ],
            "id": "f496a9aa-25eb-4b1d-9d94-9cdcef03e527",
            "status": "accepted",
            "structureId": "fd847948-11bf-42ca-bfdd-cab85ea818f3",
          },
          "source": "structure",
        },
        {
          "captureModelId": "143d9c4a-5d4e-4ca2-89f3-dc4bd7b45e3e",
          "document": {
            "id": "47e8a9d8-76f8-422b-91af-b457d1c624a0",
            "label": "Name of entity",
            "properties": {
              "transcription": [
                {
                  "allowMultiple": true,
                  "id": "1efd5946-a3a1-484f-a862-710741a3b682",
                  "label": "Transcription",
                  "revision": "daf3f9d9-2a16-4c1f-8657-3560775bd9eb",
                  "type": "text-field",
                  "value": "Person B created this one, which is completely new",
                },
              ],
            },
            "type": "entity",
          },
          "revision": {
            "approved": true,
            "fields": [
              "transcription",
            ],
            "id": "daf3f9d9-2a16-4c1f-8657-3560775bd9eb",
            "status": "accepted",
            "structureId": "fd847948-11bf-42ca-bfdd-cab85ea818f3",
          },
          "source": "structure",
        },
        {
          "captureModelId": "143d9c4a-5d4e-4ca2-89f3-dc4bd7b45e3e",
          "document": {
            "id": "47e8a9d8-76f8-422b-91af-b457d1c624a0",
            "label": "Name of entity",
            "properties": {
              "transcription": [
                {
                  "allowMultiple": true,
                  "id": "892f3abe-bbbe-4b1e-9167-a52ec76ea5c1",
                  "label": "Transcription",
                  "revision": "bb5d55b1-6c38-4bb9-a6e6-ed236347671b",
                  "type": "text-field",
                  "value": "Person C created this one",
                },
              ],
            },
            "type": "entity",
          },
          "revision": {
            "fields": [
              "transcription",
            ],
            "id": "bb5d55b1-6c38-4bb9-a6e6-ed236347671b",
            "status": "submitted",
            "structureId": "fd847948-11bf-42ca-bfdd-cab85ea818f3",
          },
          "source": "structure",
        },
        {
          "captureModelId": "143d9c4a-5d4e-4ca2-89f3-dc4bd7b45e3e",
          "document": {
            "id": "47e8a9d8-76f8-422b-91af-b457d1c624a0",
            "label": "Name of entity",
            "properties": {
              "transcription": [
                {
                  "allowMultiple": true,
                  "id": "2666cf79-ef2f-419f-a3f4-038216a89783",
                  "label": "Transcription",
                  "revises": "1615a172-b2c5-4192-bcc1-606a871b6230",
                  "revision": "f496a9aa-25eb-4b1d-9d94-9cdcef03e527",
                  "type": "text-field",
                  "value": "Person A created this one, which revises the original",
                },
                {
                  "allowMultiple": true,
                  "id": "912683e3-fd6e-4599-bb0f-acd232c9cf87",
                  "label": "Transcription",
                  "revises": "2666cf79-ef2f-419f-a3f4-038216a89783",
                  "revision": "896c6278-655a-4a39-965c-08abbffb0bf2",
                  "type": "text-field",
                  "value": "Person D created this one, which overrides Person As one",
                },
              ],
            },
            "type": "entity",
          },
          "revision": {
            "fields": [
              "transcription",
            ],
            "id": "896c6278-655a-4a39-965c-08abbffb0bf2",
            "revises": "f496a9aa-25eb-4b1d-9d94-9cdcef03e527",
            "status": "submitted",
            "structureId": "fd847948-11bf-42ca-bfdd-cab85ea818f3",
          },
          "source": "structure",
        },
      ]
    `);
  });

  test('ames', () => {
    expect(captureModelToRevisionList(ames02 as CaptureModel, true)).toMatchInlineSnapshot(`
      [
        {
          "captureModelId": "5aff4557-b331-4181-9030-1097f5220b67",
          "document": {
            "description": "Entities and fields that can be used to annotate court proceeding documents",
            "id": "a539ffda-aaec-4885-bc6c-a01cebeed1b4",
            "label": "Early Court Records",
            "properties": {
              "Nation": [
                {
                  "id": "2ea4f20c-86ff-4da6-8b81-8e38abd532e3",
                  "label": "Nation",
                  "properties": {
                    "Early America": [
                      {
                        "id": "172d059a-ffe9-4568-a35f-b5de60538a59",
                        "label": "Early America",
                        "properties": {
                          "Massachusetts": [
                            {
                              "id": "9cf9ca8e-2e2f-4f25-9c91-4cf714067d03",
                              "label": "Massachusetts",
                              "properties": {
                                "CourtProceeding": [
                                  {
                                    "id": "4368c4a8-ef38-4a25-95e4-3420af5ca2ee",
                                    "label": "CourtProceeding",
                                    "properties": {
                                      "CaseName": [
                                        {
                                          "description": "The name that a case would be commonly called, such as Jones v. Smith",
                                          "id": "c19add98-ea9a-4033-8e47-d71d377ddddf",
                                          "label": "Case Name",
                                          "selector": {
                                            "id": "951fe3ba-b39d-4c16-93b6-ea1069bd60a5",
                                            "state": null,
                                            "type": "box-selector",
                                          },
                                          "type": "text-field",
                                          "value": "",
                                        },
                                      ],
                                      "ColonyName": [
                                        {
                                          "description": "The name of the colony in which the court proceeding took place.",
                                          "id": "a7680c67-b616-45f2-b925-b016c644e4a0",
                                          "label": "Colony Name",
                                          "type": "text-field",
                                          "value": "",
                                        },
                                      ],
                                      "CourtProceedingBeginMonth": [
                                        {
                                          "description": "The month of the year in which the court began its session.",
                                          "id": "0baa18ce-231f-4122-83e5-fe5e9478e2b2",
                                          "label": "CourtTermBeginMonth",
                                          "type": "text-field",
                                          "value": "",
                                        },
                                      ],
                                      "CourtProceedingType": [
                                        {
                                          "clearable": true,
                                          "description": "Indicates what kind of proceeding is reflected in the court record, what exactly the court is doing.",
                                          "id": "d28140bf-238f-48d0-af77-02c5bc41e223",
                                          "label": "Court Proceeding Type",
                                          "options": [
                                            {
                                              "text": "Admission of Attorneys",
                                              "value": "Admission of Attorneys",
                                            },
                                            {
                                              "text": "Appeal [judges only]",
                                              "value": "Appeal [judges only]",
                                            },
                                            {
                                              "text": "Appeal by Review",
                                              "value": "Appeal by Review",
                                            },
                                            {
                                              "text": "Appeal in Chancery",
                                              "value": "Appeal in Chancery",
                                            },
                                            {
                                              "text": "Appeal with Jury",
                                              "value": "Appeal with Jury",
                                            },
                                            {
                                              "text": "Appeal with Referee",
                                              "value": "Appeal with Referee",
                                            },
                                            {
                                              "text": "Hearing - Petition",
                                              "value": "Hearing - Petition",
                                            },
                                            {
                                              "text": "Hearing - Petition for sale of real estate",
                                              "value": "Hearing - Petition for sale of real estate",
                                            },
                                            {
                                              "text": "Hearing - Petition for division of real estate",
                                              "value": "Hearing - Petition for division of real estate",
                                            },
                                            {
                                              "text": "Naturalization",
                                              "value": "Naturalization",
                                            },
                                            {
                                              "text": "Trial of First Instance",
                                              "value": "Trial of First Instance",
                                            },
                                            {
                                              "text": "Other",
                                              "value": "Other",
                                            },
                                          ],
                                          "type": "dropdown-field",
                                          "value": null,
                                        },
                                      ],
                                      "CourtTermBeginYear": [
                                        {
                                          "description": "The year in which the court began a session.",
                                          "id": "6545da7e-1bad-4b9e-afbf-221d3e17320d",
                                          "label": "Court Term Begin Year",
                                          "type": "text-field",
                                          "value": "",
                                        },
                                      ],
                                      "CourtTermCity": [
                                        {
                                          "description": "The city in which the court held a session.",
                                          "id": "80cbcf7c-c89c-400b-a971-8b3c897a3fb8",
                                          "label": "Court Term City",
                                          "type": "text-field",
                                          "value": "",
                                        },
                                      ],
                                      "OtherCourtProceedingType": [
                                        {
                                          "description": "A court proceeding type that is no a common proceeding, but has been noted in the court record.",
                                          "id": "d4e53036-be4e-4b3c-9d1f-7ca6dc1b3962",
                                          "label": "Other Court Proceeding Type",
                                          "type": "text-field",
                                          "value": "",
                                        },
                                      ],
                                      "ProceedingID": [
                                        {
                                          "description": "The unique identifier of the court proceeding in the format XXYYY-zzzzzzzzz, where
      XX = colony abbreviation (i.e., MA for Massachusetts), 
      YYY = tribunal (i.e., SCJ for Superior Court of Judicature) (may be more or less that 3 characters),
      zzzzzzzzz = incremental number beginning with 000000001",
                                          "id": "e8bc6b2a-0853-445b-b592-1eb1df038ad3",
                                          "label": "Court Proceeding ID",
                                          "type": "text-field",
                                          "value": "",
                                        },
                                      ],
                                      "TribunalName": [
                                        {
                                          "description": "The name of the court in which the proceeding occurred.",
                                          "id": "a86ac9fc-031a-4424-b86d-1d7642800122",
                                          "label": "Tribunal Name",
                                          "type": "text-field",
                                          "value": "",
                                        },
                                      ],
                                      "VariantCaseName": [
                                        {
                                          "description": "An alternate name for the case, as found in the court record.",
                                          "id": "5a21cf64-b799-4370-b356-fe3305b5fcb8",
                                          "label": "Variant Case Name",
                                          "selector": {
                                            "id": "887f2af0-912f-499a-ac03-46f486ff27db",
                                            "state": null,
                                            "type": "box-selector",
                                          },
                                          "type": "text-field",
                                          "value": "",
                                        },
                                      ],
                                      "VolumeName": [
                                        {
                                          "description": "The name of the volume containing the record of the court proceeding.",
                                          "id": "27fd80ed-971e-4220-b4a4-4d75d44c36a1",
                                          "label": "VolumeName",
                                          "type": "text-field",
                                          "value": "",
                                        },
                                      ],
                                      "VolumePage": [
                                        {
                                          "description": "Identifies the specific page within a volume of court proceedings, i.e., 31 recto for front side of page 31 or 31 verso for backside of page 31.",
                                          "id": "45565ffa-211a-4dba-be4e-95995be9f87d",
                                          "label": "Volume Page",
                                          "type": "text-field",
                                          "value": "",
                                        },
                                      ],
                                    },
                                    "type": "entity",
                                  },
                                ],
                              },
                              "type": "entity",
                            },
                          ],
                        },
                        "type": "entity",
                      },
                    ],
                  },
                  "type": "entity",
                },
              ],
            },
            "type": "entity",
          },
          "modelRoot": undefined,
          "revision": {
            "approved": true,
            "fields": [
              [
                "Nation",
                [
                  [
                    "Early America",
                    [
                      [
                        "Massachusetts",
                        [
                          [
                            "CourtProceeding",
                            [
                              "ProceedingID",
                              "ColonyName",
                              "TribunalName",
                              "VolumeName",
                              "VolumePage",
                              "CourtProceedingBeginMonth",
                              "CourtTermBeginYear",
                              "CourtTermCity",
                              "CaseName",
                              "VariantCaseName",
                              "CourtProceedingType",
                              "OtherCourtProceedingType",
                            ],
                          ],
                        ],
                      ],
                    ],
                  ],
                ],
              ],
            ],
            "id": "4f8d8d46-1e27-4d77-a33e-56a37992487d",
            "label": "Court Proceeding ID",
            "structureId": "4f8d8d46-1e27-4d77-a33e-56a37992487d",
          },
          "source": "canonical",
        },
      ]
    `);
  });

  test('NS-62 bug', () => {
    // captureModelToRevisionList
    expect(captureModelToRevisionList(ns62 as any as CaptureModel)).toMatchInlineSnapshot(`
      [
        {
          "captureModelId": "8a1a1d8e-fc2c-4dc9-901f-5d311253aae4",
          "document": {
            "id": "d8ddef02-b2c3-4e45-b424-36bc9797e0b1",
            "immutable": true,
            "label": "Transcribe the Peace Petition",
            "properties": {
              "pp2transcription": [
                {
                  "allowMultiple": false,
                  "id": "bfd1afec-630a-418a-b9d9-ee9b7a8fdc5f",
                  "label": "Transcription",
                  "labelledBy": "{pp2-name} @ {pp2-address}",
                  "pluralLabel": "Transcriptions",
                  "properties": {
                    "pp2-address": [
                      {
                        "description": "Please transcribe the address next to the name",
                        "id": "edb617aa-aa64-4983-b58f-1b441c911027",
                        "label": "Address",
                        "pluralField": "Addresses",
                        "revision": "d37dde47-f2ed-4f73-8d11-966a6c69deff",
                        "type": "text-field",
                        "value": "Police Station, Llanwenog",
                      },
                    ],
                    "pp2-difficult": [
                      {
                        "id": "5c204aed-e14d-47cd-b7c5-f54b7774cfbf",
                        "inlineLabel": "Tick if you are not confident that your transcription is accurate.",
                        "label": "Text difficult to transcribe?",
                        "revision": "d37dde47-f2ed-4f73-8d11-966a6c69deff",
                        "type": "checkbox-field",
                        "value": false,
                      },
                    ],
                    "pp2-empty": [
                      {
                        "id": "d974ef30-79cd-4348-854f-996ad0b27b37",
                        "inlineLabel": "Tick this box if the page contains no names to transcribe",
                        "label": "Is this an empty page?",
                        "revision": "d37dde47-f2ed-4f73-8d11-966a6c69deff",
                        "type": "checkbox-field",
                        "value": false,
                      },
                    ],
                    "pp2-name": [
                      {
                        "description": "Please transcribe the name you have selected",
                        "id": "95da2322-4439-4aff-bab2-9a4d03847c96",
                        "label": "Name",
                        "pluralField": "Names",
                        "required": true,
                        "revision": "d37dde47-f2ed-4f73-8d11-966a6c69deff",
                        "type": "text-field",
                        "value": "Elizabeth Jones",
                      },
                    ],
                  },
                  "revision": "d37dde47-f2ed-4f73-8d11-966a6c69deff",
                  "selector": {
                    "id": "9985cdce-0dab-4886-8e23-21b13cdb4fa6",
                    "revisedBy": [],
                    "state": {
                      "height": 381,
                      "width": 3065,
                      "x": 202,
                      "y": 600,
                    },
                    "type": "box-selector",
                  },
                  "type": "entity",
                },
              ],
            },
            "type": "entity",
          },
          "revision": {
            "approved": true,
            "authors": [
              "urn:madoc:user:216",
            ],
            "captureModelId": "8a1a1d8e-fc2c-4dc9-901f-5d311253aae4",
            "fields": [
              [
                "pp2transcription",
                [
                  "pp2-name",
                  "pp2-address",
                  "pp2-difficult",
                  "pp2-empty",
                ],
              ],
            ],
            "id": "d37dde47-f2ed-4f73-8d11-966a6c69deff",
            "label": "Peace Petition",
            "revises": "178fca6d-3624-4b8a-9af7-2c50e4034edc",
            "status": "accepted",
            "structureId": "178fca6d-3624-4b8a-9af7-2c50e4034edc",
          },
          "source": "structure",
        },
        {
          "captureModelId": "8a1a1d8e-fc2c-4dc9-901f-5d311253aae4",
          "document": {
            "id": "d8ddef02-b2c3-4e45-b424-36bc9797e0b1",
            "immutable": true,
            "label": "Transcribe the Peace Petition",
            "properties": {
              "pp2transcription": [
                {
                  "allowMultiple": false,
                  "id": "257963c1-abce-4124-af8a-dba1d5b718ee",
                  "label": "Transcription",
                  "labelledBy": "{pp2-name} @ {pp2-address}",
                  "pluralLabel": "Transcriptions",
                  "properties": {
                    "pp2-address": [
                      {
                        "description": "Please transcribe the address next to the name",
                        "id": "f88e78fe-585a-41cb-b8e0-be50f48a09af",
                        "label": "Address",
                        "pluralField": "Addresses",
                        "revision": "d39d3d75-31e5-4a1a-894d-688063f89b6a",
                        "type": "text-field",
                        "value": "Derlwyn, Drefach, Llanwenog",
                      },
                    ],
                    "pp2-difficult": [
                      {
                        "id": "aa8b3c37-83f8-4e12-b00a-fda42e1de0fb",
                        "inlineLabel": "Tick if you are not confident that your transcription is accurate.",
                        "label": "Text difficult to transcribe?",
                        "revision": "d39d3d75-31e5-4a1a-894d-688063f89b6a",
                        "type": "checkbox-field",
                        "value": false,
                      },
                    ],
                    "pp2-empty": [
                      {
                        "id": "cd4d0ba6-f663-4c51-b6ff-f62eac3003fc",
                        "inlineLabel": "Tick this box if the page contains no names to transcribe",
                        "label": "Is this an empty page?",
                        "revision": "d39d3d75-31e5-4a1a-894d-688063f89b6a",
                        "type": "checkbox-field",
                        "value": false,
                      },
                    ],
                    "pp2-name": [
                      {
                        "description": "Please transcribe the name you have selected",
                        "id": "e4d76498-0138-4acb-9f1b-0a54686e7dcb",
                        "label": "Name",
                        "pluralField": "Names",
                        "required": true,
                        "revision": "d39d3d75-31e5-4a1a-894d-688063f89b6a",
                        "type": "text-field",
                        "value": "Lizzie Jones",
                      },
                    ],
                  },
                  "revision": "d39d3d75-31e5-4a1a-894d-688063f89b6a",
                  "selector": {
                    "id": "b6355106-9332-48d4-bb86-f684495e2540",
                    "revisedBy": [],
                    "state": {
                      "height": 283,
                      "width": 3250,
                      "x": 185,
                      "y": 813,
                    },
                    "type": "box-selector",
                  },
                  "type": "entity",
                },
              ],
            },
            "type": "entity",
          },
          "revision": {
            "approved": true,
            "authors": [
              "urn:madoc:user:216",
            ],
            "captureModelId": "8a1a1d8e-fc2c-4dc9-901f-5d311253aae4",
            "fields": [
              [
                "pp2transcription",
                [
                  "pp2-name",
                  "pp2-address",
                  "pp2-difficult",
                  "pp2-empty",
                ],
              ],
            ],
            "id": "d39d3d75-31e5-4a1a-894d-688063f89b6a",
            "label": "Peace Petition",
            "revises": "178fca6d-3624-4b8a-9af7-2c50e4034edc",
            "status": "accepted",
            "structureId": "178fca6d-3624-4b8a-9af7-2c50e4034edc",
          },
          "source": "structure",
        },
        {
          "captureModelId": "8a1a1d8e-fc2c-4dc9-901f-5d311253aae4",
          "document": {
            "id": "d8ddef02-b2c3-4e45-b424-36bc9797e0b1",
            "immutable": true,
            "label": "Transcribe the Peace Petition",
            "properties": {
              "pp2transcription": [
                {
                  "allowMultiple": false,
                  "id": "289f74d0-a291-4615-9fc0-227d1c183c00",
                  "label": "Transcription",
                  "labelledBy": "{pp2-name} @ {pp2-address}",
                  "pluralLabel": "Transcriptions",
                  "properties": {
                    "pp2-address": [
                      {
                        "description": "Please transcribe the address next to the name",
                        "id": "297fdcb6-d94d-4b6d-994b-704a53ca4c08",
                        "label": "Address",
                        "pluralField": "Addresses",
                        "revision": "b4f24af9-3017-43e7-8e5b-48483da6d803",
                        "type": "text-field",
                        "value": "Alltyblacca Farm, Llanwenog",
                      },
                    ],
                    "pp2-difficult": [
                      {
                        "id": "a1397db0-35d5-4879-8f55-6be9b576b7dc",
                        "inlineLabel": "Tick if you are not confident that your transcription is accurate.",
                        "label": "Text difficult to transcribe?",
                        "revision": "b4f24af9-3017-43e7-8e5b-48483da6d803",
                        "type": "checkbox-field",
                        "value": false,
                      },
                    ],
                    "pp2-empty": [
                      {
                        "id": "3814677f-a913-4790-9b17-fb4d9cd551ea",
                        "inlineLabel": "Tick this box if the page contains no names to transcribe",
                        "label": "Is this an empty page?",
                        "revision": "b4f24af9-3017-43e7-8e5b-48483da6d803",
                        "type": "checkbox-field",
                        "value": false,
                      },
                    ],
                    "pp2-name": [
                      {
                        "description": "Please transcribe the name you have selected",
                        "id": "df977dde-a1f9-40db-a484-f93eb95ff5ae",
                        "label": "Name",
                        "pluralField": "Names",
                        "required": true,
                        "revision": "b4f24af9-3017-43e7-8e5b-48483da6d803",
                        "type": "text-field",
                        "value": "Gwennie A. Price",
                      },
                    ],
                  },
                  "revision": "b4f24af9-3017-43e7-8e5b-48483da6d803",
                  "selector": {
                    "id": "6addb95a-cb9a-4525-8f23-4536250e3fc8",
                    "revisedBy": [],
                    "state": {
                      "height": 219,
                      "width": 3061,
                      "x": 151,
                      "y": 1504,
                    },
                    "type": "box-selector",
                  },
                  "type": "entity",
                },
              ],
            },
            "type": "entity",
          },
          "revision": {
            "approved": true,
            "authors": [
              "urn:madoc:user:216",
            ],
            "captureModelId": "8a1a1d8e-fc2c-4dc9-901f-5d311253aae4",
            "fields": [
              [
                "pp2transcription",
                [
                  "pp2-name",
                  "pp2-address",
                  "pp2-difficult",
                  "pp2-empty",
                ],
              ],
            ],
            "id": "b4f24af9-3017-43e7-8e5b-48483da6d803",
            "label": "Peace Petition",
            "revises": "178fca6d-3624-4b8a-9af7-2c50e4034edc",
            "status": "accepted",
            "structureId": "178fca6d-3624-4b8a-9af7-2c50e4034edc",
          },
          "source": "structure",
        },
        {
          "captureModelId": "8a1a1d8e-fc2c-4dc9-901f-5d311253aae4",
          "document": {
            "id": "d8ddef02-b2c3-4e45-b424-36bc9797e0b1",
            "immutable": true,
            "label": "Transcribe the Peace Petition",
            "properties": {
              "pp2transcription": [
                {
                  "allowMultiple": false,
                  "id": "6206fd11-6245-4ba8-99d0-baeebbe9a6e7",
                  "label": "Transcription",
                  "labelledBy": "{pp2-name} @ {pp2-address}",
                  "pluralLabel": "Transcriptions",
                  "properties": {
                    "pp2-address": [
                      {
                        "description": "Please transcribe the address next to the name",
                        "id": "ebabf020-33fa-4f06-8800-659891386397",
                        "label": "Address",
                        "pluralField": "Addresses",
                        "revision": "3a0a6aa4-5bca-4423-a6f2-7a50ee43b1dd",
                        "type": "text-field",
                        "value": "Nantfach, Alltyblacca, Llanwenog",
                      },
                    ],
                    "pp2-difficult": [
                      {
                        "id": "bdce663f-3009-4d56-81f6-842113583e54",
                        "inlineLabel": "Tick if you are not confident that your transcription is accurate.",
                        "label": "Text difficult to transcribe?",
                        "revision": "3a0a6aa4-5bca-4423-a6f2-7a50ee43b1dd",
                        "type": "checkbox-field",
                        "value": false,
                      },
                    ],
                    "pp2-empty": [
                      {
                        "id": "eb6e86ca-2b88-42f5-8d91-f8b4dd28b234",
                        "inlineLabel": "Tick this box if the page contains no names to transcribe",
                        "label": "Is this an empty page?",
                        "revision": "3a0a6aa4-5bca-4423-a6f2-7a50ee43b1dd",
                        "type": "checkbox-field",
                        "value": false,
                      },
                    ],
                    "pp2-name": [
                      {
                        "description": "Please transcribe the name you have selected",
                        "id": "587f45e9-3f77-4a92-84ac-4ab75dcc3ae4",
                        "label": "Name",
                        "pluralField": "Names",
                        "required": true,
                        "revision": "3a0a6aa4-5bca-4423-a6f2-7a50ee43b1dd",
                        "type": "text-field",
                        "value": "Mary Evans",
                      },
                    ],
                  },
                  "revision": "3a0a6aa4-5bca-4423-a6f2-7a50ee43b1dd",
                  "selector": {
                    "id": "3802d12a-181b-4063-9dac-36f9b25f8247",
                    "revisedBy": [],
                    "state": {
                      "height": 183,
                      "width": 3187,
                      "x": 168,
                      "y": 1789,
                    },
                    "type": "box-selector",
                  },
                  "type": "entity",
                },
              ],
            },
            "type": "entity",
          },
          "revision": {
            "approved": true,
            "authors": [
              "urn:madoc:user:216",
            ],
            "captureModelId": "8a1a1d8e-fc2c-4dc9-901f-5d311253aae4",
            "fields": [
              [
                "pp2transcription",
                [
                  "pp2-name",
                  "pp2-address",
                  "pp2-difficult",
                  "pp2-empty",
                ],
              ],
            ],
            "id": "3a0a6aa4-5bca-4423-a6f2-7a50ee43b1dd",
            "label": "Peace Petition",
            "revises": "178fca6d-3624-4b8a-9af7-2c50e4034edc",
            "status": "accepted",
            "structureId": "178fca6d-3624-4b8a-9af7-2c50e4034edc",
          },
          "source": "structure",
        },
        {
          "captureModelId": "8a1a1d8e-fc2c-4dc9-901f-5d311253aae4",
          "document": {
            "id": "d8ddef02-b2c3-4e45-b424-36bc9797e0b1",
            "immutable": true,
            "label": "Transcribe the Peace Petition",
            "properties": {
              "pp2transcription": [
                {
                  "allowMultiple": false,
                  "id": "577f7370-23cc-4a3b-bc61-2b3942ff03ad",
                  "label": "Transcription",
                  "labelledBy": "{pp2-name} @ {pp2-address}",
                  "pluralLabel": "Transcriptions",
                  "properties": {
                    "pp2-address": [
                      {
                        "description": "Please transcribe the address next to the name",
                        "id": "1a45358e-8e97-4204-82be-fb8817ef7747",
                        "label": "Address",
                        "pluralField": "Addresses",
                        "revision": "73c6e344-a6c0-4e2a-8564-3f4e9bd01d6f",
                        "type": "text-field",
                        "value": "Awelfryn, Alltyblacca, Llanwenog",
                      },
                    ],
                    "pp2-difficult": [
                      {
                        "id": "e67aaa9e-2f64-4a88-a685-909b539fa1ed",
                        "inlineLabel": "Tick if you are not confident that your transcription is accurate.",
                        "label": "Text difficult to transcribe?",
                        "revision": "73c6e344-a6c0-4e2a-8564-3f4e9bd01d6f",
                        "type": "checkbox-field",
                        "value": false,
                      },
                    ],
                    "pp2-empty": [
                      {
                        "id": "00811184-f840-4b02-babd-97d005830b40",
                        "inlineLabel": "Tick this box if the page contains no names to transcribe",
                        "label": "Is this an empty page?",
                        "revision": "73c6e344-a6c0-4e2a-8564-3f4e9bd01d6f",
                        "type": "checkbox-field",
                        "value": false,
                      },
                    ],
                    "pp2-name": [
                      {
                        "description": "Please transcribe the name you have selected",
                        "id": "ba0416c1-daea-486e-8a49-c34bf35f510f",
                        "label": "Name",
                        "pluralField": "Names",
                        "required": true,
                        "revision": "73c6e344-a6c0-4e2a-8564-3f4e9bd01d6f",
                        "type": "text-field",
                        "value": "Jane Williams",
                      },
                    ],
                  },
                  "revision": "73c6e344-a6c0-4e2a-8564-3f4e9bd01d6f",
                  "selector": {
                    "id": "df3c8319-762e-4547-ba7d-91ff0092e513",
                    "revisedBy": [],
                    "state": {
                      "height": 206,
                      "width": 3218,
                      "x": 234,
                      "y": 1103,
                    },
                    "type": "box-selector",
                  },
                  "type": "entity",
                },
              ],
            },
            "type": "entity",
          },
          "revision": {
            "approved": true,
            "authors": [
              "urn:madoc:user:216",
            ],
            "captureModelId": "8a1a1d8e-fc2c-4dc9-901f-5d311253aae4",
            "fields": [
              [
                "pp2transcription",
                [
                  "pp2-name",
                  "pp2-address",
                  "pp2-difficult",
                  "pp2-empty",
                ],
              ],
            ],
            "id": "73c6e344-a6c0-4e2a-8564-3f4e9bd01d6f",
            "label": "Peace Petition",
            "revises": "178fca6d-3624-4b8a-9af7-2c50e4034edc",
            "status": "accepted",
            "structureId": "178fca6d-3624-4b8a-9af7-2c50e4034edc",
          },
          "source": "structure",
        },
        {
          "captureModelId": "8a1a1d8e-fc2c-4dc9-901f-5d311253aae4",
          "document": {
            "id": "d8ddef02-b2c3-4e45-b424-36bc9797e0b1",
            "immutable": true,
            "label": "Transcribe the Peace Petition",
            "properties": {
              "pp2transcription": [
                {
                  "allowMultiple": false,
                  "id": "8968bdf2-86d9-4305-9f00-b19d483d6770",
                  "label": "Transcription",
                  "labelledBy": "{pp2-name} @ {pp2-address}",
                  "pluralLabel": "Transcriptions",
                  "properties": {
                    "pp2-address": [
                      {
                        "description": "Please transcribe the address next to the name",
                        "id": "f7c52cc6-6e01-46d5-9a15-cb42f96d4814",
                        "label": "Address",
                        "pluralField": "Addresses",
                        "revision": "ff1b4a45-b9f3-4676-90f0-f8707bf32258",
                        "type": "text-field",
                        "value": "Inglis Cottage, Llanwenog",
                      },
                    ],
                    "pp2-difficult": [
                      {
                        "id": "69948f18-7fe0-4d00-ac71-d13b4c457e3c",
                        "inlineLabel": "Tick if you are not confident that your transcription is accurate.",
                        "label": "Text difficult to transcribe?",
                        "revision": "ff1b4a45-b9f3-4676-90f0-f8707bf32258",
                        "type": "checkbox-field",
                        "value": false,
                      },
                    ],
                    "pp2-empty": [
                      {
                        "id": "9077e220-645b-4d1e-a9c5-881e65fcec18",
                        "inlineLabel": "Tick this box if the page contains no names to transcribe",
                        "label": "Is this an empty page?",
                        "revision": "ff1b4a45-b9f3-4676-90f0-f8707bf32258",
                        "type": "checkbox-field",
                        "value": false,
                      },
                    ],
                    "pp2-name": [
                      {
                        "description": "Please transcribe the name you have selected",
                        "id": "7e3b9464-4665-4869-a621-13f3d520ad9c",
                        "label": "Name",
                        "pluralField": "Names",
                        "required": true,
                        "revision": "ff1b4a45-b9f3-4676-90f0-f8707bf32258",
                        "type": "text-field",
                        "value": "E. M. Williams",
                      },
                    ],
                  },
                  "revision": "ff1b4a45-b9f3-4676-90f0-f8707bf32258",
                  "selector": {
                    "id": "92fa7fe7-2db2-4242-abf4-c9da50d010d2",
                    "revisedBy": [],
                    "state": {
                      "height": 205,
                      "width": 3054,
                      "x": 213,
                      "y": 1379,
                    },
                    "type": "box-selector",
                  },
                  "type": "entity",
                },
              ],
            },
            "type": "entity",
          },
          "revision": {
            "approved": true,
            "authors": [
              "urn:madoc:user:216",
            ],
            "captureModelId": "8a1a1d8e-fc2c-4dc9-901f-5d311253aae4",
            "fields": [
              [
                "pp2transcription",
                [
                  "pp2-name",
                  "pp2-address",
                  "pp2-difficult",
                  "pp2-empty",
                ],
              ],
            ],
            "id": "ff1b4a45-b9f3-4676-90f0-f8707bf32258",
            "label": "Peace Petition",
            "revises": "178fca6d-3624-4b8a-9af7-2c50e4034edc",
            "status": "accepted",
            "structureId": "178fca6d-3624-4b8a-9af7-2c50e4034edc",
          },
          "source": "structure",
        },
        {
          "captureModelId": "8a1a1d8e-fc2c-4dc9-901f-5d311253aae4",
          "document": {
            "id": "d8ddef02-b2c3-4e45-b424-36bc9797e0b1",
            "immutable": true,
            "label": "Transcribe the Peace Petition",
            "properties": {
              "pp2transcription": [
                {
                  "allowMultiple": false,
                  "id": "3cdaa4ac-28c0-4376-9140-cc9d27f903e2",
                  "label": "Transcription",
                  "labelledBy": "{pp2-name} @ {pp2-address}",
                  "pluralLabel": "Transcriptions",
                  "properties": {
                    "pp2-address": [
                      {
                        "description": "Please transcribe the address next to the name",
                        "id": "120a4acf-f9f5-4cd1-a5b0-9764b70ab6b9",
                        "label": "Address",
                        "pluralField": "Addresses",
                        "revision": "5a5c651f-02eb-4b57-a788-fc5872025b4b",
                        "type": "text-field",
                        "value": "Pleasant View, Alltyblacca, Llanwenog",
                      },
                    ],
                    "pp2-difficult": [
                      {
                        "id": "62523231-7246-44a9-a7ac-1baa7dccfece",
                        "inlineLabel": "Tick if you are not confident that your transcription is accurate.",
                        "label": "Text difficult to transcribe?",
                        "revision": "5a5c651f-02eb-4b57-a788-fc5872025b4b",
                        "type": "checkbox-field",
                        "value": false,
                      },
                    ],
                    "pp2-empty": [
                      {
                        "id": "81ce3fce-1413-41e5-ada4-8439815ce2d1",
                        "inlineLabel": "Tick this box if the page contains no names to transcribe",
                        "label": "Is this an empty page?",
                        "revision": "5a5c651f-02eb-4b57-a788-fc5872025b4b",
                        "type": "checkbox-field",
                        "value": false,
                      },
                    ],
                    "pp2-name": [
                      {
                        "description": "Please transcribe the name you have selected",
                        "id": "c4f54cb3-8000-4268-8c29-452423b2fc41",
                        "label": "Name",
                        "pluralField": "Names",
                        "required": true,
                        "revision": "5a5c651f-02eb-4b57-a788-fc5872025b4b",
                        "type": "text-field",
                        "value": "W. M. Evans",
                      },
                    ],
                  },
                  "revision": "5a5c651f-02eb-4b57-a788-fc5872025b4b",
                  "selector": {
                    "id": "f975900e-077e-4079-83c1-1c86479539da",
                    "revisedBy": [],
                    "state": {
                      "height": 212,
                      "width": 3446,
                      "x": 141,
                      "y": 1899,
                    },
                    "type": "box-selector",
                  },
                  "type": "entity",
                },
              ],
            },
            "type": "entity",
          },
          "revision": {
            "approved": true,
            "authors": [
              "urn:madoc:user:216",
            ],
            "captureModelId": "8a1a1d8e-fc2c-4dc9-901f-5d311253aae4",
            "fields": [
              [
                "pp2transcription",
                [
                  "pp2-name",
                  "pp2-address",
                  "pp2-difficult",
                  "pp2-empty",
                ],
              ],
            ],
            "id": "5a5c651f-02eb-4b57-a788-fc5872025b4b",
            "label": "Peace Petition",
            "revises": "178fca6d-3624-4b8a-9af7-2c50e4034edc",
            "status": "accepted",
            "structureId": "178fca6d-3624-4b8a-9af7-2c50e4034edc",
          },
          "source": "structure",
        },
        {
          "captureModelId": "8a1a1d8e-fc2c-4dc9-901f-5d311253aae4",
          "document": {
            "id": "d8ddef02-b2c3-4e45-b424-36bc9797e0b1",
            "immutable": true,
            "label": "Transcribe the Peace Petition",
            "properties": {
              "pp2transcription": [
                {
                  "allowMultiple": false,
                  "id": "ac47fec1-c9f0-48ea-984e-e29116fa58c8",
                  "label": "Transcription",
                  "labelledBy": "{pp2-name} @ {pp2-address}",
                  "pluralLabel": "Transcriptions",
                  "properties": {
                    "pp2-address": [
                      {
                        "description": "Please transcribe the address next to the name",
                        "id": "16748905-f8b6-43b8-8ea2-0ab5e4b2342c",
                        "label": "Address",
                        "pluralField": "Addresses",
                        "revision": "8693f234-bd9f-47a1-bc39-b3b1e34bd634",
                        "type": "text-field",
                        "value": "Alltyblacca Farm, Llanwenog",
                      },
                    ],
                    "pp2-difficult": [
                      {
                        "id": "4b3a306d-c3e5-4f0b-8db6-5b57af09df51",
                        "inlineLabel": "Tick if you are not confident that your transcription is accurate.",
                        "label": "Text difficult to transcribe?",
                        "revision": "8693f234-bd9f-47a1-bc39-b3b1e34bd634",
                        "type": "checkbox-field",
                        "value": false,
                      },
                    ],
                    "pp2-empty": [
                      {
                        "id": "1727f355-4daa-4af9-9f54-fcd21e8c904e",
                        "inlineLabel": "Tick this box if the page contains no names to transcribe",
                        "label": "Is this an empty page?",
                        "revision": "8693f234-bd9f-47a1-bc39-b3b1e34bd634",
                        "type": "checkbox-field",
                        "value": false,
                      },
                    ],
                    "pp2-name": [
                      {
                        "description": "Please transcribe the name you have selected",
                        "id": "5c7d97fe-eed7-418d-b2af-4ec8e21edbc0",
                        "label": "Name",
                        "pluralField": "Names",
                        "required": true,
                        "revision": "8693f234-bd9f-47a1-bc39-b3b1e34bd634",
                        "type": "text-field",
                        "value": "Mary F. Price",
                      },
                    ],
                  },
                  "revision": "8693f234-bd9f-47a1-bc39-b3b1e34bd634",
                  "selector": {
                    "id": "e19b67d5-a63e-41d9-9f2c-ff112eb507cb",
                    "revisedBy": [],
                    "state": {
                      "height": 189.26495344606178,
                      "width": 3180,
                      "x": 145,
                      "y": 1662.7350465539382,
                    },
                    "type": "box-selector",
                  },
                  "type": "entity",
                },
              ],
            },
            "type": "entity",
          },
          "revision": {
            "approved": true,
            "authors": [
              "urn:madoc:user:216",
            ],
            "captureModelId": "8a1a1d8e-fc2c-4dc9-901f-5d311253aae4",
            "fields": [
              [
                "pp2transcription",
                [
                  "pp2-name",
                  "pp2-address",
                  "pp2-difficult",
                  "pp2-empty",
                ],
              ],
            ],
            "id": "8693f234-bd9f-47a1-bc39-b3b1e34bd634",
            "label": "Peace Petition",
            "revises": "178fca6d-3624-4b8a-9af7-2c50e4034edc",
            "status": "accepted",
            "structureId": "178fca6d-3624-4b8a-9af7-2c50e4034edc",
          },
          "source": "structure",
        },
        {
          "captureModelId": "8a1a1d8e-fc2c-4dc9-901f-5d311253aae4",
          "document": {
            "id": "d8ddef02-b2c3-4e45-b424-36bc9797e0b1",
            "immutable": true,
            "label": "Transcribe the Peace Petition",
            "properties": {
              "pp2transcription": [
                {
                  "allowMultiple": false,
                  "id": "8b7cb1b2-2680-4b6b-8610-8423d703cc54",
                  "label": "Transcription",
                  "labelledBy": "{pp2-name} @ {pp2-address}",
                  "pluralLabel": "Transcriptions",
                  "properties": {
                    "pp2-address": [
                      {
                        "description": "Please transcribe the address next to the name",
                        "id": "97c8e83f-deb5-4b5a-ac18-d97177cc4ae5",
                        "label": "Address",
                        "pluralField": "Addresses",
                        "revision": "f51b1654-bcae-49cd-9f6c-a039d8207929",
                        "type": "text-field",
                        "value": "Derlwyn, Drefach, Llanwenog",
                      },
                    ],
                    "pp2-difficult": [
                      {
                        "id": "4c3701e5-ebab-4dd7-9092-9a9326f082e1",
                        "inlineLabel": "Tick if you are not confident that your transcription is accurate.",
                        "label": "Text difficult to transcribe?",
                        "revision": "f51b1654-bcae-49cd-9f6c-a039d8207929",
                        "type": "checkbox-field",
                        "value": false,
                      },
                    ],
                    "pp2-empty": [
                      {
                        "id": "c2438bab-ceb9-4de1-a9b1-619fbf332c46",
                        "inlineLabel": "Tick this box if the page contains no names to transcribe",
                        "label": "Is this an empty page?",
                        "revision": "f51b1654-bcae-49cd-9f6c-a039d8207929",
                        "type": "checkbox-field",
                        "value": false,
                      },
                    ],
                    "pp2-name": [
                      {
                        "description": "Please transcribe the name you have selected",
                        "id": "692b09d1-c887-49a8-8ca5-555560f1616b",
                        "label": "Name",
                        "pluralField": "Names",
                        "required": true,
                        "revision": "f51b1654-bcae-49cd-9f6c-a039d8207929",
                        "type": "text-field",
                        "value": "Elizabeth Jones",
                      },
                    ],
                  },
                  "revision": "f51b1654-bcae-49cd-9f6c-a039d8207929",
                  "selector": {
                    "id": "50c400f9-a81b-4cd3-9adc-91098f4ddc15",
                    "revisedBy": [],
                    "state": {
                      "height": 226,
                      "width": 3162,
                      "x": 234,
                      "y": 974,
                    },
                    "type": "box-selector",
                  },
                  "type": "entity",
                },
              ],
            },
            "type": "entity",
          },
          "revision": {
            "approved": true,
            "authors": [
              "urn:madoc:user:216",
            ],
            "captureModelId": "8a1a1d8e-fc2c-4dc9-901f-5d311253aae4",
            "fields": [
              [
                "pp2transcription",
                [
                  "pp2-name",
                  "pp2-address",
                  "pp2-difficult",
                  "pp2-empty",
                ],
              ],
            ],
            "id": "f51b1654-bcae-49cd-9f6c-a039d8207929",
            "label": "Peace Petition",
            "revises": "178fca6d-3624-4b8a-9af7-2c50e4034edc",
            "status": "accepted",
            "structureId": "178fca6d-3624-4b8a-9af7-2c50e4034edc",
          },
          "source": "structure",
        },
        {
          "captureModelId": "8a1a1d8e-fc2c-4dc9-901f-5d311253aae4",
          "document": {
            "id": "d8ddef02-b2c3-4e45-b424-36bc9797e0b1",
            "immutable": true,
            "label": "Transcribe the Peace Petition",
            "properties": {
              "pp2transcription": [
                {
                  "allowMultiple": false,
                  "id": "dd1b1a54-5518-43fb-be03-b259af715f2d",
                  "label": "Transcription",
                  "labelledBy": "{pp2-name} @ {pp2-address}",
                  "pluralLabel": "Transcriptions",
                  "properties": {
                    "pp2-address": [
                      {
                        "description": "Please transcribe the address next to the name",
                        "id": "f9166dba-5179-44bb-ae96-8855a3f73d14",
                        "label": "Address",
                        "pluralField": "Addresses",
                        "revision": "2dfdff73-47a8-4345-822a-cf05912a2997",
                        "type": "text-field",
                        "value": "Teify View, Alltyblaca, Llanwenog",
                      },
                    ],
                    "pp2-difficult": [
                      {
                        "id": "813c3812-0ea1-4213-af38-5b61768db47f",
                        "inlineLabel": "Tick if you are not confident that your transcription is accurate.",
                        "label": "Text difficult to transcribe?",
                        "revision": "2dfdff73-47a8-4345-822a-cf05912a2997",
                        "type": "checkbox-field",
                        "value": false,
                      },
                    ],
                    "pp2-empty": [
                      {
                        "id": "45c14221-b05f-48a1-acba-49dfe28dabad",
                        "inlineLabel": "Tick this box if the page contains no names to transcribe",
                        "label": "Is this an empty page?",
                        "revision": "2dfdff73-47a8-4345-822a-cf05912a2997",
                        "type": "checkbox-field",
                        "value": false,
                      },
                    ],
                    "pp2-name": [
                      {
                        "description": "Please transcribe the name you have selected",
                        "id": "18993d08-2889-4f1e-b71b-8de7f1caf3fe",
                        "label": "Name",
                        "pluralField": "Names",
                        "required": true,
                        "revision": "2dfdff73-47a8-4345-822a-cf05912a2997",
                        "type": "text-field",
                        "value": "Elizabeth Rees",
                      },
                    ],
                  },
                  "revision": "2dfdff73-47a8-4345-822a-cf05912a2997",
                  "selector": {
                    "id": "977d36af-aaee-4f44-8883-4038f323b673",
                    "revisedBy": [],
                    "state": {
                      "height": 220,
                      "width": 3316,
                      "x": 178,
                      "y": 1239,
                    },
                    "type": "box-selector",
                  },
                  "type": "entity",
                },
              ],
            },
            "type": "entity",
          },
          "revision": {
            "approved": true,
            "authors": [
              "urn:madoc:user:216",
            ],
            "captureModelId": "8a1a1d8e-fc2c-4dc9-901f-5d311253aae4",
            "fields": [
              [
                "pp2transcription",
                [
                  "pp2-name",
                  "pp2-address",
                  "pp2-difficult",
                  "pp2-empty",
                ],
              ],
            ],
            "id": "2dfdff73-47a8-4345-822a-cf05912a2997",
            "label": "Peace Petition",
            "revises": "178fca6d-3624-4b8a-9af7-2c50e4034edc",
            "status": "accepted",
            "structureId": "178fca6d-3624-4b8a-9af7-2c50e4034edc",
          },
          "source": "structure",
        },
        {
          "captureModelId": "8a1a1d8e-fc2c-4dc9-901f-5d311253aae4",
          "document": {
            "id": "d8ddef02-b2c3-4e45-b424-36bc9797e0b1",
            "immutable": true,
            "label": "Transcribe the Peace Petition",
            "properties": {
              "pp2transcription": [
                {
                  "allowMultiple": false,
                  "id": "e68a99e3-4e8e-423a-aabe-201cf360948d",
                  "label": "Transcription",
                  "labelledBy": "{pp2-name} @ {pp2-address}",
                  "pluralLabel": "Transcriptions",
                  "properties": {
                    "pp2-address": [
                      {
                        "description": "Please transcribe the address next to the name",
                        "id": "a3aa9a0a-6160-4a56-8618-66f5efe8bd24",
                        "label": "Address",
                        "pluralField": "Addresses",
                        "revision": "425ffaba-ba7d-4f41-a400-1081ba2b10bb",
                        "type": "text-field",
                        "value": "Pleasant View, Alltyblacca, Llanwenog",
                      },
                    ],
                    "pp2-difficult": [
                      {
                        "id": "6e32c9ea-03a8-462b-af0f-ea79cca6b6fd",
                        "inlineLabel": "Tick if you are not confident that your transcription is accurate.",
                        "label": "Text difficult to transcribe?",
                        "revision": "425ffaba-ba7d-4f41-a400-1081ba2b10bb",
                        "type": "checkbox-field",
                        "value": false,
                      },
                    ],
                    "pp2-empty": [
                      {
                        "id": "942571df-d6ee-4602-ad85-ccba91839d91",
                        "inlineLabel": "Tick this box if the page contains no names to transcribe",
                        "label": "Is this an empty page?",
                        "revision": "425ffaba-ba7d-4f41-a400-1081ba2b10bb",
                        "type": "checkbox-field",
                        "value": false,
                      },
                    ],
                    "pp2-name": [
                      {
                        "description": "Please transcribe the name you have selected",
                        "id": "792547a2-bb11-4b40-9bd3-54d9e1582721",
                        "label": "Name",
                        "pluralField": "Names",
                        "required": true,
                        "revision": "425ffaba-ba7d-4f41-a400-1081ba2b10bb",
                        "type": "text-field",
                        "value": "Hannah Davies",
                      },
                    ],
                  },
                  "revision": "425ffaba-ba7d-4f41-a400-1081ba2b10bb",
                  "selector": {
                    "id": "6fa3c739-4637-4c5f-ac17-a841464c330d",
                    "revisedBy": [],
                    "state": {
                      "height": 219,
                      "width": 3456,
                      "x": 181,
                      "y": 2021,
                    },
                    "type": "box-selector",
                  },
                  "type": "entity",
                },
              ],
            },
            "type": "entity",
          },
          "revision": {
            "approved": true,
            "authors": [
              "urn:madoc:user:216",
            ],
            "captureModelId": "8a1a1d8e-fc2c-4dc9-901f-5d311253aae4",
            "fields": [
              [
                "pp2transcription",
                [
                  "pp2-name",
                  "pp2-address",
                  "pp2-difficult",
                  "pp2-empty",
                ],
              ],
            ],
            "id": "425ffaba-ba7d-4f41-a400-1081ba2b10bb",
            "label": "Peace Petition",
            "revises": "178fca6d-3624-4b8a-9af7-2c50e4034edc",
            "status": "accepted",
            "structureId": "178fca6d-3624-4b8a-9af7-2c50e4034edc",
          },
          "source": "structure",
        },
        {
          "captureModelId": "8a1a1d8e-fc2c-4dc9-901f-5d311253aae4",
          "document": {
            "id": "d8ddef02-b2c3-4e45-b424-36bc9797e0b1",
            "immutable": true,
            "label": "Transcribe the Peace Petition",
            "properties": {
              "pp2transcription": [
                {
                  "allowMultiple": false,
                  "id": "8304bda8-57dc-4e11-9861-31a433ccc3e1",
                  "label": "Transcription",
                  "labelledBy": "{pp2-name} @ {pp2-address}",
                  "pluralLabel": "Transcriptions",
                  "properties": {
                    "pp2-address": [
                      {
                        "description": "Please transcribe the address next to the name",
                        "id": "a18d73e0-11d8-4462-b03d-62d08803be52",
                        "label": "Address",
                        "pluralField": "Addresses",
                        "revision": "1b82ccc6-a647-4fe2-be46-3de150066b60",
                        "type": "text-field",
                        "value": "Chapel House, Alltyblacca, Llanwenog",
                      },
                    ],
                    "pp2-difficult": [
                      {
                        "id": "4d634832-80fe-439c-bf26-9a62e7e55dca",
                        "inlineLabel": "Tick if you are not confident that your transcription is accurate.",
                        "label": "Text difficult to transcribe?",
                        "revision": "1b82ccc6-a647-4fe2-be46-3de150066b60",
                        "type": "checkbox-field",
                        "value": false,
                      },
                    ],
                    "pp2-empty": [
                      {
                        "id": "b66ea404-8aa7-4312-9d2e-24bd68f666ff",
                        "inlineLabel": "Tick this box if the page contains no names to transcribe",
                        "label": "Is this an empty page?",
                        "revision": "1b82ccc6-a647-4fe2-be46-3de150066b60",
                        "type": "checkbox-field",
                        "value": false,
                      },
                    ],
                    "pp2-name": [
                      {
                        "description": "Please transcribe the name you have selected",
                        "id": "6001af3a-8ae5-426c-8b22-b1a2eba70af7",
                        "label": "Name",
                        "pluralField": "Names",
                        "required": true,
                        "revision": "1b82ccc6-a647-4fe2-be46-3de150066b60",
                        "type": "text-field",
                        "value": "Sarah Hannah Jones",
                      },
                    ],
                  },
                  "revision": "1b82ccc6-a647-4fe2-be46-3de150066b60",
                  "selector": {
                    "id": "c1a0c260-2dd1-4447-ad5c-e55cc9f23718",
                    "revisedBy": [],
                    "state": {
                      "height": 252,
                      "width": 3342,
                      "x": 168,
                      "y": 2144,
                    },
                    "type": "box-selector",
                  },
                  "type": "entity",
                },
              ],
            },
            "type": "entity",
          },
          "revision": {
            "approved": true,
            "authors": [
              "urn:madoc:user:216",
            ],
            "captureModelId": "8a1a1d8e-fc2c-4dc9-901f-5d311253aae4",
            "fields": [
              [
                "pp2transcription",
                [
                  "pp2-name",
                  "pp2-address",
                  "pp2-difficult",
                  "pp2-empty",
                ],
              ],
            ],
            "id": "1b82ccc6-a647-4fe2-be46-3de150066b60",
            "label": "Peace Petition",
            "revises": "178fca6d-3624-4b8a-9af7-2c50e4034edc",
            "status": "accepted",
            "structureId": "178fca6d-3624-4b8a-9af7-2c50e4034edc",
          },
          "source": "structure",
        },
        {
          "captureModelId": "8a1a1d8e-fc2c-4dc9-901f-5d311253aae4",
          "document": {
            "id": "d8ddef02-b2c3-4e45-b424-36bc9797e0b1",
            "immutable": true,
            "label": "Transcribe the Peace Petition",
            "properties": {
              "pp2transcription": [
                {
                  "allowMultiple": false,
                  "id": "f2f51578-545e-40f3-9cae-86586a42f709",
                  "label": "Transcription",
                  "labelledBy": "{pp2-name} @ {pp2-address}",
                  "pluralLabel": "Transcriptions",
                  "properties": {
                    "pp2-address": [
                      {
                        "description": "Please transcribe the address next to the name",
                        "id": "0fe6a5f1-a730-4fdf-ade0-d729aa3ca15a",
                        "label": "Address",
                        "pluralField": "Addresses",
                        "revision": "2f667c9e-63cc-486f-afb8-bf465c4db975",
                        "type": "text-field",
                        "value": "Ffinnant Arms, Alltyblacca, Llanwenog",
                      },
                    ],
                    "pp2-difficult": [
                      {
                        "id": "1572fa6a-219a-4382-95f3-cb33592012a7",
                        "inlineLabel": "Tick if you are not confident that your transcription is accurate.",
                        "label": "Text difficult to transcribe?",
                        "revision": "2f667c9e-63cc-486f-afb8-bf465c4db975",
                        "type": "checkbox-field",
                        "value": false,
                      },
                    ],
                    "pp2-empty": [
                      {
                        "id": "59e0742d-752b-4c86-8731-0292c1e8182b",
                        "inlineLabel": "Tick this box if the page contains no names to transcribe",
                        "label": "Is this an empty page?",
                        "revision": "2f667c9e-63cc-486f-afb8-bf465c4db975",
                        "type": "checkbox-field",
                        "value": false,
                      },
                    ],
                    "pp2-name": [
                      {
                        "description": "Please transcribe the name you have selected",
                        "id": "cefdf63c-ac6c-4208-a5f5-5405e0fa4851",
                        "label": "Name",
                        "pluralField": "Names",
                        "required": true,
                        "revision": "2f667c9e-63cc-486f-afb8-bf465c4db975",
                        "type": "text-field",
                        "value": "Catherine Evans",
                      },
                    ],
                  },
                  "revision": "2f667c9e-63cc-486f-afb8-bf465c4db975",
                  "selector": {
                    "id": "7e3f2279-ad1c-49a6-a3d6-4a7f28e2e023",
                    "revisedBy": [],
                    "state": {
                      "height": 239,
                      "width": 3309,
                      "x": 178,
                      "y": 2290,
                    },
                    "type": "box-selector",
                  },
                  "type": "entity",
                },
              ],
            },
            "type": "entity",
          },
          "revision": {
            "approved": true,
            "authors": [
              "urn:madoc:user:216",
            ],
            "captureModelId": "8a1a1d8e-fc2c-4dc9-901f-5d311253aae4",
            "fields": [
              [
                "pp2transcription",
                [
                  "pp2-name",
                  "pp2-address",
                  "pp2-difficult",
                  "pp2-empty",
                ],
              ],
            ],
            "id": "2f667c9e-63cc-486f-afb8-bf465c4db975",
            "label": "Peace Petition",
            "revises": "178fca6d-3624-4b8a-9af7-2c50e4034edc",
            "status": "accepted",
            "structureId": "178fca6d-3624-4b8a-9af7-2c50e4034edc",
          },
          "source": "structure",
        },
        {
          "captureModelId": "8a1a1d8e-fc2c-4dc9-901f-5d311253aae4",
          "document": {
            "id": "d8ddef02-b2c3-4e45-b424-36bc9797e0b1",
            "immutable": true,
            "label": "Transcribe the Peace Petition",
            "properties": {
              "pp2transcription": [
                {
                  "allowMultiple": false,
                  "id": "409032b5-187e-46dd-9725-1a86442acdfd",
                  "label": "Transcription",
                  "labelledBy": "{pp2-name} @ {pp2-address}",
                  "pluralLabel": "Transcriptions",
                  "properties": {
                    "pp2-address": [
                      {
                        "description": "Please transcribe the address next to the name",
                        "id": "a085ba3e-bd50-43a4-a138-e2524847b494",
                        "label": "Address",
                        "pluralField": "Addresses",
                        "revision": "ac782400-171b-4af3-83fe-4055e72f3f3f",
                        "type": "text-field",
                        "value": "Brynderw, Llanwenog",
                      },
                    ],
                    "pp2-difficult": [
                      {
                        "id": "81d394d8-2859-408b-b940-06e19cbec7fb",
                        "inlineLabel": "Tick if you are not confident that your transcription is accurate.",
                        "label": "Text difficult to transcribe?",
                        "revision": "ac782400-171b-4af3-83fe-4055e72f3f3f",
                        "type": "checkbox-field",
                        "value": false,
                      },
                    ],
                    "pp2-empty": [
                      {
                        "id": "4ad52df6-74e4-4e93-8fee-1defab60d678",
                        "inlineLabel": "Tick this box if the page contains no names to transcribe",
                        "label": "Is this an empty page?",
                        "revision": "ac782400-171b-4af3-83fe-4055e72f3f3f",
                        "type": "checkbox-field",
                        "value": false,
                      },
                    ],
                    "pp2-name": [
                      {
                        "description": "Please transcribe the name you have selected",
                        "id": "3ae2b5ac-8fc9-4a34-96a7-1b83125bb5bf",
                        "label": "Name",
                        "pluralField": "Names",
                        "required": true,
                        "revision": "ac782400-171b-4af3-83fe-4055e72f3f3f",
                        "type": "text-field",
                        "value": "Rachel Rees",
                      },
                    ],
                  },
                  "revision": "ac782400-171b-4af3-83fe-4055e72f3f3f",
                  "selector": {
                    "id": "ebab08b3-3aab-46ac-a544-70b0cb3b6160",
                    "revisedBy": [],
                    "state": {
                      "height": 209,
                      "width": 3067,
                      "x": 148,
                      "y": 2423,
                    },
                    "type": "box-selector",
                  },
                  "type": "entity",
                },
              ],
            },
            "type": "entity",
          },
          "revision": {
            "approved": true,
            "authors": [
              "urn:madoc:user:216",
            ],
            "captureModelId": "8a1a1d8e-fc2c-4dc9-901f-5d311253aae4",
            "fields": [
              [
                "pp2transcription",
                [
                  "pp2-name",
                  "pp2-address",
                  "pp2-difficult",
                  "pp2-empty",
                ],
              ],
            ],
            "id": "ac782400-171b-4af3-83fe-4055e72f3f3f",
            "label": "Peace Petition",
            "revises": "178fca6d-3624-4b8a-9af7-2c50e4034edc",
            "status": "accepted",
            "structureId": "178fca6d-3624-4b8a-9af7-2c50e4034edc",
          },
          "source": "structure",
        },
        {
          "captureModelId": "8a1a1d8e-fc2c-4dc9-901f-5d311253aae4",
          "document": {
            "id": "d8ddef02-b2c3-4e45-b424-36bc9797e0b1",
            "immutable": true,
            "label": "Transcribe the Peace Petition",
            "properties": {
              "pp2transcription": [
                {
                  "allowMultiple": false,
                  "id": "a811e6c2-1800-471b-9a4a-81605a6b144e",
                  "label": "Transcription",
                  "labelledBy": "{pp2-name} @ {pp2-address}",
                  "pluralLabel": "Transcriptions",
                  "properties": {
                    "pp2-address": [
                      {
                        "description": "Please transcribe the address next to the name",
                        "id": "361645bb-1b3a-4c48-a208-62aa1249bc91",
                        "label": "Address",
                        "pluralField": "Addresses",
                        "revision": "3b39b2e5-934f-4f39-b6c9-64bb1ae91fab",
                        "type": "text-field",
                        "value": "Cartref, Alltyblacca, Llanwenog",
                      },
                    ],
                    "pp2-difficult": [
                      {
                        "id": "5f4a41bf-3a4f-4634-b87f-2201bab30aa2",
                        "inlineLabel": "Tick if you are not confident that your transcription is accurate.",
                        "label": "Text difficult to transcribe?",
                        "revision": "3b39b2e5-934f-4f39-b6c9-64bb1ae91fab",
                        "type": "checkbox-field",
                        "value": false,
                      },
                    ],
                    "pp2-empty": [
                      {
                        "id": "bdaa5a05-65d3-4447-b000-f0075732c250",
                        "inlineLabel": "Tick this box if the page contains no names to transcribe",
                        "label": "Is this an empty page?",
                        "revision": "3b39b2e5-934f-4f39-b6c9-64bb1ae91fab",
                        "type": "checkbox-field",
                        "value": false,
                      },
                    ],
                    "pp2-name": [
                      {
                        "description": "Please transcribe the name you have selected",
                        "id": "fbdf5794-5611-429a-b880-d0463ed52939",
                        "label": "Name",
                        "pluralField": "Names",
                        "required": true,
                        "revision": "3b39b2e5-934f-4f39-b6c9-64bb1ae91fab",
                        "type": "text-field",
                        "value": "Jane Evans",
                      },
                    ],
                  },
                  "revision": "3b39b2e5-934f-4f39-b6c9-64bb1ae91fab",
                  "selector": {
                    "id": "1f82c149-2be1-4452-97cf-7e4894f6c94f",
                    "revisedBy": [],
                    "state": {
                      "height": 219,
                      "width": 3226,
                      "x": 135,
                      "y": 2552,
                    },
                    "type": "box-selector",
                  },
                  "type": "entity",
                },
              ],
            },
            "type": "entity",
          },
          "revision": {
            "approved": true,
            "authors": [
              "urn:madoc:user:216",
            ],
            "captureModelId": "8a1a1d8e-fc2c-4dc9-901f-5d311253aae4",
            "fields": [
              [
                "pp2transcription",
                [
                  "pp2-name",
                  "pp2-address",
                  "pp2-difficult",
                  "pp2-empty",
                ],
              ],
            ],
            "id": "3b39b2e5-934f-4f39-b6c9-64bb1ae91fab",
            "label": "Peace Petition",
            "revises": "178fca6d-3624-4b8a-9af7-2c50e4034edc",
            "status": "accepted",
            "structureId": "178fca6d-3624-4b8a-9af7-2c50e4034edc",
          },
          "source": "structure",
        },
        {
          "captureModelId": "8a1a1d8e-fc2c-4dc9-901f-5d311253aae4",
          "document": {
            "id": "d8ddef02-b2c3-4e45-b424-36bc9797e0b1",
            "immutable": true,
            "label": "Transcribe the Peace Petition",
            "properties": {
              "pp2transcription": [
                {
                  "allowMultiple": false,
                  "id": "ced81f14-7be8-4fe2-90fe-d1a3c344fa9d",
                  "label": "Transcription",
                  "labelledBy": "{pp2-name} @ {pp2-address}",
                  "pluralLabel": "Transcriptions",
                  "properties": {
                    "pp2-address": [
                      {
                        "description": "Please transcribe the address next to the name",
                        "id": "fe006fcb-df61-4f67-bd96-6779f448ec3c",
                        "label": "Address",
                        "pluralField": "Addresses",
                        "revision": "f83d0160-64a7-436c-835f-02865da40eac",
                        "type": "text-field",
                        "value": "Bryn-Teify, Alltyblacca, Llanybyther",
                      },
                    ],
                    "pp2-difficult": [
                      {
                        "id": "6f8b1fab-bf34-434c-b891-099a6b3645e2",
                        "inlineLabel": "Tick if you are not confident that your transcription is accurate.",
                        "label": "Text difficult to transcribe?",
                        "revision": "f83d0160-64a7-436c-835f-02865da40eac",
                        "type": "checkbox-field",
                        "value": false,
                      },
                    ],
                    "pp2-empty": [
                      {
                        "id": "0dd707ff-f705-4cd5-b0fa-72c4fb15e7a1",
                        "inlineLabel": "Tick this box if the page contains no names to transcribe",
                        "label": "Is this an empty page?",
                        "revision": "f83d0160-64a7-436c-835f-02865da40eac",
                        "type": "checkbox-field",
                        "value": false,
                      },
                    ],
                    "pp2-name": [
                      {
                        "description": "Please transcribe the name you have selected",
                        "id": "f57e995d-2bb8-43f6-b97c-a0cffad563c0",
                        "label": "Name",
                        "pluralField": "Names",
                        "required": true,
                        "revision": "f83d0160-64a7-436c-835f-02865da40eac",
                        "type": "text-field",
                        "value": "Anne Lewis",
                      },
                    ],
                  },
                  "revision": "f83d0160-64a7-436c-835f-02865da40eac",
                  "selector": {
                    "id": "e063d4bb-3d55-4b6f-8025-49c57d62daee",
                    "revisedBy": [],
                    "state": {
                      "height": 202,
                      "width": 3435,
                      "x": 208,
                      "y": 2701,
                    },
                    "type": "box-selector",
                  },
                  "type": "entity",
                },
              ],
            },
            "type": "entity",
          },
          "revision": {
            "approved": true,
            "authors": [
              "urn:madoc:user:216",
            ],
            "captureModelId": "8a1a1d8e-fc2c-4dc9-901f-5d311253aae4",
            "fields": [
              [
                "pp2transcription",
                [
                  "pp2-name",
                  "pp2-address",
                  "pp2-difficult",
                  "pp2-empty",
                ],
              ],
            ],
            "id": "f83d0160-64a7-436c-835f-02865da40eac",
            "label": "Peace Petition",
            "revises": "178fca6d-3624-4b8a-9af7-2c50e4034edc",
            "status": "accepted",
            "structureId": "178fca6d-3624-4b8a-9af7-2c50e4034edc",
          },
          "source": "structure",
        },
        {
          "captureModelId": "8a1a1d8e-fc2c-4dc9-901f-5d311253aae4",
          "document": {
            "id": "d8ddef02-b2c3-4e45-b424-36bc9797e0b1",
            "immutable": true,
            "label": "Transcribe the Peace Petition",
            "properties": {
              "pp2transcription": [
                {
                  "allowMultiple": false,
                  "id": "3ba1f058-18a2-44d3-ba43-17eee700ac0c",
                  "label": "Transcription",
                  "labelledBy": "{pp2-name} @ {pp2-address}",
                  "pluralLabel": "Transcriptions",
                  "properties": {
                    "pp2-address": [
                      {
                        "description": "Please transcribe the address next to the name",
                        "id": "0e33eada-915d-4ffd-aab0-e18d4c955ff4",
                        "label": "Address",
                        "pluralField": "Addresses",
                        "revision": "5625a661-a75b-4e1f-8258-1ca7ebd09e38",
                        "type": "text-field",
                        "value": "Bryn-Teify, Alltyblacca, Llanwenog",
                      },
                    ],
                    "pp2-difficult": [
                      {
                        "id": "f4b532c8-ef53-4dd5-bb60-6b7314293125",
                        "inlineLabel": "Tick if you are not confident that your transcription is accurate.",
                        "label": "Text difficult to transcribe?",
                        "revision": "5625a661-a75b-4e1f-8258-1ca7ebd09e38",
                        "type": "checkbox-field",
                        "value": false,
                      },
                    ],
                    "pp2-empty": [
                      {
                        "id": "e3c92682-12c3-4da4-8c53-31d9c0431232",
                        "inlineLabel": "Tick this box if the page contains no names to transcribe",
                        "label": "Is this an empty page?",
                        "revision": "5625a661-a75b-4e1f-8258-1ca7ebd09e38",
                        "type": "checkbox-field",
                        "value": false,
                      },
                    ],
                    "pp2-name": [
                      {
                        "description": "Please transcribe the name you have selected",
                        "id": "4f5acead-14d9-436c-a6c5-3fba9141e8c5",
                        "label": "Name",
                        "pluralField": "Names",
                        "required": true,
                        "revision": "5625a661-a75b-4e1f-8258-1ca7ebd09e38",
                        "type": "text-field",
                        "value": "Lizzie M. Williams",
                      },
                    ],
                  },
                  "revision": "5625a661-a75b-4e1f-8258-1ca7ebd09e38",
                  "selector": {
                    "id": "f1d6215f-a72d-41ad-ac11-13d785115caa",
                    "revisedBy": [],
                    "state": {
                      "height": 255,
                      "width": 3565,
                      "x": 191,
                      "y": 2814,
                    },
                    "type": "box-selector",
                  },
                  "type": "entity",
                },
              ],
            },
            "type": "entity",
          },
          "revision": {
            "approved": true,
            "authors": [
              "urn:madoc:user:216",
            ],
            "captureModelId": "8a1a1d8e-fc2c-4dc9-901f-5d311253aae4",
            "fields": [
              [
                "pp2transcription",
                [
                  "pp2-name",
                  "pp2-address",
                  "pp2-difficult",
                  "pp2-empty",
                ],
              ],
            ],
            "id": "5625a661-a75b-4e1f-8258-1ca7ebd09e38",
            "label": "Peace Petition",
            "revises": "178fca6d-3624-4b8a-9af7-2c50e4034edc",
            "status": "accepted",
            "structureId": "178fca6d-3624-4b8a-9af7-2c50e4034edc",
          },
          "source": "structure",
        },
      ]
    `);
  });
});
