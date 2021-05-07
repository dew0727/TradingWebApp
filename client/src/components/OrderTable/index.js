import React from "react";
import { Table, Button } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import "./style.css";

const OrderTable = ({ orders, reqDelOrder, onClickOrderCloseAll }) => {
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
    },
    {
      title: "削除",
      className: "limit-order-delete",
      align: "center",
      render: (order) => (
        <Button
          type="primary"
          block
          danger
          icon={<CloseOutlined />}
          onClick={(e) => {
            console.log(order.ticket);
            reqDelOrder(order.account, order.ticket);
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
    <>
      <Table
        columns={columns}
        dataSource={orders}
        bordered
        title={() => (
          <div className="order-table-title-control">
            <span>有効注文</span>
            <Button
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
    </>
  );
};

export default OrderTable;
