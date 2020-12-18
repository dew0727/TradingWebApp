import React from "react";
import { Table } from "antd";
import "./style.css";

const columns = [
  {
    title: "Symbol",
    dataIndex: "symbol",
    align: "center",
    width: 80,
    key: "symbol"
  },
  {
    title: "Lots",
    className: "column-lots",
    dataIndex: "lots",
    align: "center",
    width: 50,
    key: "lots"
  },
  {
    title: "Open Price",
    className: "column-open-price",
    dataIndex: "open_price",
    align: "center",
    width: 100,
    key: "open_price"
  },
  {
    title: "Current Price",
    className: "column-current-price",
    dataIndex: "current_price",
    align: "center",
    width: 100,
    key: "current_price"
  },
  {
    title: "Profit",
    className: "column-profit",
    dataIndex: "profit",
    align: "center",
    width: 80,
    key: "profit"
  },
  {
    title: "Swap",
    className: "columnswap",
    dataIndex: "swap",
    align: "center",
    width: 55,
    key: "swap"
  },
  {
    title: "Total Profit",
    className: "column-total-profit",
    dataIndex: "total_profit",
    align: "center",
    width: 100,
    key: "total_profit"
  },
];

const data = [
  {
    symbol: "USDJPY",
    lots: "2",
    open_price: "104.53",
    current_price: "105.13",
    profit: "-532.02",
    swap: "0.2",
    total_profit: "804.53",
  },
  {
    symbol: "USDJPY",
    lots: "4",
    open_price: "104.53",
    current_price: "105.13",
    profit: "-532.02",
    swap: "0.2",
    total_profit: "804.53",
  },
  {
    symbol: "USDJPY",
    lots: "3",
    open_price: "104.53",
    current_price: "105.13",
    profit: "-532.02",
    swap: "0.2",
    total_profit: "804.53",
  },
  {
    symbol: "USDJPY",
    lots: "1",
    open_price: "104.53",
    current_price: "105.13",
    profit: "-532.02",
    swap: "0.2",
    total_profit: "804.53",
  },
];

const PositionTable = ({ positions }) => {
  return (
    <>
      <Table
        columns={columns}
        dataSource={data}
        bordered
        title={() => "Positions"}
        pagination={false}
      />
    </>
  );
};

export default PositionTable;
