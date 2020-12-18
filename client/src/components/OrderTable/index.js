import React from "react";
import { Table } from "antd";
import "./style.css";

const columns = [
  {
    title: "通貨",
    dataIndex: "symbol",
    align: "center",
    width: 80,
    key: "symbol",
  },
  {
    title: "買売",
    className: "column-command",
    dataIndex: "command",
    align: "center",
    width: 50,
    key: "command",
  },
  {
    title: "　枚数",
    className: "column-lots",
    dataIndex: "lots",
    align: "center",
    width: 100,
    key: "lots",
  },
  {
    title: "評価レート",
    className: "column-avg-price",
    dataIndex: "avg_price",
    align: "center",
    width: 100,
    key: "avg_price",
  },
  {
    title: " ",
    className: "column-blank",
    width: 80,
    key: "blank",
  },
  {
    title: "口座",
    className: "column-account",
    dataIndex: "account",
    align: "center",
    width: 55,
    key: "account",
  },
  {
    title: " ",
    className: "column-blank",
    width: 100,
    key: "blank-2",
  },
];

const data = [
  {
    symbol: "USDJPY",
    lots: "2",
    avg_price: "104.53",
    command: "売",
    account: "GP44573",
  },
  {
    symbol: "EURUSD",
    lots: "2",
    avg_price: "104.53",
    command: "売",
    account: "Basket",
  },
  {
    symbol: "GBPUSD",
    lots: "1",
    avg_price: "104.53",
    command: "買",
    account: "GP4343",
  },
];

const OrderTable = ({ positions }) => {
  return (
    <>
      <Table
        columns={columns}
        dataSource={data}
        bordered
        title={() => "Orders"}
        pagination={false}
      />
    </>
  );
};

export default OrderTable;
