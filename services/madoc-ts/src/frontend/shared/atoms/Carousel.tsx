import * as React from 'react';
import styled from 'styled-components';
import { Button } from '../navigation/Button';

const CarouselOuterWrapper = styled.div`
  display: flex;
  min-height: 300px;
  width: 90%;
  align-items: center;
  
  button {
    max-height: 30px;
  }
`;

const CarouselWrapper = styled.div`
  width: 100%;
  height: 100%;
`;
const CarouselSlides = styled.div`
  position: relative;
  transition: all 0.5s ease;
`;
const CarouselSlide = styled.div`
  opacity: 0;
  width: 100%;
  transition: all 0.5s ease;
  visibility: hidden;
  position: absolute;

  &[data-active='true'] {
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
      <Button
        $link={true}
        onClick={() => {
          setCurrentSlide(prev);
        }}
      >
        Previous
      </Button>
      <CarouselWrapper>
        <CarouselSlides>
            {activeSlide}
        </CarouselSlides>
      </CarouselWrapper>

      <Button
        $link={true}
        onClick={() => {
          setCurrentSlide(next);
        }}
      >
        Next
      </Button>
    </CarouselOuterWrapper>
  );
};
