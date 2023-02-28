import * as React from 'react';
import styled from 'styled-components';
import { Button } from '../navigation/Button';
import { ChevronLeft, ChevronRight } from '../icons/ChevronIcon';

const CarouselOuterWrapper = styled.div`
  width: 90%;
  max-width: 1100px;
`;

const CarouselWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CarouselControl = styled.button<{
  $color?: string;
}>`
  border: none;
  background-color: transparent;
  color:  ${props => (props.$color ? props.$color : '#3579f6')};
  
  display: flex;
  font-size: 1em;
  padding: 1em;
  
  &:hover {
    color: #333333;
    cursor: pointer;
    
    svg {
      fill: #333333;
    }
  }
  svg {
    fill: ${props => (props.$color ? props.$color : '#3579f6')};
    margin: 0 0.5em;
    position: relative;
    top: 0.15em;
  },
`;

const CarouselSlides = styled.div`
  transition: all 0.5s ease;
  width: 100%;
  display: flex;
  overflow: hidden;
  justify-content: center;

`;
const CarouselSlide = styled.div`
  opacity: 0;
  width: 0;
  transition: opacity 0.5s ease, transform 0.8s ease;
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

const Indicator = styled.button<{
  $color?: string;
}>`
  height: 12px;
  width: 64px;
  background-color: transparent;
  border: 1px solid;
  border-color: ${props => (props.$color ? props.$color : '#3579f6')};
  align-self: end;
  margin: 1em;

  :hover {
    cursor: pointer;
    background-color: rgba(59, 59, 93, 0.7);
  }
  &[data-isActive='true'] {
    background-color: ${props => (props.$color ? props.$color : '#3579f6')};

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
  controlColor?: string;
}

export const Carousel = ({ children, controlColor }: CarouselProps) => {
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
        <CarouselControl
          $color={controlColor}
          onClick={() => {
            setCurrentSlide(prev);
          }}
        >
          <ChevronLeft />
          Previous
        </CarouselControl>
        <CarouselSlides>{activeSlide}</CarouselSlides>
        <CarouselControl
          $color={controlColor}
          onClick={() => {
            setCurrentSlide(next);
          }}
        >
          Next
          <ChevronRight />
        </CarouselControl>
      </CarouselWrapper>
      <IndicatorWrapper>
        {slides?.map((slide, index) => (
          <Indicator
            $color={controlColor}
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
