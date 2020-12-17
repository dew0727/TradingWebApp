import React from "react";
import { Table } from "antd";
import "./style.css";

const columns = [
  {
    title: "通貨",
    dataIndex: "symbol",
    align: "center",
    width: 80,
  },
  {
    title: "買売",
    className: "column-command",
    dataIndex: "command",
    align: "center",
    width: 50,
  },
  {
    title: "　枚数",
    className: "column-lots",
    dataIndex: "lots",
    align: "center",
    width: 100,
  },
  {
    title: "評価レート",
    className: "column-avg-price",
    dataIndex: "avg_price",
    align: "center",
    width: 100,
  },
  {
    title: " ",
    className: "column-blank",
    width: 80,
  },
  {
    title: "口座",
    className: "column-account",
    dataIndex: "account",
    align: "center",
    width: 55,
  },
  {
    title: " ",
    className: "column-blank",
    width: 100,
  },
];

const data = [
  {
    key: "1",
    symbol: "USDJPY",
    lots: "2",
    avg_price: "104.53",
    command: "売",
    account: "GP44573",
  },
  {
    key: "1",
    symbol: "EURUSD",
    lots: "2",
    avg_price: "104.53",
    command: "売",
    account: "Basket",
  },
  {
    key: "1",
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
