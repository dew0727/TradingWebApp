import React from "react";
import { useSwipeable } from "react-swipeable";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
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
        pos: state.pos === 0 ? action.numItems - 1 : state.pos - 1,
      };
    case NEXT:
      return {
        ...state,
        dir: NEXT,
        sliding: true,
        pos: state.pos === action.numItems - 1 ? 0 : state.pos + 1,
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
    if (!props.sliding) return "translateX(calc(-100%))";
    if (props.dir === PREV) return "translateX(calc(2 * (-80% - 20px)))";
    return "translateX(0%)";
  }};
`;

const Wrapper = styled.div`
  width: 100%;
  overflow: hidden;
`;

const CarouselSlot = styled.div`
  flex: 1 0 100%;
  order: ${(props) => props.order};
`;

const wrapperStyle = {
  display: "flex",
  "justify-content": "space-evenly",
  "margin-bottom": "1vh",
};

const Carousel = ({ children, onSlidingStart, onSlidingEnd }) => {
  const [state, dispatch] = React.useReducer(reducer, initialState);
  const numItems = React.Children.count(children);

  const slide = (dir) => {
    dispatch({ type: dir, numItems });
    onSlidingStart();
    setTimeout(() => {
      dispatch({ type: STOP_SLIDING });
    }, 50);
    setTimeout(() => {
      onSlidingEnd();
    }, 500);
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => slide(NEXT),
    onSwipedRight: () => slide(PREV),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  return (
    <>
      <div {...handlers} style={wrapperStyle}>
        <div className="swiper-arrow" onClick={() => slide(PREV)}>
          {<LeftOutlined className="swiper-left-arrow" />}
        </div>
        <Wrapper>
          <div>
            <CarouselContainer dir={state.dir} sliding={state.sliding}>
              {React.Children.map(children, (child, index) => (
                <CarouselSlot
                  key={index}
                  order={getOrder(index, state.pos, numItems)}
                >
                  {child}
                </CarouselSlot>
              ))}
            </CarouselContainer>
          </div>
        </Wrapper>
        <div className="swiper-arrow" onClick={() => slide(NEXT)}>
          {<RightOutlined className="swiper-right-arrow" />}
        </div>
      </div>
      <div className="swiper-page-info">{`${state.pos + 1}/${numItems}`}</div>
    </>
  );
};

export default Carousel;
