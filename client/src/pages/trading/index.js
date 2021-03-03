import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Grid,
  Tabs,
  Form,
  Input,
  Button,
  Select,
  Table,
  notification,
  message,
  List,
  Typography,
  Divider,
  Popconfirm,
  Switch,
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
import { apiCall, Logout } from "../../utils/api";
const dateFormat = require("dateformat");

const { TabPane } = Tabs;

const brokers = ["GP", "YJFX", "SAXO", "FXGBM"];
const SymbolDictionary = [
  "EURUSD",
  "USDJPY",
  "GBPUSD",
  "GBPJPY",
  "EURJPY",
  "AUDJPY",
  "AUDUSD",
  "CADJPY",
];

const waiting_time = 5;
let enableNotify = localStorage.getItem("enableNotify") ? true : false ;

const TradingPage = () => {
  const [curBroker, setcurBroker] = useState("");
  const [curAccount, setCurAccount] = useState("Basket");
  const lg = Grid.useBreakpoint()?.lg;
  const md = Grid.useBreakpoint()?.md;
  const sm = Grid.useBreakpoint()?.sm;
  const xl = Grid.useBreakpoint()?.xl;
  const xxl = Grid.useBreakpoint()?.xxl;

  const [accounts, setAccounts] = useState([
    {
      name: "Basket",
      status: false,
      time: Date.now(),
    },
    {
      name: "All",
      status: false,
      time: Date.now(),
    },
  ]);
  const [posList, setPosList] = useState({});
  const [orderList, setOrderList] = useState({});
  const [rates, setRates] = useState({});

  const [logHistory, setlogHistory] = useState([]);

  const acc_columns = [
    {
      title: "口座",
      dataIndex: "name",
      align: "left",
    },
    {
      title: "削除",
      className: "account_delete",
      align: "center",
      render: (acc) => (
        <Popconfirm
          title="この口座を削除しますか？"
          onConfirm={() => onHandleRemoveAccount(acc)}
          okText="はい"
          cancelText="番号"
        >
          <Button type="primary" block danger icon={<CloseOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  const onHandleRemoveAccount = (account) => {
    apiCall("/api/delete-account", account.name, "POST", (res, user, pass) => {
      if (res.success === true) {
        setAccounts(getAccounts().filter((acc) => acc.name !== account.name));
        openNotification("Notice", "", "Removed Account " + account.name);
      }
    });
  };

  const requestOrderApi = (reqMsg) => {
    apiCall("/api/order-request", reqMsg, "POST", (res) => {
      if (res.success === true) {
        openNotification("Notice", "", "Server accepted request");
      } else {
        openNotification(
          "Error",
          "Rejected order",
          "Server rejected request order."
        );
      }
    });
  };

  const reqOrder = (order) => {
    const orderMsg = {
      ...order,
      Account: curAccount,
    };

    if (order.Mode === "ORDER_CLOSE_ALL") {
      if (parsePosList() === undefined || parsePosList().length < 1) {
        message.error("対象の建玉はございません");
        return;
      }
    }

    const title =
      order.Mode === "ORDER_CLOSE_ALL"
        ? "CLOSE ALL " + order.Symbol
        : `${order.Type} ${order.Command} Order`;
    const disMsg = `Account: ${curAccount}, Symbol: ${order.Symbol}, Lots: ${order.Lots}, Price: ${order.Price}, SL: ${order.SL}, TP: ${order.TP}`;

    openNotification("Request", title, disMsg);
    requestOrderApi(orderMsg);
  };

  const getSymbols = () => {
    const sorted = Object.keys(rates).sort((a, b) => {
      const id1 = SymbolDictionary.indexOf(a);
      const id2 = SymbolDictionary.indexOf(b);

      return 1 / id1 < 1 / id2 ? 1 : -1;
    });

    return sorted;
  };

  const getAccounts = () => {
    if (typeof accounts !== "object") return [];
    return accounts.filter(
      (acc) => acc.name !== "Basket" && acc.name !== "All"
    );
  };

  const getAccountByName = (acc_name) => {
    if (typeof accounts !== "object") return [];
    return accounts.find((acc) => acc.name === acc_name);
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
              {
                name: "All",
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
        setPosList(Object.assign(posList, { [accPos.account]: accPos }));
        break;
      case EVENTS.ON_ORDERLIST:
        var accOrders = JSON.parse(message);
        setOrderList(
          Object.assign(orderList, { [accOrders.account]: accOrders })
        );
        break;
      case EVENTS.ON_ORDER_RESPONSE:
        var response = JSON.parse(message);

        if (response.success) {
          openNotification(
            "Order",
            `Order Response from ${response.account}`,
            response.message
          );
        } else {
          openNotification(
            "Error",
            `Order Response from ${response.account}`,
            response.message
          );
        }
        break;
      default:
    }
  };

  const parseOrderList = () => {
    if (curAccount !== "Basket" && curAccount !== "All")
      return orderList[curAccount].orders;

    var orders = [];

    Object.keys(orderList).forEach((account) => {
      if (
        orderList[account].orders.length > 0 &&
        (getAccountByName(account)?.basket || curAccount === "All")
      )
        orders = orders.concat(orderList[account].orders);
    });
    return orders;
  };

  const parsePosList = () => {
    if (curAccount !== "Basket" && curAccount !== "All") {
      return posList[curAccount] ? posList[curAccount].positions : [];
    }

    var positions = [];
    Object.keys(posList).forEach((account) => {
      if (
        posList[account].positions?.length > 0 &&
        (getAccountByName(account)?.basket || curAccount === "All")
      )
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
        var account = {
          name: values.broker + values.number,
          basket: values.basket === undefined ? false : values.basket,
          default: values.default === undefined ? 1 : values.default,
          ...values,
        };
        setAccounts([...accounts, account]);
        openNotification("Notice", "Created new account");
        return;
      } else {
        openNotification("Error", "Failed to create new account.", res.error);
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
    const account = getAccountByName(accname);

    if (
      account === undefined ||
      account.name === "Basket" ||
      account.name === "All"
    )
      return;
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
        openNotification("Notice", sMsg);
      }
    });
  };

  const extraAction = (
    <div>
      <label>Notification </label>
      <Switch checkedChildren="ON" unCheckedChildren="OFF" defaultChecked={enableNotify} onChange={
        (e) => {
          enableNotify = e;
          if (enableNotify === false) localStorage.removeItem("enableNotify");
          else localStorage.setItem("enableNotify", true);
        }
      }
      />
      
      <Button
        size={"default"}
        danger
        type="text"
        onClick={() => {
          Logout();
        }}
      >
        ログアウト
      </Button>
    </div>
  );

  let locale = {
    emptyText: <span className="table-empty-message">ございません</span>,
  };

  const openNotification = (type, title, content) => {
    console.log(enableNotify);
    if (enableNotify !== true) return;
    if (type === "Error") {
      notification.error({
        message: title,
        description: content,
        duration: waiting_time,
        placement: "bottomRight",
      });
    } else {
      notification.open({
        message: title,
        description: content,
        duration: waiting_time,
        placement: "bottomRight",
      });
    }

    addLog(
      type,
      (title ? title.replace("Order Response from", "") : "") +
      " " +
      (content ? content : "")
    );
  };

  const addLog = (type, content) => {
    const now = new Date();
    content = dateFormat(now, "hh:MM:ss") + " >\t" + content;

    setlogHistory((prevState) => {
      return [{ type: type, content: content }, ...prevState];
    });
  };

  return (
    <div className="traindg-home-page">
      <Tabs
        onChange={updateAccountOrPriceFeed}
        type="card"
        size="small"
        tabBarExtraContent={extraAction}
      >
        <TabPane tab="トレード" key="home">
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
            {getSymbols().length > 0 && (
              <Col>
                {
                  <TradingCard
                    symbols={getSymbols(rates)}
                    rates={rates}
                    broker={curBroker}
                    posInfo={parsePosList()}
                    reqOrder={(order) => reqOrder(order)}
                    index={0}
                  />
                }
              </Col>
            )}

            {sm && (
              <>
                {getSymbols().length > 1 && (
                  <Col>
                    {
                      <TradingCard
                        symbols={getSymbols(rates)}
                        rates={rates}
                        broker={curBroker}
                        posInfo={parsePosList()}
                        reqOrder={(order) => reqOrder(order)}
                        index={1}
                      />
                    }
                  </Col>
                )}
              </>
            )}
            {md && (
              <>
                {getSymbols().length > 2 && (
                  <Col>
                    {
                      <TradingCard
                        symbols={getSymbols(rates)}
                        rates={rates}
                        broker={curBroker}
                        posInfo={parsePosList()}
                        reqOrder={(order) => reqOrder(order)}
                        index={2}
                      />
                    }
                  </Col>
                )}
              </>
            )}
            {lg && (
              <>
                {getSymbols().length > 3 && (
                  <Col>
                    {
                      <TradingCard
                        symbols={getSymbols(rates)}
                        rates={rates}
                        broker={curBroker}
                        posInfo={parsePosList()}
                        reqOrder={(order) => reqOrder(order)}
                        index={3}
                      />
                    }
                  </Col>
                )}
              </>
            )}
            {xl && (
              <>
                {getSymbols().length > 4 && (
                  <Col>
                    {
                      <TradingCard
                        symbols={getSymbols(rates)}
                        rates={rates}
                        broker={curBroker}
                        posInfo={parsePosList()}
                        reqOrder={(order) => reqOrder(order)}
                        index={4}
                      />
                    }
                  </Col>
                )}
              </>
            )}
            {xxl && (
              <>
                {getSymbols().length > 5 && (
                  <Col>
                    {
                      <TradingCard
                        symbols={getSymbols(rates)}
                        rates={rates}
                        broker={curBroker}
                        posInfo={parsePosList()}
                        reqOrder={(order) => reqOrder(order)}
                        index={5}
                      />
                    }
                  </Col>
                )}
                {getSymbols().length > 6 && (
                  <Col>
                    {
                      <TradingCard
                        symbols={getSymbols(rates)}
                        rates={rates}
                        broker={curBroker}
                        posInfo={parsePosList()}
                        reqOrder={(order) => reqOrder(order)}
                        index={6}
                      />
                    }
                  </Col>
                )}
                {getSymbols().length > 7 && (
                  <Col>
                    {
                      <TradingCard
                        symbols={getSymbols(rates)}
                        rates={rates}
                        broker={curBroker}
                        posInfo={parsePosList()}
                        reqOrder={(order) => reqOrder(order)}
                        index={7}
                      />
                    }
                  </Col>
                )}
              </>
            )}
          </Row>
          <div className="trading-net-info">
            <div>
              <div className="trading-table-wrapper">
                <PositionTable
                  positions={parsePosList()}
                  onClickCloseOne={(symbol, account) => {
                    if (
                      parsePosList() === undefined ||
                      parsePosList().length < 1
                    ) {
                      message.error("対象の建玉はございません");
                      return;
                    }
                    openNotification(
                      "Request",
                      "Close Position",
                      "Request to close positions of " + symbol,
                    );
                    requestOrderApi({
                      Account: account,
                      Mode: "ORDER_CLOSE_ALL",
                      Symbol: symbol,
                    });
                  }}
                  onClickCloseAll={() => {
                    if (
                      parsePosList() === undefined ||
                      parsePosList().length < 1
                    ) {
                      message.error("対象の建玉はございません");
                      return;
                    }
                    openNotification(
                      "Request",
                      "Close All",
                      "Request to close all positions."
                    );
                    requestOrderApi({
                      Account: curAccount === "All" ? "All" : "Basket",
                      Mode: "ORDER_CLOSE_ALL",
                      Symbol: "ALL",
                    });
                  }}
                />
              </div>
              <div className="trading-table-wrapper">
                <OrderTable
                  orders={parseOrderList()}
                  reqDelOrder={(acc, ticket) => {
                    requestOrderApi({
                      Account: acc,
                      Mode: "ORDER_DELETE",
                      Symbol: ticket,
                    });
                  }}
                  onClickOrderCloseAll={() => {
                    openNotification(
                      "Request",
                      "Close All Pending Orders",
                      "Request to close all pending orders."
                    );
                    requestOrderApi({
                      Account: curAccount === "All" ? "All" : "Basket",
                      Mode: "ORDER_DELETE_ALL",
                      Symbol: "ALL",
                    });
                  }}
                />
              </div>
            </div>
            <div className="trading-table-wrapper account-setting-table-log-history">
              <AccountSettingTable
                accounts={getAccounts()}
                callback={({ accname, basket, defaultLots }) =>
                  onHandleAccSetting(accname, basket, defaultLots)
                }
              />
              <Row>

              </Row>

            </div>
          </div>
        </TabPane>
        <TabPane tab="設定" key="setting">
          <Row><div className="settings-wrapper">
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
                    口座追加
                  </Button>
                </Form.Item>
              </Form>
            </div>
            <div className="account-list-wrapper">
              <Table
                bordered
                title={() => "口座リスト"}
                pagination={false}
                dataSource={getAccounts()}
                columns={acc_columns}
                locale={locale}
              />
            </div>

          </div>
          </Row>
          <div className="log-history-row-wrapper">
            <Row>
              <Col span={20}>
                <Divider orientation="left">取引日誌</Divider>
              </Col>
              <Col span={4} className="delete-log-history-button">
                <Popconfirm
                  title="ログをクリアしてもよろしいですか"
                  onConfirm={() => {
                    setlogHistory([]);
                  }}
                  okText="はい"
                  cancelText="番号"
                >
                  <Button danger type="text">
                    ログ削除
                    </Button>
                </Popconfirm>
              </Col>
              </Row>
            <Row>
              <Col span={24}>
                <div className="log-history-time-line scrollable-container">
                  <List
                    bordered
                    size="small"
                    dataSource={logHistory}
                    renderItem={(item) => (
                      <List.Item>
                        <Row>
                          <Col span={2}>
                            {item.type === "Request" && (
                              <Typography.Text type="secondary">
                                [リクエスト]
                              </Typography.Text>
                            )}
                            {item.type === "Order" && (
                              <Typography.Text mark>
                                [取引]
                              </Typography.Text>
                            )}
                            {item.type === "Notice" && (
                              <Typography.Text type="success">
                                [通知]
                              </Typography.Text>
                            )}
                            {item.type === "Error" && (
                              <Typography.Text type="danger">
                                [エラー]
                              </Typography.Text>
                            )}
                          </Col>
                          <Col span={22}>{item.content}</Col>
                        </Row>
                      </List.Item>
                    )}
                  ></List>
                </div>
              </Col>
            </Row>

          </div>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default TradingPage;
