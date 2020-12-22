import React from "react";
import { Button, Table, Grid } from "antd";
import "./style.css";

const PositionTable = ({ positions, onClickCloseAll }) => {
  const isDesktop = Grid.useBreakpoint()?.sm;

const columns = [
  {
    title: isDesktop ? "通貨": "通..",
    dataIndex: "symbol",
    align: "center",
    key: "symbol",
    defaultSortOrder: "ascend",
    sorter: (a, b) => a.symbol.localeCompare(b.symbol),
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
  },
  {
    title: isDesktop ? "評価レート" : "評価",
    className: "column-current-price",
    dataIndex: "current_price",
    align: "center",
    key: "current_price",
  },
  {
    title: "損益",
    className: "column-profit",
    dataIndex: "profit",
    align: "center",
    key: "profit",
  },
  {
    title: isDesktop ? "スワップ" : "スワ..",
    className: "columnswap",
    dataIndex: "swap",
    align: "center",
    key: "swap",
  },
  {
    title: isDesktop ? "損益合計" : "損益..",
    className: "column-total-profit",
    dataIndex: "total_profit",
    align: "center",
    key: "total_profit",
  },
  {
    title: isDesktop ? "口座": "口座",
    dataIndex: "account",
    align: "center",
    key: "account",
    defaultSortOrder: "ascend",
  },
];

  return (
    <div className="position-list-table">
      <Table
        columns={columns}
        dataSource={positions}
        bordered
        title={() => (
          <div className="position-table-title-control">
            <span>Positions List</span>
            <Button size="small" type="primary" onClick={() => {onClickCloseAll()}}>
            一括決済
            </Button>
          </div>
        )}
        pagination={false}
      />
    </div>
  );
};

export default PositionTable;
