import React from "react";
import "./style.css";
import SymbolSelector from "../SymbolSelector";

const TradingCard = ({ symbols, sym }) => {
  return (
    <div className="card-wrapper">
      <div style={{ width: 300 }}>
        <div className="card-symbol-name">
          <SymbolSelector symbols={symbols} sym={sym} />
        </div>
        <div className="card-commands"></div>
        <div className="card-rate-info"></div>
        <div className="card-settings"></div>
      </div>
    </div>
  );
};

export default TradingCard;
