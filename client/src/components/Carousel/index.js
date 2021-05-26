import React, { useState, useRef } from "react";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { Carousel } from "antd";
import TradingCard from "../TradingCard";
import "./index.css";

const wrapperStyle = {
  display: "flex",
  "justify-content": "space-evenly",
};

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
  const [cardIdx, setCardIdx] = useState(0);
  const slider = useRef(null);
  const maxCount = symbolList?.length || 1;

  const onHandleChange = (val) => {
    console.log("current id:", val);
    setCardIdx(val);
  };

  return (
    <>
      <div
        style={wrapperStyle}
        onTouchStart={onHandleTouchStart}
        onTouchEnd={onHandleTouchEnd}
      >
        <div className="swiper-arrow" onClick={() => slider.current.prev()}>
          {<LeftOutlined className="swiper-left-arrow" />}
        </div>
        <div className="swiper-trading-cards-body">
          <Carousel ref={slider} dots afterChange={onHandleChange}>
            {maxCount > 0 && (
              <TradingCard
                key={`mobile-card-${0}`}
                symbols={symbolList}
                rates={rates}
                broker={broker}
                posInfo={posInfo}
                reqOrder={reqOrder}
                index={0}
                isMobile={isMobile}
              />
            )}
            {maxCount > 1 && (
              <TradingCard
                key={`mobile-card-${1}`}
                symbols={symbolList}
                rates={rates}
                broker={broker}
                posInfo={posInfo}
                reqOrder={reqOrder}
                index={1}
                isMobile={isMobile}
              />
            )}
            {maxCount > 2 && (
              <TradingCard
                key={`mobile-card-${2}`}
                symbols={symbolList}
                rates={rates}
                broker={broker}
                posInfo={posInfo}
                reqOrder={reqOrder}
                index={2}
                isMobile={isMobile}
              />
            )}
            {maxCount > 3 && (
              <TradingCard
                key={`mobile-card-${3}`}
                symbols={symbolList}
                rates={rates}
                broker={broker}
                posInfo={posInfo}
                reqOrder={reqOrder}
                index={3}
                isMobile={isMobile}
              />
            )}
            {maxCount > 4 && (
              <TradingCard
                key={`mobile-card-${2}`}
                symbols={symbolList}
                rates={rates}
                broker={broker}
                posInfo={posInfo}
                reqOrder={reqOrder}
                index={4}
                isMobile={isMobile}
              />
            )}
            {maxCount > 5 && (
              <TradingCard
                key={`mobile-card-${2}`}
                symbols={symbolList}
                rates={rates}
                broker={broker}
                posInfo={posInfo}
                reqOrder={reqOrder}
                index={5}
                isMobile={isMobile}
              />
            )}
          </Carousel>
        </div>
        <div className="swiper-arrow" onClick={() => slider.current.next()}>
          {<RightOutlined className="swiper-right-arrow" />}
        </div>
      </div>
      <div className="swiper-page-info">{`${cardIdx + 1}/${maxCount < 5 ? maxCount : 5 }`}</div>
    </>
  );
};

export default CarouselComponent;
