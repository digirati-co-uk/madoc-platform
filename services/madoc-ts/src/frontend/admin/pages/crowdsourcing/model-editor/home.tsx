import React from 'react';

export const CaptureModelEditorHomepage: React.FC = () => {
  return (
    <div>
      <h1>Creating a capture model</h1>
      <p style={{ fontSize: '1.3em' }}>
        There are 2 main sections of a model. The first is the document. Each image you crowdsource will have a copy of
        this document. All of the contributions from all users will be building up this single document. A document can
        have either fields for values inputted, such as transcriptions fields, or Entities. Entities are a way of
        nesting related fields. For example, a Person entity may contain all of the fields related to people.
      </p>
      <p style={{ fontSize: '1.3em' }}>
        A contributor will be able to add multiple instances of each of these fields and entities. Your document may
        contain a lot of different fields that could be crowdsourced. To manage this and avoid a single large form being
        presented to the user the document is sliced using a Structure. A structure is a subset of the fields from the
        document. This drives a navigation so the user can decide what they want to contribute and then only see the
        fields for that thing.
      </p>
      <p style={{ fontSize: '1.3em' }}>
        You can load some of the fixtures to see examples of various documents and structures.
      </p>
    </div>
  );
};
