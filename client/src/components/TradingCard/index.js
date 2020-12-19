import React, { useState, useEffect } from "react";
import { Row, Col, Button, Input, InputNumber } from "antd";
import SymbolSelector from "../SymbolSelector";
import "./style.css";

const posInfoSample = {
  USDJPY: {
    BUY: {
      Lots: 1,
      AvgPrice: 104.23,
      ProfitInPips: 0.081,
      Profit: 801,
    },
    SELL: {
      Lots: 0,
      AvgPrice: 0,
      ProfitInPips: 0,
      Profit: 0,
    },
  },
  EURUSD: {
    BUY: {
      Lots: 0,
      AvgPrice: 0,
      ProfitInPips: 0,
      Profit: 0,
    },
    SELL: {
      Lots: 2,
      AvgPrice: 1.3,
      ProfitInPips: 32,
      Profit: 320,
    },
  },
};


const specPrice = (symbol, price, fixsize=5) => {
  if (price === undefined || symbol === undefined) return {first: "", last: ""};
  const strPrice = Number.parseFloat(price).toFixed(fixsize);
  const last = strPrice.substr(-3);
  const first = strPrice.substr(0, strPrice.length -3);

  return {first: first, last: last};
}

const TradingCard = ({ symbols, posInfo, rates, broker }) => {
  const [netPosInfo, setNetPosInfo] = useState(posInfoSample);
  const [curSym, setcurSym] = useState("EURUSD");
  const [orderType, setorderType] = useState("MKT");
  
  let bid = 0, ask = 0, sp = 0, point;

  if (curSym in rates) {
    bid = rates[curSym].bid;
    ask = rates[curSym].ask;
    point = curSym.toUpperCase().includes("JPY") ? 3 : 5;
    sp = Math.abs(bid - ask) * (point === 5 ? 10000 : 100);
  }

  return (
    <div className="trading-card-container">
      <div className="card-symbol-name">
        <SymbolSelector
          symbols={symbols}
          callback={(key) => {
            setcurSym(key);
          }}
        />
      </div>
      <Row className="card-commands">
        <Col className="command-header-bid" span={4}>
          <span>売</span>
        </Col>
        <Col className="command-header-bid" span={6}>
          <span>BID</span>
        </Col>
        <Col className="command-header" span={4}>
          <span>sp</span>
        </Col>
        <Col className="command-header-ask" span={4}>
          <span>ASK</span>
        </Col>
        <Col className="command-header-ask" span={6}>
          <span>買</span>
        </Col>
      </Row>
      <Row gutter={[0, 10]} className="card-commands">
        <Col className="command-header-bid command-header-int" span={6}>
          <span>{specPrice(curSym,bid, point).first}</span>
        </Col>
        <Col className="command-header-bid command-header-float" span={4}>
          <span>{specPrice(curSym,bid, point).last}</span>
        </Col>
        <Col className="command-header command-header-int" span={4}>
          <span>{sp.toFixed(1)}</span>
        </Col>
        <Col className="command-header-ask command-header-int" span={4}>
          <span>{specPrice(curSym,ask, point).first}</span>
        </Col>
        <Col className="command-header-ask command-header-float" span={6}>
          <span>{specPrice(curSym,ask, point).last}</span>
        </Col>
      </Row>
      <Row gutter={[0, 10]} justify="center" align="center">
        <Col span={18}>
          <Button block htmlType className="btn-control">
            前決済
          </Button>
        </Col>
      </Row>
      <Row gutter={[0, 10]} align="center">
        <Col span={10}>
          <Button block className="command-header-bid">
            買
          </Button>
        </Col>
        <Col span={10} offset={4}>
          <Button block className="command-header-ask">
            売
          </Button>
        </Col>
      </Row>
      <div className="trading-card-set-lots">
        <Row className="trading-card-input-lots">
          <Col span={4} style={{ color: "white" }}>
            <Row>枚数</Row>
          </Col>
          <Col span={6} className="trading-card-input-lots-wrapper">
            <Input size="small" />
          </Col>
          <Col span={4}></Col>
          <Col span={8}>
            <Button>リセット</Button>
          </Col>
        </Row>
        <div className="trading-card-input trading-card-quick-set-lots">
          <div className="trading-card-quick-set-btn">
            <Button block size="small">
              +1
            </Button>
          </div>
          <div className="trading-card-quick-set-btn">
            <Button block size="small">
              +5
            </Button>
          </div>
          <div className="trading-card-quick-set-btn">
            <Button block size="small">
              +10
            </Button>
          </div>
          <div className="trading-card-quick-set-btn">
            <Button block size="small">
              +50
            </Button>
          </div>
          <div className="trading-card-quick-set-btn">
            <Button block size="small">
              +100
            </Button>
          </div>
        </div>
      </div>
      <div className="card-net-pos-info">
        <Row className="trading-card-posinfo trading-card-posinfo-lots">
          <Col className="trading-card-value buy-lots" span={6}>
            <Button
              block
              type={orderType === "LMT" ? "primary" : "default"}
              onClick={() => {
                setorderType("LMT");
              }}
            >
              LMT
            </Button>
          </Col>
          <Col className="trading-card-label trading-card-value" span={12}>
            <InputNumber
              className="lmt-price-value"
              step="0.1"
              defaultValue={3}
              onChange={(val) => {
                console.log(val);
              }}
            />
          </Col>
          <Col className="trading-card-value sell-lots" span={6}>
            <Button
              block
              type={orderType === "MKT" ? "primary" : "default"}
              onClick={() => {
                setorderType("MKT");
              }}
            >
              MKT
            </Button>
          </Col>
        </Row>
        <Row className="trading-card-posinfo trading-card-posinfo-lots">
          <Col className="trading-card-value buy-lots" span={6}>
            <span>
              {netPosInfo[curSym]
                ? netPosInfo[curSym].BUY.Lots
                : netPosInfo["EURUSD"].BUY.Lots}
            </span>
          </Col>
          <Col className="trading-card-label trading-card-value" span={12}>
            <span>建玉</span>
          </Col>
          <Col className="trading-card-value sell-lots" span={6}>
            <span>
              {netPosInfo[curSym]
                ? netPosInfo[curSym].SELL.Lots
                : netPosInfo["EURUSD"].SELL.Lots}
            </span>
          </Col>
        </Row>
        <Row className="trading-card-posinfo trading-card-posinfo-lots">
          <Col className="trading-card-value buy-lots" span={6}>
            <span>
              {netPosInfo[curSym]
                ? netPosInfo[curSym].BUY.AvgPrice
                : netPosInfo["EURUSD"].BUY.AvgPrice}
            </span>
          </Col>
          <Col className="trading-card-label trading-card-value" span={12}>
            <span>平均レート</span>
          </Col>
          <Col className="trading-card-value sell-lots" span={6}>
            <span>
              {netPosInfo[curSym]
                ? netPosInfo[curSym].SELL.AvgPrice
                : netPosInfo["EURUSD"].SELL.AvgPrice}
            </span>
          </Col>
        </Row>
        <Row className="trading-card-posinfo trading-card-posinfo-lots">
          <Col className="trading-card-value buy-lots" span={6}>
            <span>
              {netPosInfo[curSym]
                ? netPosInfo[curSym].BUY.Profit
                : netPosInfo["EURUSD"].BUY.Profit}
            </span>
          </Col>
          <Col className="trading-card-label trading-card-value" span={12}>
            <span>損益（円）</span>
          </Col>
          <Col className="trading-card-value sell-lots" span={6}>
            <span>
              {netPosInfo[curSym]
                ? netPosInfo[curSym].SELL.Profit
                : netPosInfo["EURUSD"].SELL.Profit}
            </span>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default TradingCard;
