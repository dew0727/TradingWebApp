import React from "react";
import { Button, Table, Grid } from "antd";
import "./style.css";

const PositionTable = ({ positions, onClickCloseAll }) => {
  const isDesktop = Grid.useBreakpoint()?.sm;

const columns = [
  {
    title: isDesktop ? "Symbol": "Sym",
    dataIndex: "symbol",
    align: "center",
    key: "symbol",
    defaultSortOrder: "ascend",
    sorter: (a, b) => a.symbol.localeCompare(b.symbol),
  },
  {
    title: "Lots",
    className: "column-lots",
    dataIndex: "lots",
    align: "center",
    key: "lots",
  },
  {
    title: isDesktop ? "Open Price" : "Open",
    className: "column-open-price",
    dataIndex: "open_price",
    align: "center",
    key: "open_price",
  },
  {
    title: isDesktop ? "Current Price" : "Current",
    className: "column-current-price",
    dataIndex: "current_price",
    align: "center",
    key: "current_price",
  },
  {
    title: "Profit",
    className: "column-profit",
    dataIndex: "profit",
    align: "center",
    key: "profit",
  },
  {
    title: "Swap",
    className: "columnswap",
    dataIndex: "swap",
    align: "center",
    key: "swap",
  },
  {
    title: isDesktop ? "Total Profit" : "Total",
    className: "column-total-profit",
    dataIndex: "total_profit",
    align: "center",
    key: "total_profit",
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
