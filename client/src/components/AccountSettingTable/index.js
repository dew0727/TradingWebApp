import React from "react";
import { Table } from "antd";
import "./style.css";

const columns = [
  {
    title: "口座",
    dataIndex: "name",
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
  {
    title: "Status",
    className: "column-default-status",
    dataIndex: "status",
    align: "right",
    editable: false,
    render: (status) => status ? "live" : "dead"
  },
];

const AccountSettingTable = ({ accounts }) => {
  
  return (
    <>
      <Table
        columns={columns}
        dataSource={typeof(accounts) !== 'object' ? [] : accounts}
        bordered
        title={() => "口座情報"}
        pagination={false}
      />
    </>
  );
};

export default AccountSettingTable;
