import React from "react";
import { Table, InputNumber, Grid } from "antd";
import "./style.css";

const AccountSettingTable = ({ accounts, callback }) => {
  const isDesktop = Grid.useBreakpoint()?.sm;
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
        return record.balance
          ? record.balance.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
          : 0;
      },
    },
    {
      title: isDesktop ? "マージン" : "マー..",
      className: "column-margin",
      dataIndex: "margin",
      align: "right",
      render: (text, record) => {
        return record.margin
          ? record.margin.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
          : 0;
      },
    },
    {
      title: isDesktop ? "未確定損益" : "未確..",
      className: "column-profit",
      dataIndex: "profit",
      align: "right",
      render: (text, record) => {
        return record.profit
          ? record.profit.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
          : 0;
      },
    },
    {
      title: "Equity",
      className: "column-equity",
      dataIndex: "equity",
      align: "right",
      render: (text, record) => {
        return record.equity
          ? record.equity.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
          : 0;
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
            defaultValue={record.default}
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
      dataIndex: "time",
      align: "right",
      editable: false,
      render: (time) => {
        var curTime = Date.now();
        if (curTime - time >= 30 * 1000) return "Dead";
        else return "Live";
      },
    },
  ];

  const onHandleClickBasket = ({ accname, basket, defaultLots }) => {
    if (basket !== undefined) basket = basket === true ? false : true;

    callback({ accname, basket, defaultLots });
  };

  let locale = {
    emptyText: <span className="table-empty-message">ございません</span>,
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
        locale={locale}
      />
    </>
  );
};

export default AccountSettingTable;
