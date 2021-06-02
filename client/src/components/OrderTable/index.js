import React from "react";
import { Table, Button } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { numberWithCommas } from "../../utils";
import "./style.css";

import { useApp } from "../../context";

const OrderTable = ({ orders, reqDelOrder, onClickOrderCloseAll }) => {
  const [useAppState] = useApp();
  const { server_status } = useAppState;

  const columns = [
    {
      title: "通貨",
      dataIndex: "symbol",
      align: "center",
      key: "symbol",
      defaultSortOrder: "ascend",
      sorter: (a, b) => {
        const val = a.ticket.localeCompare(b.ticket);
        if (val !== 0) return val;
        return a.account.localeCompare(b.account);
      },
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
      render: (lots) => (
        <span>{lots ? numberWithCommas(lots * 10) : 0}</span>
      ),
    },
    {
      title: "評価レート",
      className: "column-avg-price",
      dataIndex: "open_price",
      align: "center",
      key: "open_price",
    },
    {
      title: "口座",
      className: "column-account",
      dataIndex: "account",
      align: "center",
      key: "account",
      sorter: (a, b) => a.account.localeCompare(b.account),
      render: (text, record) => {
        if (record.alias && record.alias.length > 0) {
          return record.alias
        } else {
          return text
        }
      }
    },
    {
      title: "削除",
      className: "limit-order-delete",
      align: "center",
      render: (order, record) => (
        <Button
          disabled={server_status === "BUSY"}
          type="primary"
          block
          danger
          icon={<CloseOutlined />}
          onClick={(e) => {
            console.log(order.ticket);
            reqDelOrder(order.account, order.ticket, record.symbol);
          }}
        />
      ),
    },
  ];

  let locale = {
    emptyText: (
      <span className="table-empty-message">有効な注文はございません</span>
    ),
  };
  return (
    <div className="order-list-table">
      <Table
        columns={columns}
        dataSource={orders}
        bordered
        title={() => (
          <div className="order-table-title-control">
            <span>有効注文</span>
            <Button
              disabled={server_status === "BUSY"}
              size="small"
              type="primary"
              onClick={() => {
                onClickOrderCloseAll();
              }}
            >
              一括決済
            </Button>
          </div>
        )}
        pagination={false}
        locale={locale}
      />
    </div>
  );
};

export default OrderTable;
