import * as React from 'react';
import styled from 'styled-components';
import { Button } from '../navigation/Button';
import { Chevron } from '../icons/Chevron';

const CarouselOuterWrapper = styled.div`
  width: 90%;
`;

const CarouselWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  svg {
    height: 10px;
  }
`;

const CarouselSlides = styled.div`
  transition: all 0.5s ease;
  width: 100%;
  display: flex;
  overflow: hidden;
`;
const CarouselSlide = styled.div`
  opacity: 0;
  width: 0;
  transition:
    opacity 0.8s ease,
    transform 0.8s ease;
  visibility: hidden;

  > div {
    margin-left: auto;
    margin-right: auto;
  }

  &[data-active='true'] {
    width: 100%;
    opacity: 1;
    visibility: visible;
    transform: translateX(0);
  }
  &[data-prev='true'] {
    transform: translateX(-100%);
  }
  &[data-next='true'] {
    transform: translateX(100%);
  }
`;

const IndicatorWrapper = styled.div`
  display: flex;
  justify-content: center;
`;

interface CarouselProps {
  children: React.ReactNode;
}

export const Carousel = ({ children }: CarouselProps) => {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const slides = React.Children.toArray(children);

  const prev = currentSlide === 0 ? slides.length - 1 : currentSlide - 1;
  const next = currentSlide === slides.length - 1 ? 0 : currentSlide + 1;

  const activeSlide = slides?.map((slide, index) => (
    <CarouselSlide
      data-active={currentSlide === index}
      data-prev={prev === index}
      data-next={next === index}
      key={index}
    >
      {slide}
    </CarouselSlide>
  ));

  return (
    <CarouselOuterWrapper>
      <CarouselWrapper>
        <Button
          $link={true}
          onClick={() => {
            setCurrentSlide(prev);
          }}
        >
          <Chevron style={{ transform: 'scaleX(-1)' }} />
          Previous
        </Button>
        <CarouselSlides>{activeSlide}</CarouselSlides>
        <Button
          $link={true}
          onClick={() => {
            setCurrentSlide(next);
          }}
        >
          Next
          <Chevron />
        </Button>
      </CarouselWrapper>
      <IndicatorWrapper>
        {slides?.map((slide, index) => (
          <button
            type="button"
            aria-label={`Go to slide ${index + 1}`}
            aria-current={currentSlide === index ? 'true' : undefined}
            className={`m-[1em] h-[12px] w-[64px] self-end border border-[var(--madoc-accent)] hover:brightness-90 ${
              currentSlide === index ? 'bg-[var(--madoc-accent)]' : 'bg-transparent hover:bg-[var(--madoc-accent)]'
            }`}
            key={index}
            onClick={() => {
              setCurrentSlide(index);
            }}
          />
        ))}
      </IndicatorWrapper>
    </CarouselOuterWrapper>
  );
};
