import React, { useEffect, useState } from "react";

import createSocket from '../../socket';

const TradingPage = () => {
  const [priceInfo, setPriceInfo] = useState({
    price: '',
    value: '',
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

  return <div>{priceInfo.price}</div>;
};

export default TradingPage;