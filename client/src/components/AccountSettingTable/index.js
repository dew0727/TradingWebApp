import React from "react";
import { Table } from "antd";
import "./style.css";

const columns = [
  {
    title: "口座",
    dataIndex: "account",
    align: "left",
  },
  {
    title: "残高",
    className: "column-balance",
    dataIndex: "balance",
    align: "right",
    render: (text, record) => {
        return record.balance.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
    },
  },
  {
    title: "マージン",
    className: "column-margin",
    dataIndex: "margin",
    align: "right",
    render: (text, record) => {
        return record.margin.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
    },
  },
  {
    title: "未確定損益",
    className: "column-profit",
    dataIndex: "profit",
    align: "right",
    render: (text, record) => {
        return record.profit.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
    },
  },
  {
    title: "Equity",
    className: "column-equity",
    dataIndex: "equity",
    align: "right",
    render: (text, record) => {
        return record.equity.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
    },
  },
  {
    title: "Basket",
    className: "column-basket-on-off",
    dataindex: "basket",
    align: "right",
    editable: true,
    render: (text, record) => {
        return record.basket === true ? "ON" : "OFF";
    }
  },
  {
    title: "Default",
    className: "column-default-lots",
    dataIndex: "default",
    align: "right",
    editable: true,
  },
];

const data = [
  {
    key: "acc-1",
    account: "Basket",
    balance: 97000000,
    margin: 800000,
    profit: 6408,
    equity: 97006408,
    basket: true,
    default: 1,
  },
  {
    key: "acc-2",
    account: "GP45643",
    balance: 97000000,
    margin: 800000,
    profit: 6408,
    equity: 97006408,
    basket: true,
    default: 1,
  },
  {
    key: "acc-3",
    account: "YJFX2134",
    balance: 97000000,
    margin: 800000,
    profit: 6408,
    equity: 97006408,
    basket: true,
    default: 1,
  },
  {
    key: "acc-4",
    account: "YJFX25698",
    balance: 97000000,
    margin: 800000,
    profit: 6408,
    equity: 97006408,
    basket: false,
    default: 1,
  },
  {
    key: "acc-5",
    account: "YJFX9865",
    balance: 97000000,
    margin: 800000,
    profit: 6408,
    equity: 97006408,
    basket: true,
    default: 5,
  },
  {
    key: "acc-6",
    account: "SAXO96432",
    balance: 97000000,
    margin: 800000,
    profit: 6408,
    equity: 97006408,
    basket: false,
    default: 1,
  },

];

const AccountSettingTable = ({ positions }) => {
  return (
    <>
      <Table
        columns={columns}
        dataSource={data}
        bordered
        title={() => "口座情報"}
        pagination={false}
      />
    </>
  );
};

export default AccountSettingTable;
