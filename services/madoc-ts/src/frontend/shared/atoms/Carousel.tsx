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
  transition: opacity 0.8s ease, transform 0.8s ease;
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

const Indicator = styled.button`
  height: 12px;
  width: 64px;
  background-color: transparent;
  border: 1px solid #3579f6;
  align-self: end;
  margin: 1em;

  :hover {
    background-color: rgba(59, 59, 93, 0.7);
  }
  &[data-isActive='true'] {
    background-color: #3579f6;

    :hover {
      background-color: rgba(59, 59, 93, 0.7);
    }
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
          <Indicator
            data-isActive={currentSlide === index}
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
