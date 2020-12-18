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
    render: (command) => command.includes("BUY")? "買":"売",
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
    dataIndex: "open_price",
    align: "center",
    width: 100,
    key: "open_price",
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

const OrderTable = ({ orders }) => {
  
  return (
    <>
      <Table
        columns={columns}
        dataSource={orders}
        bordered
        title={() => "Orders"}
        pagination={false}
      />
    </>
  );
};

export default OrderTable;
