import React, { useCallback, useEffect, useState } from "react";
import { Row, Col, Tabs, Form, Input, Button, Select, Table } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import createSocket from "../../socket";
import { TradingCard } from "../../components";
import "./style.css";
import TradingMenu from "../../components/TradingMenu";
import PositionTable from "../../components/PositionList";
import OrderTable from "../../components/OrderTable";
import AccountSettingTable from "../../components/AccountSettingTable";
import { EVENTS } from "../../config-client";
import { apiCall } from "../../utils/api";

const { TabPane } = Tabs;

const brokers = ["GP", "YJFX", "Saxo"];

const acc_columns = [
  {
    title: "Broker",
    dataIndex: "broker",
    align: "left",
  },
  {
    title: "Account Number",
    className: "account_number",
    dataIndex: "number",
    align: "right",
  },
  {
    title: "Delete",
    className: "account_delete",
    align: "center",
    render: (broker, number) => (
      <Button
        type="primary"
        danger
        icon={<CloseOutlined />}
        onClick={() => {
          onHandleRemoveAccount(broker, number);
        }}
      />
    ),
  },
];

const onHandleRemoveAccount = (broker, number) => {
  apiCall(
    "/api/delete-account",
    { broker, number },
    "POST",
    (res, user, pass) => {
      if (res === true) {
        console.log("account deleted");
      }
    }
  );
};

const TradingPage = () => {
  const [curBroker, setcurBroker] = useState("");
  const [curAccount, setCurAccount] = useState("Basket");

  const [accounts, setAccounts] = useState([
    {
      name: "Basket",
      status: false,
      time: Date.now(),
    },
  ]);
  const [posList, setPosList] = useState({});
  const [orderList, setOrderList] = useState({});
  const [rates, setRates] = useState({});

  const getSymbols = () => {
    return Object.keys(rates);
  };

  const getAccounts = () => {
    if (typeof accounts !== "object") return [];
    return accounts.filter((acc) => acc.name !== 'Basket')
  }

  const getAccountNames = () => {
    if (typeof accounts !== "object") return [];
    return accounts.map((acc) => acc.name);
  };

  const parseData = (topic, message) => {
    switch (topic) {
      case EVENTS.ON_RATE:
        var rates = JSON.parse(message);

        setRates(rates);
        break;
      case EVENTS.ON_ACCOUNT:
        var account = JSON.parse(message);

        if (accounts.find((acc) => acc.name === account.name))
          setAccounts(
            accounts.map((acc) => (acc.name === account.name ? account : acc))
          );
        else setAccounts(accounts.push(account));
        break;
      case EVENTS.ON_POSLIST:
        var accPos = JSON.parse(message);
        console.log("pos", posList);
        setPosList((prevState) => ({ [accPos.account]: accPos, ...prevState }));
        break;
      case EVENTS.ON_ORDERLIST:
        var accOrders = JSON.parse(message);

        setOrderList((prevState) => ({
          [accOrders.account]: accOrders,
          ...prevState,
        }));
        break;
      default:
        break;
    }
  };

  const parseOrderList = () => {
    if (curAccount !== "Basket") return orderList[curAccount].orders;

    var orders = [];

    Object.keys(orderList).forEach((account) => {
      if (orderList[account].orders.length > 0)
        orders = orders.concat(orderList[account].orders);
    });
    return orders;
  };

  const parsePosList = () => {
    if (curAccount !== "Basket") return posList[curAccount].positions;

    var positions = [];
    Object.keys(posList).forEach((account) => {
      if (posList[account].positions.length > 0)
        positions = positions.concat(posList[account].positions);
    });
    return positions;
  };

  useEffect(() => {
    createSocket(parseData);
  }, []);

  const onFinish = (values) => {
    apiCall("/api/add-account", { ...values }, "POST", (res, user, pass) => {
      if (res === true) {
        console.log("account added");
      }
    });
  };

  const updateAccountOrPriceFeed = ({ selectedBroker, selectedAccount }) => {
    if (selectedBroker) {
      apiCall(
        "/api/price-feed",
        { feed: selectedBroker },
        "POST",
        (res, user, pass) => {
          if (res === true) {
            setcurBroker(selectedBroker);
          }
        }
      );
    }
    if (selectedAccount) {
      setCurAccount(selectedAccount);
    }
  };

  return (
    <div className="traindg-home-page">
      <Tabs onChange={updateAccountOrPriceFeed} type="card" size="small">
        <TabPane tab="Home" key="home">
          <div className="broker-selection-menu">
            <TradingMenu
              brokers={getAccountNames()}
              accounts={getAccountNames()}
              callback={updateAccountOrPriceFeed}
            />
          </div>
          <Row
            className="site-card-wrapper trading-cards-wrapper"
            gutter={[16, 16]}
          >
            <Col>
              {
                <TradingCard
                  symbols={getSymbols(rates)}
                  rates={rates}
                  broker={curBroker}
                />
              }
            </Col>
            <Col>
              {
                <TradingCard
                  symbols={getSymbols(rates)}
                  rates={rates}
                  broker={curBroker}
                />
              }
            </Col>
            <Col>
              {
                <TradingCard
                  symbols={getSymbols(rates)}
                  rates={rates}
                  broker={curBroker}
                />
              }
            </Col>
            <Col>
              {
                <TradingCard
                  symbols={getSymbols(rates)}
                  rates={rates}
                  broker={curBroker}
                />
              }
            </Col>
            <Col>
              {
                <TradingCard
                  symbols={getSymbols(rates)}
                  rates={rates}
                  broker={curBroker}
                />
              }
            </Col>
            <Col>
              {
                <TradingCard
                  symbols={getSymbols(rates)}
                  rates={rates}
                  broker={curBroker}
                />
              }
            </Col>
            <Col>
              {
                <TradingCard
                  symbols={getSymbols(rates)}
                  rates={rates}
                  broker={curBroker}
                />
              }
            </Col>
            <Col>
              {
                <TradingCard
                  symbols={getSymbols(rates)}
                  rates={rates}
                  broker={curBroker}
                />
              }
            </Col>
          </Row>
          <div className="trading-net-info">
            <div>
              <div className="trading-table-wrapper">
                <PositionTable positions={parsePosList()} />
              </div>
              <div className="trading-table-wrapper">
                <OrderTable orders={parseOrderList()} />
              </div>
            </div>
            <div className="trading-table-wrapper">
              <AccountSettingTable accounts={getAccounts()} />
            </div>
          </div>
        </TabPane>
        <TabPane tab="Setting" key="setting">
          <div className="settings-wrapper">
            <div className="settings-form-wrapper">
              <Form
                labelCol={{ span: 10, offset: 1 }}
                wrapperCol={{ span: 12, offset: 1 }}
                layout="horizontal"
                size="small"
                onFinish={onFinish}
              >
                <Form.Item
                  label="Broker"
                  name="broker"
                  rules={[
                    {
                      required: true,
                      message: "Select one!",
                    },
                  ]}
                >
                  <Select defaultValue="Select">
                    {brokers.map((item, index) => {
                      return (
                        <Select.Option key={index} value={item}>
                          {item}
                        </Select.Option>
                      );
                    })}
                  </Select>
                </Form.Item>
                <Form.Item
                  label="Account Number"
                  name="number"
                  rules={[
                    {
                      required: true,
                      message: "Input account number!",
                    },
                  ]}
                >
                  <Input placeholder="Account Number" />
                </Form.Item>
                <Form.Item
                  label="Login"
                  name="loginID"
                  rules={[
                    {
                      required: true,
                      message: "Input login!",
                    },
                  ]}
                >
                  <Input placeholder="Login" />
                </Form.Item>
                <Form.Item
                  label="Password"
                  name="password"
                  rules={[
                    {
                      required: true,
                      message: "Input password!",
                    },
                  ]}
                >
                  <Input placeholder="Password" />
                </Form.Item>
                <Form.Item label=" " colon={false}>
                  <Button type="primary" size="default" htmlType="submit">
                    Add Account
                  </Button>
                </Form.Item>
              </Form>
            </div>
            <div className="account-list-wrapper">
              <Table
                bordered
                title={() => "Account List"}
                pagination={false}
                dataSource={[]}
                columns={acc_columns}
              />
            </div>
          </div>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default TradingPage;
