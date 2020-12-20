import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Tabs,
  Form,
  Input,
  Button,
  Select,
  Table,
  notification,
} from "antd";
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

  const acc_columns = [
    {
      title: "Account Name",
      dataIndex: "name",
      align: "left",
    },
    {
      title: "Delete",
      className: "account_delete",
      align: "center",
      render: (acc) => (
        <Button
          type="primary"
          danger
          icon={<CloseOutlined />}
          onClick={() => {
            onHandleRemoveAccount(acc);
          }}
        />
      ),
    },
  ];

  const onHandleRemoveAccount = (account) => {
    console.log(account);
    apiCall("/api/delete-account", account.name, "POST", (res, user, pass) => {
      if (res.success === true) {
        console.log("account deleted");
        setAccounts(getAccounts().filter((acc) => acc.name !== account.name));
      }
    });
  };

  const requestOrderApi = (reqMsg) => {
    console.log("request order: ", reqMsg);
    apiCall("/api/order-request", reqMsg, "POST", (res) => {
      if (res.success === true) {
        notification.success({
          message: "Success",
          description: "Server accepted request!",
          duration: 10,
        });
      } else {
        notification.error({
          message: "Rejected",
          description: "Server rejected request!",
          duration: 10,
        });
      }
    });
  };

  const reqOrder = (order) => {
    const orderMsg = `${curAccount}@${order.Mode},${order.Symbol},${order.Command},${order.Lots},${order.Price},${order.SL},${order.TP},${order.Type}`;
    const title =
      "Request " +
      (order.Mode === "CLOSE_ALL"
        ? "CLOSE ALL"
        : `${order.Type} ${order.Command} Order`);
    const disMsg = `Account: ${curAccount}, Symbol: ${order.Symbol}, Lots: ${order.Lots}, Price: ${order.Price}, SL: ${order.SL}, TP: ${order.TP}`;
    notification.info({
      message: title,
      description: disMsg,
      duration: 10,
    });

    requestOrderApi(orderMsg);
  };

  const getSymbols = () => {
    return Object.keys(rates);
  };

  const getAccounts = () => {
    if (typeof accounts !== "object") return [];
    return accounts.filter((acc) => acc.name !== "Basket");
  };

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
        setAccounts((prevState) => {
          if (typeof prevState !== "object")
            return [
              {
                name: "Basket",
                status: false,
                time: Date.now(),
              },
              account,
            ];
          if (prevState.some((acc) => acc.name === account.name))
            return prevState.map((acc) =>
              acc.name === account.name ? account : acc
            );
          else return [...prevState, account];
        });

        break;
      case EVENTS.ON_POSLIST:
        var accPos = JSON.parse(message);
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
      if (res.success === true) {
        console.log("account added");
        var account = {
          name: values.broker + values.number,
          basket: values.basket === undefined ? false : values.basket,
          default: values.default === undefined ? 1 : values.default,
          ...values,
        };
        console.log(account);
        setAccounts([...accounts, account]);
        notification.success({ message: "Created new account." });
        return;
      } else {
        notification.error({
          message: "Failed to create new account.",
          description: res.error,
        });
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

  const onHandleAccSetting = (accname, basket, defaultLots) => {
    if (accname === undefined) return;
    const account = getAccounts().find((acc) => acc.name === accname);
    if (account === undefined || account.name === "Basket") return;
    let sMsg = `${account.name} `;
    if (basket !== undefined) {
      account.basket = basket;
      sMsg += " basket turned " + (basket ? "on" : "off");
    }

    if (defaultLots !== undefined) {
      account.default = defaultLots;
      sMsg += ` default value is ${defaultLots}`;
    }
    apiCall("/api/update-account", account, "POST", (res, user, pass) => {
      if (res.success === true) {
        setAccounts((prevState) => {
          return prevState.map((acc) =>
            acc.name === account.name ? account : acc
          );
        });
        notification.success({ message: sMsg });
      }
    });
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
                  posInfo={parsePosList()}
                  reqOrder={(order) => reqOrder(order)}
                />
              }
            </Col>
          </Row>
          <div className="trading-net-info">
            <div>
              <div className="trading-table-wrapper">
                <PositionTable
                  positions={parsePosList()}
                  onClickCloseAll={() => {
                    notification.info({
                      message: "Request Close All",
                      description: "Close all positions of system",
                      duration: 10,
                    });

                    requestOrderApi("Basket@CLOSE_ALL");
                  }}
                />
              </div>
              <div className="trading-table-wrapper">
                <OrderTable orders={parseOrderList()} />
              </div>
            </div>
            <div className="trading-table-wrapper">
              <AccountSettingTable
                accounts={getAccounts()}
                callback={({ accname, basket, defaultLots }) =>
                  onHandleAccSetting(accname, basket, defaultLots)
                }
              />
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
                dataSource={getAccounts()}
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
