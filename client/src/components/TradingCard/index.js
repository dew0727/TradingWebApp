import React, { useState } from "react";
import { Row, Col, Button, Input } from "antd";
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

const TradingCard = ({ symbols, sym, posInfo }) => {
  const [netPosInfo, setNetPosInfo] = useState(posInfoSample);
  const [curSym, setcurSym] = useState(sym);

  return (
    <div className="trading-card-container">
      <div className="card-symbol-name">
        <SymbolSelector
          symbols={symbols}
          sym={sym}
          callback={(key) => {
            setcurSym(key);
          }}
        />
      </div>
      <Row className="card-commands">
        <Col className="command-header-bid" span={5}>
          <span>売</span>
        </Col>
        <Col className="command-header-bid" span={5}>
          <span>BID</span>
        </Col>
        <Col className="command-header" span={4}>
          <span>sp</span>
        </Col>
        <Col className="command-header-ask" span={5}>
          <span>ASK</span>
        </Col>
        <Col className="command-header-ask" span={5}>
          <span>買</span>
        </Col>
      </Row>
      <Row gutter={[0, 10]} className="card-commands">
        <Col className="command-header-bid" span={5}>
          <span>104</span>
        </Col>
        <Col className="command-header-bid" span={5}>
          <span>.38</span>
        </Col>
        <Col className="command-header" span={4}>
          <span>0.1</span>
        </Col>
        <Col className="command-header-ask" span={5}>
          <span>104</span>
        </Col>
        <Col className="command-header-ask" span={5}>
          <span>.38</span>
        </Col>
      </Row>
      <Row gutter={[0, 10]} justify="center" align="center">
        <Col span={18}>
          <Button block className="btn-control">
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
      <div className="card-net-pos-info">
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
                ? netPosInfo[curSym].BUY.ProfitInPips
                : netPosInfo["EURUSD"].BUY.ProfitInPips}
            </span>
          </Col>
          <Col className="trading-card-label trading-card-value" span={12}>
            <span>損益（pips）</span>
          </Col>
          <Col className="trading-card-value sell-lots" span={6}>
            <span>
              {netPosInfo[curSym]
                ? netPosInfo[curSym].SELL.ProfitInPips
                : netPosInfo["EURUSD"].SELL.ProfitInPips}
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
      <div className="trading-card-set-lots">
        <Row className="trading-card-input-lots">
              <Col span={4} style={{color: "white"}}><Row>枚数</Row></Col>
              <Col span={6} className="trading-card-input-lots-wrapper"><Input size="small"/></Col>
              <Col span={4}></Col>
              <Col span={8}><Button size="default">リセット</Button></Col>
        </Row>
        <div className="trading-card-input trading-card-quick-set-lots">
          <div className="trading-card-quick-set-btn">
            <Button size="small">+1</Button>
          </div>
          <div className="trading-card-quick-set-btn">
            <Button size="small">+5</Button>
          </div>
          <div className="trading-card-quick-set-btn">
            <Button size="small">+10</Button>
          </div>
          <div className="trading-card-quick-set-btn">
            <Button size="small">+50</Button>
          </div>
          <div className="trading-card-quick-set-btn">
            <Button size="small">+100</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingCard;
