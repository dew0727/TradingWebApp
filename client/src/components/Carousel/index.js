import React from "react";
import Carousel from "./Carousel";
import TradingCard from "../TradingCard";
import "./index.css";

const CarouselComponent = ({
  symbolList,
  rates,
  broker,
  posInfo,
  reqOrder,
  isMobile,
  onHandleTouchEnd,
  onHandleTouchStart,
}) => {
  return (
    <div onTouchStart={onHandleTouchStart} onTouchEnd={onHandleTouchEnd}>
      <Carousel>
        {symbolList.map((symbol, index) => (
          <TradingCard
            key={`mobile-card-${index}-${symbol}`}
            symbols={symbolList}
            rates={rates}
            broker={broker}
            posInfo={posInfo}
            reqOrder={reqOrder}
            index={index}
            isMobile={isMobile}
          />
        ))}
      </Carousel>
    </div>
  );
};

export default CarouselComponent;
