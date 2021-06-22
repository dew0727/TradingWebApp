import React from "react";
import { Table, Grid } from "antd";
import InputBox from "../InputBox";
import "./style.css";

const AccountSettingTable = ({
  accounts,
  maxLots,
  callback,
  onChangeGlobalSettings,
}) => {
  const isDesktop = Grid.useBreakpoint()?.sm;
  const columns = [
    {
      title: "口座",
      dataIndex: "name",
      align: "center",
      defaultSortOrder: "ascend",
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text, record) => {
        if (record.alias && record.alias.length > 0) {
          return record.alias;
        } else {
          return text;
        }
      },
    },
    /* {
      title: "残高",
      className: "column-balance",
      dataIndex: "balance",
      align: "center",
      render: (text, record) => {
        return record.balance
          ? Math.round(record.balance)
              .toString()
              .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
          : 0;
      },
    }, */
    {
      title: "使用率",
      className: "column-margin",
      dataIndex: "margin",
      align: "center",
      render: (text, record) => {
        return record.margin
          ? Math.round((record.margin * 100) / record.equity)
              .toFixed(1)
              .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") + '%'
          : '0%';
      },
    },
    /* {
      title: isDesktop ? "未確定損益" : "未確..",
      className: "column-profit",
      dataIndex: "profit",
      align: "center",
      render: (text, record) => {
        return record.profit
          ? Math.round(record.profit)
              .toString()
              .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
          : 0;
      },
    }, */
    {
      title: "純資産",
      className: "column-equity",
      dataIndex: "equity",
      align: "center",
      render: (text, record) => {
        return record.equity
          ? Math.round(record.equity)
              .toString()
              .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
          : 0;
      },
    },
    {
      title: "Basket",
      className: "column-basket-on-off",
      dataindex: "basket",
      align: "center",
      editable: true,
      render: (text, record) => {
        return (
          <div
            onClick={() => {
              callback({
                accname: record.name,
                type: "basket",
                value: !record.basket,
              });
            }}
          >
            {record.basket === true ? (
              <span className="account-status-live">ON</span>
            ) : (
              <span className="account-status-dead">OFF</span>
            )}
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
          <InputBox
            key={"default-lots-input-" + record.name}
            className="input-box-item"
            value={text}
            step={0.1}
            min={0}
            max={maxLots}
            onChange={(val) => {
              if (!isNaN(val) && val >= 0) {
                callback({
                  accname: record.name,
                  type: "defaultLots",
                  value: val,
                });
              }
            }}
            size="middle"
          />
        );
      },
    },
    {
      title: "Status",
      className: "column-default-status",
      dataIndex: "status",
      align: "center",
      editable: false,
      render: (status) => {
        var curTime = Date.now();
        if (curTime - status?.time >= 30 * 1000)
          return <span className="account-status-dead">DEAD</span>;
        else return <span className="account-status-live">LIVE</span>;
      },
    },
  ];

  let locale = {
    emptyText: <span className="table-empty-message">ございません</span>,
  };

  //console.log({waitingTime})
  return (
    <>
      <Table
        className="account-setting-control-panel"
        columns={columns}
        dataSource={typeof accounts !== "object" ? [] : accounts}
        bordered
        title={() => (
          <div className="position-table-title-control">
            <span>口座情報</span>
            <div>
              <label>Max Value: </label>
              <InputBox
                className="account-settings-default-lots-input"
                defaultValue={100}
                value={maxLots}
                step={1}
                min={1}
                onChange={(v) => {
                  onChangeGlobalSettings &&
                    onChangeGlobalSettings({ maxDefault: v });
                }}
                size={"small"}
              />
            </div>
          </div>
        )}
        pagination={false}
        locale={locale}
      />
    </>
  );
};

export default AccountSettingTable;
