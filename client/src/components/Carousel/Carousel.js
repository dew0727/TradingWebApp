import React from "react";
import { useSwipeable } from "react-swipeable";
import styled from "styled-components";

const NEXT = "NEXT";
const PREV = "PREV";

const STOP_SLIDING = "stopSliding";
const RESET_SLIDING = "reset";


const getOrder = (index, pos, numItems) => {
  return index - pos < 0 ? numItems - Math.abs(index - pos) : index - pos;
};

const initialState = { pos: 0, sliding: false, dir: NEXT };

function reducer(state, action) {
  switch (action.type) {
    case RESET_SLIDING:
      return initialState;
    case PREV:
      return {
        ...state,
        dir: PREV,
        sliding: true,
        pos: state.pos === 0 ? action.numItems - 1 : state.pos - 1
      };
    case NEXT:
      return {
        ...state,
        dir: NEXT,
        sliding: true,
        pos: state.pos === action.numItems - 1 ? 0 : state.pos + 1
      };
    case STOP_SLIDING:
      return { ...state, sliding: false };
    default:
      return state;
  }
}

export const CarouselContainer = styled.div`
  display: flex;
  transition: ${(props) => (props.sliding ? "none" : "transform 0.5s ease")};
  transform: ${(props) => {
    if (!props.sliding) return "translateX(calc(-80% - 20px))";
    if (props.dir === PREV) return "translateX(calc(2 * (-80% - 20px)))";
    return "translateX(0%)";
  }};
`;

const Wrapper = styled.div`
  width: 100%;
  overflow: hidden;
  box-shadow: 5px 5px 20px 7px rgba(168, 168, 168, 1);
`;

const CarouselSlot = styled.div`
  flex: 1 0 100%;
  flex-basis: 80%;
  margin-right: 20px;
  order: ${(props) => props.order};
`;

const Carousel = (props) => {
  const [state, dispatch] = React.useReducer(reducer, initialState);
  const numItems = React.Children.count(props.children);

  const slide = (dir) => {
    dispatch({ type: dir, numItems });
    setTimeout(() => {
      dispatch({ type: "stopSliding" });
    }, 50);
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => slide(NEXT),
    onSwipedRight: () => slide(PREV),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true
  });

  return (
    <div {...handlers}>
      <Wrapper>
        <CarouselContainer dir={state.dir} sliding={state.sliding}>
          {React.Children.map(props.children, (child, index) => (
            <CarouselSlot
              key={index}
              order={getOrder(index, state.pos, numItems)}
            >
              {child}
            </CarouselSlot>
          ))}
        </CarouselContainer>
      </Wrapper>
    </div>
  );
};

export default Carousel;
