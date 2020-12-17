import React from "react";
import { Table } from "antd";
import "./style.css";

const columns = [
  {
    title: "Symbol",
    dataIndex: "symbol",
    align: "center",
    width: 80,
  },
  {
    title: "Lots",
    className: "column-lots",
    dataIndex: "lots",
    align: "center",
    width: 50,
  },
  {
    title: "Open Price",
    className: "column-open-price",
    dataIndex: "open_price",
    align: "center",
    width: 100,
  },
  {
    title: "Current Price",
    className: "column-current-price",
    dataIndex: "current_price",
    align: "center",
    width: 100,
  },
  {
    title: "Profit",
    className: "column-profit",
    dataIndex: "profit",
    align: "center",
    width: 80,
  },
  {
    title: "Swap",
    className: "columnswap",
    dataIndex: "swap",
    align: "center",
    width: 55,
  },
  {
    title: "Total Profit",
    className: "column-total-profit",
    dataIndex: "total_profit",
    align: "center",
    width: 100,
  },
];

const data = [
  {
    key: "1",
    symbol: "USDJPY",
    lots: "2",
    open_price: "104.53",
    current_price: "105.13",
    profit: "-532.02",
    swap: "0.2",
    total_profit: "804.53",
  },
  {
    key: "2",
    symbol: "USDJPY",
    lots: "4",
    open_price: "104.53",
    current_price: "105.13",
    profit: "-532.02",
    swap: "0.2",
    total_profit: "804.53",
  },
  {
    key: "3",
    symbol: "USDJPY",
    lots: "3",
    open_price: "104.53",
    current_price: "105.13",
    profit: "-532.02",
    swap: "0.2",
    total_profit: "804.53",
  },
  {
    key: "4",
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
