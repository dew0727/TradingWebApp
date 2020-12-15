import React, { useEffect, useState } from "react";
import { Divider, Tabs } from "antd";
import createSocket from "../../socket";
import { TradingCard } from "../../components";
import "./style.css";

const { TabPane } = Tabs;

const TradingPage = () => {
  const [priceInfo, setPriceInfo] = useState({
    price: "",
    value: "",
  });

  useEffect(() => {
    createSocket(parseData);
  }, []);

  const parseData = (info) => {
    // Parse info
    console.log("INFO - ", info);

    setPriceInfo({
      price: info,
    });
  };

  function callback(key) {
    console.log(key);
  }

  const symbols = [
    "EURUSD",
    "GBPUSD",
    "USDCNH",
    "USDJPY",
    "EURJPY",
    "AUDJPY",
    "EURGBP",
    "AUDUSD",
  ];

  return (
    <div className="traindg-home-page">
      <Tabs defaultActiveKey="1" onChange={callback}>
        <TabPane tab="Home" key="1">
          <div className="site-card-wrapper trading-cards-wrapper">
            {symbols.map((item) => {
              return <TradingCard symbols={symbols} sym={item} />;
            })}
          </div>
        </TabPane>
        <TabPane tab="Setting" key="2">
          Settings
        </TabPane>
      </Tabs>
    </div>
  );
};

export default TradingPage;
