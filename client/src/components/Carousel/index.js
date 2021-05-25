import React, { useState } from "react";
import { useSwipeable } from "react-swipeable";
import TradingCard from "../TradingCard";
import "./index.css";

const RIGHT = 1;
const LEFT = -1;

const CarouselComponent = ({
  symbolList,
  rates,
  broker,
  posInfo,
  reqOrder,
  isMobile,
}) => {
  const [cardIdx, setCardIdx] = useState(0);
  const maxCount = symbolList?.length || 1;


  const onSwiped = (direction) => {
      console.log('direction: ', direction, cardIdx)
    let index = cardIdx + direction;

    if (index < 0) index = maxCount;
    if (index >= maxCount) index = 0;

    console.log("set card index", index, maxCount);
    setCardIdx(index);
  }

  const handlers = useSwipeable({  
    delta: 5, // min distance(px) before a swipe starts
    preventDefaultTouchmoveEvent: false, // call e.preventDefault *See Details*
    trackTouch: true, // track touch input
    trackMouse: true, // track mouse input
    onSwipedLeft: () => onSwiped(LEFT),
    onSwipedRight: () => onSwiped(RIGHT),
  });

  return (
    <div>
      {/* <LeftOutlined onClick={() =>  onSwiped(LEFT)} /> */}
      <div
        {...handlers}
      >
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
      {/* <RightOutlined onClick={() => onSwiped(RIGHT)} /> */}
    </div>
  );
};

export default CarouselComponent;
