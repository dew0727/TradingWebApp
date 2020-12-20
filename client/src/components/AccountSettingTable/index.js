import React from "react";
import { Table, InputNumber } from "antd";
import "./style.css";

const AccountSettingTable = ({ accounts, callback }) => {
  const columns = [
    {
      title: "口座",
      dataIndex: "name",
      align: "left",
      defaultSortOrder: "ascend",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "残高",
      className: "column-balance",
      dataIndex: "balance",
      align: "right",
      render: (text, record) => {
        return record.balance ? record.balance
          .toString()
          .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") : 0
      },
    },
    {
      title: "マージン",
      className: "column-margin",
      dataIndex: "margin",
      align: "right",
      render: (text, record) => {
        return record.margin ? record.margin
          .toString()
          .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") : 0;
      },
    },
    {
      title: "未確定損益",
      className: "column-profit",
      dataIndex: "profit",
      align: "right",
      render: (text, record) => {
        return record.profit ? record.profit
          .toString()
          .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") : 0
      },
    },
    {
      title: "Equity",
      className: "column-equity",
      dataIndex: "equity",
      align: "right",
      render: (text, record) => {
        return record.equity ? record.equity
          .toString()
          .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") : 0
      },
    },
    {
      title: "Basket",
      className: "column-basket-on-off",
      dataindex: "basket",
      align: "right",
      editable: true,
      render: (text, record) => {
        return (
          <div
            onClick={() => {
              onHandleClickBasket({
                accname: record.name,
                basket: record.basket,
              });
            }}
          >
            {record.basket === true ? "ON" : "OFF"}
          </div>
        );
      },
    },
    {
      title: "Default",
      className: "column-default-lots",
      dataIndex: "default",
      align: "center",
      render: (text, record) => {
        return (
          <InputNumber
            className="account-settings-default-lots-input"
            default={record.default}
            step={1}
            min={1}
            onChange={(val) => {
              if (val !== null && val !== "" && val >= 0)
              onHandleClickBasket({ accname: record.name, defaultLots: val });
            }}
            size={"small"}
          />
        );
      },
    },
    {
      title: "Status",
      className: "column-default-status",
      dataIndex: "status",
      align: "right",
      editable: false,
      render: (status) => (status ? "live" : "dead"),
    },
  ];

  const onHandleClickBasket = ({ accname, basket, defaultLots }) => {
    if (basket !== undefined) basket = basket === true ? false : true;

    callback({ accname, basket, defaultLots });
  };

  return (
    <>
      <Table
      className="account-setting-control-panel"
        columns={columns}
        dataSource={typeof accounts !== "object" ? [] : accounts}
        bordered
        title={() => "口座情報"}
        pagination={false}
      />
    </>
  );
};

export default AccountSettingTable;
