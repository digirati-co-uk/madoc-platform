import React from 'react';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import { Button } from '../../shared/navigation/Button';
import { HrefLink } from '../../shared/utility/href-link';

type HeroCenteredProps = {
  title: string;
  description: string;
  image: {
    id: string;
    image: string;
    thumbnail: string;
  } | null;
  button?: string;
  buttonLink?: string;
};

export function HeroCentered(props: HeroCenteredProps) {
  return (
    <section className="text-gray-600 body-font">
      <div className="container mx-auto flex px-5 py-24 items-center justify-center flex-col">
        {props.image ? (
          <img
            className="lg:w-2/6 md:w-3/6 w-5/6 mb-10 object-cover object-center rounded"
            alt="hero"
            src={props.image.image}
          />
        ) : null}
        <div className="text-center lg:w-2/3 w-full">
          <h1 className="title-font sm:text-4xl text-3xl mb-4 font-medium text-gray-900">{props.title}</h1>
          <p className="mb-8 leading-relaxed">{props.description}</p>
          {props.button ? (
            <div className="flex justify-center">
              <Button as={HrefLink} $primary $large href={props.buttonLink}>
                {props.button}
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

blockEditorFor(HeroCentered, {
  type: 'default.HeroCentered',
  label: 'Hero centered',
  anyContext: [],
  defaultProps: {
    title: '',
    description: '',
    image: null,
    button: '',
    buttonLink: '',
  },
  editor: {
    title: 'text-field',
    description: 'text-field',
    image: {
      label: 'Image',
      type: 'madoc-media-explorer',
    },
    button: 'text-field',
    buttonLink: 'text-field',
  },
});
