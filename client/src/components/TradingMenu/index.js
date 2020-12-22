import React, { useState } from "react";
import SymbolSelector from "../../components/SymbolSelector";
import "./style.css";

const TradingMenu = ({ brokers, accounts, callback }) => {
  const handleBrokerClick = (key) => {
    callback({selectedBroker: key});
  };

  const handleAccountClick = (key) => {
    if (callback !== undefined){
      callback({selectedAccount: key});
    }
  };

  return (
    <div className="trading-setting-menu">
      <div className="price-broker-selection">
        <label>Price: </label>
        <SymbolSelector
          symbols={brokers.filter(broker => broker !== "Basket")}
          defaultIndex = {0}
          callback={handleBrokerClick}
        />
      </div>
      <div className="traiding-account-selection">
        <label>Account: </label>
        <SymbolSelector
          symbols={accounts}
          defaultIndex = {0}
          callback={handleAccountClick}
        />
      </div>
    </div>
  );
};

export default TradingMenu;
