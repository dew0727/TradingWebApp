import React, { useState } from "react";
import { useSwipeable } from "react-swipeable";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import styled from "styled-components";
import TradingCard from "../TradingCard";
import "./index.css";

const wrapperStyle = {
  display: "flex",
  "justify-content": "space-evenly",
};

const RIGHT = -1;
const LEFT = 1;

const CarouselComponent = ({
  symbolList,
  rates,
  broker,
  posInfo,
  reqOrder,
  isMobile,
  onHandleTouchEnd,
  onHandleTouchStart
}) => {
  const [cardIdx, setCardIdx] = useState(0);
  const maxCount = symbolList?.length || 1;

  const onSwiped = (direction) => {
    let index = cardIdx + direction;

    if (index < 0) index = maxCount - 1;
    if (index >= maxCount) index = 0;

    setCardIdx(index);
  };

  const handlers = useSwipeable({
    delta: 5, // min distance(px) before a swipe starts
    preventDefaultTouchmoveEvent: false, // call e.preventDefault *See Details*
    trackTouch: true, // track touch input
    trackMouse: true, // track mouse input
    onSwipedLeft: () => onSwiped(LEFT),
    onSwipedRight: () => onSwiped(RIGHT),
  });

  return (
    <>
      <div style={wrapperStyle} onTouchStart={onHandleTouchStart} onTouchEnd={onHandleTouchEnd}>
        <div className="swiper-arrow" onClick={() => onSwiped(LEFT)}>
          {<LeftOutlined className="swiper-left-arrow" />}
        </div>
        <div {...handlers} className="swiper-trading-cards-body">
          <TradingCard
            key={`mobile-card-${cardIdx}`}
            symbols={symbolList}
            rates={rates}
            broker={broker}
            posInfo={posInfo}
            reqOrder={reqOrder}
            index={cardIdx}
            isMobile={isMobile}
          />
        </div>
        <div className="swiper-arrow" onClick={() => onSwiped(RIGHT)}>
          {<RightOutlined className="swiper-right-arrow" />}
        </div>
      </div>
      <div className="swiper-page-info">{`${cardIdx + 1}/${maxCount}`}</div>
    </>
  );
};

export default CarouselComponent;
