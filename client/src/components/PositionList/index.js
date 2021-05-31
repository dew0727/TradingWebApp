import React from "react";
import { Button, Table, Grid } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { numberWithCommas } from '../../utils'
import "./style.css";

import { useApp } from "../../context";
const PositionTable = ({ positions, onClickCloseOne, onClickCloseAll }) => {
  const isDesktop = Grid.useBreakpoint()?.sm;
  const [useAppState] = useApp();
  const { server_status } = useAppState;
  const columns = [
    {
      title: isDesktop ? "通貨" : "通..",
      dataIndex: "symbol",
      align: "center",
      key: "symbol",
      defaultSortOrder: "ascend",
      sorter: (a, b) => {
        const val = a.symbol.localeCompare(b.symbol);
        if (val !== 0) return val;
        return a.account.localeCompare(b.account);
      },
    },
    {
      title: "建玉",
      className: "column-lots",
      dataIndex: "lots",
      align: "center",
      key: "lots",
    },
    {
      title: isDesktop ? "平均レート" : "平均..",
      className: "column-open-price",
      dataIndex: "open_price",
      align: "center",
      key: "open_price",
      render: (text, record) => {
        const point = record.symbol?.toUpperCase().includes("JPY") ? 3 : 5;
        return <span>{parseFloat(text).toFixed(point)}</span>
      }
    },
    /*     {
          title: isDesktop ? "評価レート" : "評価",
          className: "column-current-price",
          dataIndex: "current_price",
          align: "center",
          key: "current_price",
        }, */
    /*     {
          title: "損益",
          className: "column-profit",
          dataIndex: "profit",
          align: "center",
          key: "profit",
          render: (profit) => profit.toFixed(0),
        }, */
    /*     {
          title: isDesktop ? "スワップ" : "スワ..",
          className: "columnswap",
          dataIndex: "swap",
          align: "center",
          key: "swap",
          render: (swap) => swap.toFixed(0),
        }, */
    {
      title: isDesktop ? "損益合計" : "損益..",
      className: "column-total-profit",
      dataIndex: "total_profit",
      align: "center",
      key: "total_profit",
      render: (total_profit) => (
        <span>{total_profit ? numberWithCommas(total_profit) : 0}</span>
      ),
    },
    {
      title: isDesktop ? "口座" : "口座",
      dataIndex: "account",
      align: "center",
      key: "account",
      sorter: (a, b) => a.account.localeCompare(b.account),
    },
    {
      title: "削除",
      className: "position-close",
      align: "center",
      render: (position) => (
        <Button
          disabled={server_status === "BUSY"}
          type="primary"
          block
          danger
          icon={<CloseOutlined />}
          onClick={(e) => {
            onClickCloseOne(position.symbol, position.account);
          }}
        />
      ),
    },
  ];

  let locale = {
    emptyText: (
      <span className="table-empty-message">対象の建玉はございません</span>
    ),
  };

  return (
    <div className="position-list-table">
      <Table
        columns={columns}
        dataSource={positions}
        bordered
        title={() => (
          <div className="position-table-title-control">
            <span>建玉</span>
            <Button
              disabled={server_status === "BUSY"}
              size="small"
              type="primary"
              onClick={() => {
                onClickCloseAll();
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

export default PositionTable;
