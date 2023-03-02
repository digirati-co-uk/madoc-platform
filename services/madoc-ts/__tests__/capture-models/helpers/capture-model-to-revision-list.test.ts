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
});
