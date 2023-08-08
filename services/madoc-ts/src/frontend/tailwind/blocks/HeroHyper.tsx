import React from 'react';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import { Button } from '../../shared/navigation/Button';
import { HrefLink } from '../../shared/utility/href-link';

// Source: https://www.hyperui.dev/components/marketing/banners#component-3
interface HeroHyperProps {
  title: string;
  titleEmphasis?: string;
  description: string;
  button?: string;
  buttonLink?: string;
  image: {
    id: string;
    image: string;
    thumbnail: string;
  } | null;
  secondButton?: string;
  secondButtonLink?: string;
}
export function HeroHyper(props: HeroHyperProps) {
  return (
    <section
      className={`relative bg-cover bg-center bg-no-repeat`}
      style={{ backgroundImage: props.image ? `url(${props.image.image})` : '' }}
    >
      <div className="absolute inset-0 bg-white/75 sm:bg-transparent sm:from-white/95 sm:to-white/25 ltr:sm:bg-gradient-to-r rtl:sm:bg-gradient-to-l"></div>

      <div className="relative mx-auto max-w-screen-xl px-4 py-32 sm:px-6 lg:flex lg:items-center lg:px-8">
        <div className="max-w-xl text-center ltr:sm:text-left rtl:sm:text-right">
          <h1 className="text-3xl font-extrabold sm:text-5xl">
            {props.title}
            {props.titleEmphasis ? (
              <strong className="block font-extrabold text-blue-600"> {props.titleEmphasis}</strong>
            ) : null}
          </h1>

          <p className="mt-4 max-w-lg sm:text-xl/relaxed">{props.description}</p>

          <div className="mt-8 flex flex-wrap gap-4 text-center">
            {props.button ? (
              <Button as={HrefLink} $primary $large href={props.buttonLink}>
                {props.button}
              </Button>
            ) : null}

            {props.secondButton ? (
              <Button as={HrefLink} $large href={props.secondButtonLink}>
                {props.secondButton}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

blockEditorFor(HeroHyper, {
  type: 'default.HeroHyper',
  label: 'Hero hyper',
  anyContext: [],
  defaultProps: {
    title: '',
    titleEmphasis: '',
    description: '',
    image: null,
    button: '',
    buttonLink: '',
    secondButton: '',
    secondButtonLink: '',
  },
  editor: {
    title: 'text-field',
    titleEmphasis: 'text-field',
    description: 'text-field',
    image: {
      label: 'Image',
      type: 'madoc-media-explorer',
    },
    buttonLink: 'text-field',
    button: 'text-field',
    secondButtonLink: 'text-field',
    secondButton: 'text-field',
  },
});
