import React, { useState } from "react";
import { Row, Col, Button, Input, InputNumber, message } from "antd";
import SymbolSelector from "../SymbolSelector";
import "./style.css";

const ORDER_TYPES = {
  MARKET: "MARKET",
  BUYLIMIT: "BUYLIMIT",
  BUYSTOP: "BUYSTOP",
  SELLLMIT: "SELLLIMIT",
  SELLSTOP: "SELLSTOP",
};

const COMMAND = {
  BUY: "BUY",
  SELL: "SELL",
};

const ORDER_MODE = {
  OPEN: "ORDER_OPEN",
  CLOSE: "ORDER_CLOSE",
  CLOSE_ALL: "ORDER_CLOSE_ALL",
  DELETE: "ORDER_DELETE",
};

const specPrice = (symbol, price, fixsize = 5) => {
  if (price === undefined || symbol === undefined)
    return { first: "", last: "" };
  const strPrice = Number.parseFloat(price).toFixed(fixsize);
  const last = strPrice.substr(-3);
  const first = strPrice.substr(0, strPrice.length - 3);

  return { first: first, last: last };
};

const TradingCard = ({ symbols, posInfo, rates, reqOrder }) => {
  const [curSym, setcurSym] = useState();
  const [orderType, setorderType] = useState("MARKET");
  const [orderContent, setOrderContent] = useState({
    lots: 0,
    sl: 0,
    tp: 0,
    price: 0,
  });

  const reset = () => {
    setOrderLots(0);
  };

  const setOrderLots = (size, isPlus) => {
    console.log(orderContent.lots);
    setOrderContent({
      ...orderContent,
      lots: isPlus ? orderContent.lots + size : size,
    });
  };

  let bid = 0,
    ask = 0,
    sp = 0,
    point;
  let lots = [0, 0],
    profit = [0, 0],
    price = [0, 0];

  if (curSym !== undefined && curSym in rates) {
    bid = rates[curSym].bid;
    ask = rates[curSym].ask;
    point = curSym.toUpperCase().includes("JPY") ? 3 : 5;
    sp = Math.abs(bid - ask) * (point === 5 ? 10000 : 100);

    const posList = posInfo.filter((item) => item.symbol === curSym);

    posList.forEach((pos) => {
      if (pos.lots > 0) {
        lots[0] += pos.lots;
        price[0] += pos.open_price * pos.lots;
        profit[0] += pos.profit;  
      } else {
        lots[1] += Math.abs(pos.lots);
        price[1] += Math.abs(pos.open_price * pos.lots);
        profit[1] += pos.profit;
      }
    });

    price[0] = lots[0] === 0 ? 0 : price[0] / lots[0];
    price[1] = lots[1] === 0 ? 0 : price[1] / lots[1];
  }

  //ORDER_OPEN,EURUSD,BUY,0.3,1.23,0,0,MARKET
  const newSignal = (mode, command, reqPrice) => {
    if (mode === undefined) {
      message.error({ content: "Invalid request parameters!" });
      return;
    }

    if (curSym === undefined) {
      message.error({ content: "Please select symbol!" });
      return;
    }

    if (mode === ORDER_MODE.CLOSE_ALL) {
      reqOrder({ Mode: "ORDER_CLOSE_ALL", Symbol: curSym });
      return;
    }

    let ordType = "";
    if (orderType !== ORDER_TYPES.MARKET) {
      reqPrice = orderContent.price;
      console.log(command,  COMMAND.BUY);
      if (command === COMMAND.BUY) {
        console.log("orderType: ", ordType);
        if (reqPrice < ask) ordType = "BUYLIMIT";
        else ordType = "BUYSTOP";
      } else {
        if (reqPrice > bid) ordType = "SELLLMIT";
        else ordType = "SELLSTOP";
      }
      console.log("orderType: ", ordType);
    }

    if (reqPrice === 0) {
      message.error({ content: "Invalid price! " + reqPrice });
      return;
    }

    if (command === undefined) {
      message.error({ content: "Invalid request parameters!" });
      return;
    }

    if (orderContent.lots === 0) {
      message.error({ content: "Invalid lots to request!" });
      return;
    }

    const orderMsg = {
      Mode: mode,
      Symbol: curSym,
      Command: command,
      Lots: orderContent.lots,
      Price: reqPrice,
      SL: orderContent.sl,
      TP: orderContent.tp,
      Type: orderType === ORDER_TYPES.MARKET ? orderType : ordType,
    };
    reqOrder(orderMsg);
  };

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
        <Col className="command-header-bid command-header-int" span={4}>
          <span>{specPrice(curSym, bid, point).first}</span>
        </Col>
        <Col className="command-header-bid command-header-float" span={6}>
          <span>{specPrice(curSym, bid, point).last}</span>
        </Col>
        <Col className="command-header command-header-int" span={4}>
          <span>{sp.toFixed(1)}</span>
        </Col>
        <Col className="command-header-ask command-header-int" span={4}>
          <span>{specPrice(curSym, ask, point).first}</span>
        </Col>
        <Col className="command-header-ask command-header-float" span={6}>
          <span>{specPrice(curSym, ask, point).last}</span>
        </Col>
      </Row>
      <Row gutter={[0, 10]} justify="center" align="center">
        <Col span={18}>
          <Button
            block
            htmlType
            className="btn-control"
            onClick={() => {
              newSignal(ORDER_MODE.CLOSE_ALL, "", 0);
            }}
          >
            前決済
          </Button>
        </Col>
      </Row>
      <Row gutter={[0, 10]} align="center">
        <Col span={10}>
          <Button
            block
            className="command-header-bid"
            onClick={() => {
              newSignal(ORDER_MODE.OPEN, COMMAND.SELL, bid);
            }}
          >
            売
          </Button>
        </Col>
        <Col span={10} offset={4}>
          <Button
            block
            className="command-header-ask"
            onClick={() => {
              newSignal(ORDER_MODE.OPEN, COMMAND.BUY, ask);
            }}
          >
            買
          </Button>
        </Col>
      </Row>
      <div className="trading-card-set-lots">
        <Row className="trading-card-input-lots">
          <Col span={4} style={{ color: "white" }}>
            <Row>枚数</Row>
          </Col>
          <Col span={6} className="trading-card-input-lots-wrapper">
            <Input
              defaultValue={0}
              value={orderContent.lots}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setOrderLots(Number.isNaN(val) ? 0 : val);
              }}
            />
          </Col>
          <Col span={4}></Col>
          <Col span={8} className="trading-card-reset-btn">
            <Button
              onClick={(e) => {
                reset();
              }}
            >
              リセット
            </Button>
          </Col>
        </Row>
        <div className="trading-card-input trading-card-quick-set-lots">
          <div className="trading-card-quick-set-btn">
            <Button
              block
              size="small"
              onClick={() => {
                setOrderLots(1, 1);
              }}
            >
              +1
            </Button>
          </div>
          <div className="trading-card-quick-set-btn">
            <Button
              block
              size="small"
              onClick={() => {
                setOrderLots(5, 1);
              }}
            >
              +5
            </Button>
          </div>
          <div className="trading-card-quick-set-btn">
            <Button
              block
              size="small"
              onClick={() => {
                setOrderLots(10, 1);
              }}
            >
              +10
            </Button>
          </div>
          <div className="trading-card-quick-set-btn">
            <Button
              block
              size="small"
              onClick={() => {
                setOrderLots(50, 1);
              }}
            >
              +50
            </Button>
          </div>
          <div className="trading-card-quick-set-btn">
            <Button
              block
              size="small"
              onClick={() => {
                setOrderLots(100, 1);
              }}
            >
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
              type={orderType === "LIMIT" ? "primary" : "default"}
              onClick={() => {
                setorderType("LIMIT");
              }}
            >
              LMT
            </Button>
          </Col>
          <Col className="trading-card-label trading-card-value" span={12}>
            <InputNumber
              className="lmt-price-value"
              step={"0." + "0".repeat(point - 1) + "1"}
              value={orderContent.price}
              onClick={(e) => {
                setOrderContent({
                  ...orderContent,
                  price: bid,
                });
              }}
              onChange={(val) => {
                setOrderContent({
                  ...orderContent,
                  price: val,
                });
              }}
            />
          </Col>
          <Col className="trading-card-value sell-lots" span={6}>
            <Button
              block
              type={orderType === "MARKET" ? "primary" : "default"}
              onClick={() => {
                setorderType("MARKET");
              }}
            >
              MKT
            </Button>
          </Col>
        </Row>
        <Row className="trading-card-posinfo trading-card-posinfo-lots">
          <Col className="trading-card-value buy-lots" span={6}>
            <span>{lots[0].toFixed(2)}</span>
          </Col>
          <Col className="trading-card-label trading-card-value" span={12}>
            <span>建玉</span>
          </Col>
          <Col className="trading-card-value sell-lots" span={6}>
            <span>{lots[1].toFixed(2)}</span>
          </Col>
        </Row>
        <Row className="trading-card-posinfo trading-card-posinfo-lots">
          <Col className="trading-card-value" span={6}>
            <span>{price[0].toFixed(point)}</span>
          </Col>
          <Col className="trading-card-label trading-card-value" span={12}>
            <span>平均レート</span>
          </Col>
          <Col className="trading-card-value" span={6}>
            <span>{price[1].toFixed(point)}</span>
          </Col>
        </Row>
        <Row className="trading-card-posinfo trading-card-posinfo-lots">
          <Col className="trading-card-value" span={6}>
            <span>{profit[0].toFixed(0)}</span>
          </Col>
          <Col className="trading-card-label trading-card-value" span={12}>
            <span>損益（円）</span>
          </Col>
          <Col className="trading-card-value" span={6}>
            <span>{profit[1].toFixed(0)}</span>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default TradingCard;
