import React, { useRef } from "react";
import { Table, InputNumber, Grid } from "antd";
import "./style.css";

const AccountSettingTable = ({
  accounts,
  maxLots,
  retryCount,
  waitingTime,
  callback,
  onChangeGlobalSettings,
}) => {
  const inputRef = useRef(null);

  const onHandleStep = (e) => {
    inputRef.current.blur();
  };

  const isDesktop = Grid.useBreakpoint()?.sm;
  const columns = [
    {
      title: "口座",
      dataIndex: "name",
      align: "center",
      defaultSortOrder: "ascend",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
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
    },
    {
      title: isDesktop ? "マージン" : "マー..",
      className: "column-margin",
      dataIndex: "margin",
      align: "center",
      render: (text, record) => {
        return record.margin
          ? Math.round(record.margin)
              .toString()
              .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
          : 0;
      },
    },
    {
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
    },
    {
      title: "Equity",
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
              onHandleClickBasket({
                accname: record.name,
                basket: record.basket,
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
          <InputNumber
            key={"default-lots-input-" + record.name}
            className="account-settings-default-lots-input"
            value={record.default}
            step={0.1}
            min={0}
            max={maxLots}
            onChange={(val) => {
              if (!isNaN(val) && val >= 0) {
                onHandleClickBasket({ accname: record.name, defaultLots: val });
              }
            }}
            size={"medium"}
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

  const onHandleClickBasket = ({
    accname,
    basket,
    defaultLots,
    maxVal,
    retryCount,
  }) => {
    if (basket !== undefined) basket = basket === true ? false : true;
    callback({ accname, basket, defaultLots, maxVal, retryCount });
  };

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
              <label>Retry Count: </label>
              <InputNumber
                className="account-settings-default-lots-input"
                value={retryCount}
                step={1}
                min={1}
                onChange={(v) => {
                  onChangeGlobalSettings &&
                    onChangeGlobalSettings({ retryCount: v });
                }}
                size={"small"}
              />
            </div>
            <div>
              <label>Waiting Time: </label>
              <InputNumber
                className="account-settings-default-lots-input"
                value={waitingTime}
                step={1}
                min={0}
                onChange={(v) => {
                  onChangeGlobalSettings &&
                    onChangeGlobalSettings({ waitingTime: v });
                }}
                size={"small"}
              /><span>ms</span>
            </div>
            <div>
              <label>Max Value: </label>
              <InputNumber
                className="account-settings-default-lots-input"
                ref={inputRef}
                defaultValue={100}
                value={maxLots}
                step={1}
                min={1}
                onChange={(v) => {
                  onChangeGlobalSettings &&
                    onChangeGlobalSettings({ maxDefault: v });
                }}
                onStep={onHandleStep}
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
