import React from "react";
import { Button, Table } from "antd";
import "./style.css";

const columns = [
  {
    title: "Symbol",
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
    title: "Open Price",
    className: "column-open-price",
    dataIndex: "open_price",
    align: "center",
    key: "open_price",
  },
  {
    title: "Current Price",
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
    title: "Total Profit",
    className: "column-total-profit",
    dataIndex: "total_profit",
    align: "center",
    key: "total_profit",
  },
];

const PositionTable = ({ positions, onClickCloseAll }) => {
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
