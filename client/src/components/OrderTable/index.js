import React from "react";
import { Table } from "antd";
import "./style.css";

const columns = [
  {
    title: "通貨",
    dataIndex: "symbol",
    align: "center",
    key: "symbol",
    defaultSortOrder: "ascend",
    sorter: (a, b) => a.symbol.localeCompare(b.symbol),
  },
  {
    title: "買売",
    className: "column-command",
    dataIndex: "command",
    align: "center",
    key: "command",
    render: (command) => (command.includes("BUY") ? "買" : "売"),
  },
  {
    title: "　枚数",
    className: "column-lots",
    dataIndex: "lots",
    align: "center",

    key: "lots",
    defaultSortOrder: "ascend",
  },
  {
    title: "評価レート",
    className: "column-avg-price",
    dataIndex: "open_price",
    align: "center",

    key: "open_price",
  },
  {
    title: " ",
    className: "column-blank",
    key: "blank",
  },
  {
    title: "口座",
    className: "column-account",
    dataIndex: "account",
    align: "center",
    key: "account",
  },
  {
    title: " ",
    className: "column-blank",

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
