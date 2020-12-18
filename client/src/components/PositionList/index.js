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

const PositionTable = ({ positions }) => {
  return (
    <>
      <Table
        columns={columns}
        dataSource={positions}
        bordered
        title={() => "Positions"}
        pagination={false}
      />
    </>
  );
};

export default PositionTable;
