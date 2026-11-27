import React, { ComponentPropsWithoutRef, CSSProperties, forwardRef } from 'react';
import { Helmet } from 'react-helmet';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import { convertComponentToText } from '../../../utility/convert-component-to-text';
import { useAccessibleColor } from '../hooks/use-accessible-color';
import { useSite } from '../hooks/use-site';

interface Heading1Props extends ComponentPropsWithoutRef<'h1'> {
  background?: string;
  fullWidth?: boolean;
  backgroundHeight?: number;
  alignBackground?: 'start' | 'center' | 'end';
  textAlign?: CSSProperties['textAlign'];
  fontSize?: 'sm' | 'md' | 'lg' | 'xl';
  imageStyle?: 'bgf' | 'bgh' | 'dim' | 'cir' | 'oct';
  backgroundImage?: {
    id: string;
    image: string;
    thumbnail: string;
  } | null;
  $margin?: boolean;
}

interface Heading1EditorProps extends Omit<Heading1Props, 'backgroundHeight' | 'children'> {
  text: string;
  backgroundHeight?: number | string;
}

const fontSizes = {
  sm: 'text-[1.6em]',
  md: 'text-[2em]',
  lg: 'text-[3.4em]',
  xl: 'text-[5em]',
};

const verticalAlignments = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
};

const imageStyles = {
  bgf: 'w-full',
  bgh: 'w-1/2',
  dim: 'aspect-square w-auto max-w-full [clip-path:polygon(50%_0%,100%_50%,50%_100%,0%_50%)]',
  cir: 'aspect-square w-auto max-w-full [clip-path:circle(40%)]',
  oct: 'aspect-square w-auto max-w-full [clip-path:polygon(30%_0%,70%_0%,100%_30%,100%_70%,70%_100%,30%_100%,0%_70%,0%_30%)]',
};

export const Heading1 = forwardRef<HTMLHeadingElement, Heading1Props>(function Heading1(
  {
    fullWidth,
    background,
    textAlign,
    backgroundHeight = 200,
    fontSize = 'md',
    imageStyle = 'bgf',
    backgroundImage,
    alignBackground = 'end',
    $margin,
    children,
    className,
    style,
    ...props
  },
  ref
) {
  const site = useSite();
  const imageUrl = backgroundImage?.image;
  const containedImage = !fullWidth ? imageUrl : undefined;
  const fontSizeClass = fontSizes[fontSize] ?? fontSizes.md;
  const alignmentClass = verticalAlignments[alignBackground] ?? verticalAlignments.end;
  const imageClass = imageStyles[imageStyle] ?? imageStyles.bgf;
  const backgroundColor = useAccessibleColor(background || '');
  const color = containedImage || (imageUrl && imageStyle === 'bgf') ? '#fff' : backgroundColor || undefined;
  const heading = (
    <>
      {typeof children === 'string' && site ? (
        <Helmet>
          <title>
            {site.title} - {children}
          </title>
        </Helmet>
      ) : null}
      <h1
        {...props}
        ref={ref}
        data-size={fontSize}
        className={`madoc-heading-1 relative z-[3] mt-[0.5em] w-full font-semibold ${fontSizeClass} ${$margin ? 'mb-[1em]' : 'mb-[0.5em]'}${className ? ` ${className}` : ''}`}
        style={{ textAlign, color, ...style }}
      >
        {children}
      </h1>
    </>
  );

  if (!background && !imageUrl && !fullWidth) {
    return heading;
  }

  return (
    <>
      {fullWidth ? (
        <div
          className="absolute inset-x-0 z-[1] block overflow-hidden bg-white"
          data-image-style={imageStyle}
          data-align-right={textAlign === 'right'}
          style={{ height: backgroundHeight, backgroundColor: background }}
        >
          {imageUrl ? (
            <>
              <img
                src={imageUrl}
                alt=""
                className={`h-full object-cover ${imageClass}${textAlign === 'right' ? '' : ' absolute right-0'}`}
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 [background-image:linear-gradient(transparent_50%,rgba(0,0,0,0.65)_100%)]" />
            </>
          ) : null}
        </div>
      ) : null}
      <div
        className={`relative z-[2] -mx-[2em] flex px-[2em] pb-[1.5em] ${alignmentClass}${containedImage ? ' bg-cover bg-center bg-no-repeat' : ''}`}
        data-has-background={Boolean(containedImage)}
        style={{
          height: backgroundHeight || 500,
          backgroundColor: fullWidth ? undefined : background,
          backgroundImage: containedImage ? `url(${JSON.stringify(containedImage)})` : undefined,
        }}
      >
        {containedImage ? <div className="pointer-events-none absolute inset-0 bg-black/50" /> : null}
        {heading}
      </div>
    </>
  );
});

blockEditorFor<Heading1Props, Heading1EditorProps>(Heading1, {
  type: 'heading-1',
  label: 'Heading 1',
  editor: {
    text: { label: 'Text content', type: 'text-field', required: true },
    fullWidth: { label: 'Full width', type: 'checkbox-field', inlineLabel: 'Show full width' },
    background: { label: 'Background', type: 'color-field' },
    backgroundHeight: { label: 'Background height', type: 'text-field' },
    alignBackground: {
      label: 'Align title (vertical)',
      type: 'dropdown-field',
      options: [
        { value: 'start', text: 'Top' },
        { value: 'center', text: 'Center' },
        { value: 'end', text: 'Bottom' },
      ],
    },
    textAlign: {
      label: 'Align title (horizontal)',
      type: 'dropdown-field',
      options: [
        { value: 'left', text: 'Left' },
        { value: 'center', text: 'Center' },
        { value: 'right', text: 'Right' },
      ],
    },
    fontSize: {
      label: 'Font size',
      type: 'dropdown-field',
      options: [
        { value: 'sm', text: 'Small' },
        { value: 'md', text: 'Normal' },
        { value: 'lg', text: 'Large' },
        { value: 'xl', text: 'Very Large' },
      ],
    },
    backgroundImage: { label: 'Background image', type: 'madoc-media-explorer' },
    imageStyle: {
      type: 'dropdown-field',
      options: [
        { value: 'bgf', text: 'Full Background Image' },
        { value: 'bgh', text: 'Half Background Image' },
        { value: 'dim', text: 'Diamond' },
        { value: 'cir', text: 'Circle' },
        { value: 'oct', text: 'Octagon' },
      ],
    },
  },
  defaultProps: {
    text: 'Example header',
    fullWidth: false,
    background: '',
    backgroundHeight: 200,
    alignBackground: 'start',
    textAlign: 'left',
    fontSize: 'md',
    backgroundImage: null,
    imageStyle: 'bgf',
  },
  svgIcon: props => {
    return (
      <svg width="1em" height="1em" viewBox="0 0 177 127" xmlns="http://www.w3.org/2000/svg" {...props}>
        <g fill="none" fillRule="evenodd">
          <path d="M0 0h177v127H0z" />
          <text fontFamily="Helvetica-Bold, Helvetica" fontSize={53} fontWeight="bold" fill="#000">
            <tspan x={57.075} y={84}>
              {'h1'}
            </tspan>
          </text>
        </g>
      </svg>
    );
  },
  mapFromProps: ({ children, ...props }) => ({ ...props, text: convertComponentToText(children) }),
  mapToProps: ({ text, backgroundHeight, ...props }) => {
    const height = Number(backgroundHeight);
    return { ...props, children: <>{text}</>, backgroundHeight: Number.isFinite(height) ? height : 200 };
  },
});

export const Subheading1 = forwardRef<HTMLParagraphElement, ComponentPropsWithoutRef<'p'>>(function Subheading1(
  { className, ...props },
  ref
) {
  return (
    <p
      {...props}
      ref={ref}
      className={`mb-[1em] text-[1em] opacity-80 [&_a]:text-[#5071f4] [&_a]:text-[0.85em]${className ? ` ${className}` : ''}`}
    />
  );
});
