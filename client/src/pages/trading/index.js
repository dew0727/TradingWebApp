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
  Spin,
  Modal,
} from "antd";
import CarouselComponent from "../../components/Carousel";
import { CloseOutlined, LoadingOutlined } from "@ant-design/icons";
import createSocket from "../../socket";
import { TradingCard } from "../../components";
import "./style.css";
import TradingMenu from "../../components/TradingMenu";
import PositionTable from "../../components/PositionList";
import OrderTable from "../../components/OrderTable";
import AccountSettingTable from "../../components/AccountSettingTable";
import InputBox from "../../components/InputBox";
import { EVENTS } from "../../config-client";
import { apiCall, Logout, getAuth, getCredential } from "../../utils/api";

import { useApp } from "../../context";

const dateFormat = require("dateformat");

const { TabPane } = Tabs;

var brokers = ["GP", "YJFX", "SAXO", "FXGBM"];
const SymbolDictionary = [
  "EURUSD",
  "USDJPY",
  "GBPUSD",
  "GBPJPY",
  "EURJPY",
  "AUDJPY",
  "AUDUSD",
];

const waiting_time = 5;
let enableNotify = localStorage.getItem("enableNotify") ? true : false;
var isTrader = true;
var email = "none";
var masterAccounts = {};
var lastResponse = "";
var isAllowUpdate = true;

const TradingPage = () => {
  const [appState] = useApp();
  const { server_status, setServerStatus, playSound } = appState;

  const [curBroker, setcurBroker] = useState("");
  const [curAccount, setCurAccount] = useState("Basket");
  const [maxDefaultLots, setMaxDefautLots] = useState(100);
  const [retryCount, setRetryCount] = useState(5);
  const [waitingTime, setWaitingTime] = useState(0);
  const [curPriceFeed, setCurPriceFeed] = useState("");
  const xs = Grid.useBreakpoint()?.xs;
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
  ]);

  const [posList, setPosList] = useState({});
  const [orderList, setOrderList] = useState({});
  const [rates, setRates] = useState({});
  const [symbolCount, setSymbolCount] = useState(0);
  const [symbolList, setSymbolList] = useState([]);
  const [logHistory, setlogHistory] = useState([]);

  const [isOpenModal, setIsOpenModal] = useState(false);

  useEffect(() => {
    setSymbolCount(getSymbols(rates).length);
  }, [rates]);

  useEffect(() => {
    setSymbolList(getSymbols(rates));
  }, [symbolCount]);

  const acc_columns = [
    {
      title: "口座",
      dataIndex: "name",
      align: "left",
    },

    {
      title: "Max Pos Size",
      className: "column-max-pos",
      dataIndex: "maxSize",
      align: "left",
      render: (text, record) => {
        return (
          <InputBox
            key={"max-pos-size" + record.name}
            value={text}
            step={100}
            min={0}
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            onChange={(val) => {
              onHandleAccSetting({
                accname: record.name,
                type: "maxSize",
                value: val,
              });
            }}
          />
        );
      },
    },
    {
      title: "Delay(ms)",
      className: "column-order-delay",
      dataIndex: "orderDelay",
      align: "left",
      key: "column-order-delay",
      render: (text, record) => {
        return (
          <InputBox
            className="input-box-item"
            key={"order-delay-" + record.name}
            value={text}
            step={10}
            min={0}
            onChange={(val) => {
              onHandleAccSetting({
                accname: record.name,
                type: "orderDelay",
                value: val,
              });
            }}
          />
        );
      },
    },
    {
      title: "Alias",
      className: "column-account-alias",
      dataIndex: "alias",
      align: "left",
      key: "alias",
      render: (text, record) => {
        return (
          <InputBox
            type="text"
            value={text}
            onChange={(val) => {
              onHandleAccSetting({
                accname: record.name,
                type: "alias",
                value: val,
              });
            }}
          />
        );
      },
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
    if (!isTrader && !masterAccounts.hasOwnProperty(account.name)) {
      //console.log("Remove account. Master can only access master accounts");
      return;
    }

    apiCall(
      "/api/delete-account",
      { account: account.name },
      "POST",
      (res, user, pass) => {
        if (res.success === true) {
          setAccounts(getAccounts().filter((acc) => acc.name !== account.name));
          openNotification("Notice", "", "Removed Account " + account.name);
        }
      }
    );
  };

  const requestOrderApi = (reqMsg) => {
    if (!isTrader && !masterAccounts.hasOwnProperty(reqMsg.Account)) {
      //console.log("Request Order. Master can only access master accounts");
      //return;
    }

    playSound("REQUEST_ORDER");

    setServerStatus("BUSY");
    setIsOpenModal(true);
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
    if (server_status === "BUSY") {
      playSound("NOTIFY");
      message.error("Server is processing orders now.");
      return;
    }

    const orderMsg = {
      ...order,
      Account: curAccount,
    };

    if (order.Mode === "ORDER_CLOSE_ALL") {
      if (parsePosList() === undefined || parsePosList().length < 1) {
        playSound("NOTIFY");
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
    if (topic === EVENTS.ON_USER_LOGIN) {
      const login = JSON.parse(message);
      console.log("login event", login);
      if (login.email && email === login.email) {
        window.location.href = "/";
      }
    }

    if (topic === EVENTS.ON_ORDER_COMPLETE) {
      console.log("Order finished account: ", message);
      if (message === "IDLE") setServerStatus("IDLE");
      return;
    }

    if (isAllowUpdate) {
      switch (topic) {
        case EVENTS.ON_GLOBAL_SETTINGS:
          const globals = JSON.parse(message);
          console.log("event global settings", message);
          ApplyGlobalSettings(globals);
          break;
        case EVENTS.ON_USER_SETTINGS:
          const settings = JSON.parse(message);
          if (email in settings) {
            const setting = settings[email];
            const val = parseFloat(setting.maxDefault);
            console.log(val);
            !isNaN(val) && setting.maxDefault && setMaxDefautLots(val);
          }

          break;
        case EVENTS.ON_RATE:
          var rates = JSON.parse(message);

          setRates(rates);
          break;
        case EVENTS.ON_STATUS:
          const account_status = JSON.parse(message);

          setAccounts((prevState) => {
            return prevState.map((acc) => {
              if (acc.name in account_status) {
                acc.status = account_status[acc.name];
                if (acc.status?.status === false) {
                  openNotification(
                    "error",
                    "アカウントエラー!",
                    `${acc.name} 死んでいる`,
                    true,
                    acc.name
                  );
                } else {
                  notification.close(acc.name);
                }
              }
              return acc;
            });
          });

          break;
        case EVENTS.ON_ACCOUNT:
          var account = JSON.parse(message);

          if (account.master) {
            masterAccounts[account.name] = true;
            if (isTrader) {
              //console.log("Account stopped by user role", masterAccounts);
              return;
            }
          }

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

          if (
            isTrader === true &&
            masterAccounts.hasOwnProperty(accPos.account)
          ) {
            //console.log("Position list stopped by role");
            return;
          }

          setPosList(Object.assign(posList, { [accPos.account]: accPos }));
          break;
        case EVENTS.ON_ORDERLIST:
          var accOrders = JSON.parse(message);

          if (
            isTrader === true &&
            masterAccounts.hasOwnProperty(accOrders.account)
          ) {
            //console.log("Order list stopped by role");
            return;
          }

          setOrderList(
            Object.assign(orderList, { [accOrders.account]: accOrders })
          );
          break;
        case EVENTS.ON_ORDER_RESPONSE:
          if (lastResponse === message) return;
          lastResponse = message;

          var response = JSON.parse(message);
          console.log(response);
          if (
            isTrader === true &&
            masterAccounts.hasOwnProperty(response.account)
          ) {
            //console.log("Order response stopped by role");
            return;
          }

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
    const auth = getAuth();
    isTrader = auth.role === "master" ? false : true;
    email = getCredential(true)?.user;
    console.log({ email });
    brokers = isTrader
      ? ["GP", "YJFX", "SAXO"]
      : ["GP", "YJFX", "SAXO", "FXGBM"];
    createSocket(parseData, auth.token);
    getGlobalSettings();
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
      if (!isTrader) {
        //console.log("Price-Feed. Master can access only master accounts");
        return;
      }
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

  const getGlobalSettings = () => {
    apiCall("/api/get-global-setting", {}, "POST", (res) => {
      if (res.success === true) {
        const globals = JSON.parse(res.data);
        console.log("retrieved global settings: ", globals);
        ApplyGlobalSettings(globals);
      }
    });
  };

  const ApplyGlobalSettings = (settings) => {
    if (settings["maxDefault"]) {
      const val = parseFloat(settings.maxDefault);
      setMaxDefautLots(val);
    }
    if (settings["retryCount"]) {
      const val = parseInt(settings.retryCount);
      setRetryCount(val);
    }
    if (settings["waitingTime"]) {
      const val = parseInt(settings.waitingTime);
      setWaitingTime(val);
    }
    if (settings.feed) {
      setCurPriceFeed(settings.feed);
    }
  };

  const getAccountSettings = (user) => {
    apiCall("/api/get-user-setting", {}, "POST", (res) => {
      if (res.success === true) {
        console.log("retrieved user settings: ", res.data);
        const settings = JSON.parse(res.data);
        if (email in settings) {
          const setting = settings[email];
          const val = parseFloat(setting.maxDefault);
          console.log(val);
          !isNaN(val) && setting.maxDefault && setMaxDefautLots(val);
        }
      }
    });
  };

  const onChangeGlobalSettings = (settings) => {
    playSound("UPDATE_SETTING");
    apiCall(
      "/api/update-global-setting",
      { settings },
      "POST",
      (res, user, pass) => {
        if (res.success === true) {
          console.log("update global settings");
          ApplyGlobalSettings(res.data);
        }
      }
    );
  };

  const onHandleAccSetting = ({ accname, type, value }) => {
    playSound("UPDATE_SETTING");
    if (accname === undefined) return;
    const account = getAccountByName(accname);

    if (
      account === undefined ||
      account.name === "Basket" ||
      account.name === "All"
    )
      return;

    let sMsg = `${account.name} `;

    switch (type) {
      case "basket": {
        account.basket = value;
        sMsg += " basket turned " + (value ? "on" : "off");
        break;
      }
      case "defaultLots": {
        account.default = value;
        sMsg += ` default value is ${value}`;
        break;
      }
      case "orderDelay": {
        account.orderDelay = value;
        sMsg += ` orderDelay value set as ${value}`;
        break;
      }
      case "alias": {
        account.alias = value;
        sMsg += ` alias name is set ${value}`;
        break;
      }
      case "maxSize": {
        account.maxSize = value;
        sMsg += ` max size is ${value}`;
        break;
      }
      default:
    }

    if (!isTrader && !masterAccounts.hasOwnProperty(account.name)) {
      //console.log("Master can only access master accounts");
      return;
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
      <Switch
        checkedChildren="ON"
        unCheckedChildren="OFF"
        defaultChecked={enableNotify}
        onChange={(e) => {
          enableNotify = e;
          if (enableNotify === false) localStorage.removeItem("enableNotify");
          else localStorage.setItem("enableNotify", true);
        }}
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

  const openNotification = (
    type,
    title,
    content,
    needConfirm = false,
    modalKey = null
  ) => {
    if (needConfirm) {
      const key = modalKey;
      const btn = (
        <Button
          type="primary"
          size="small"
          onClick={() => notification.close(key)}
        >
          Close
        </Button>
      );
      notification[type]({
        message: title,
        description: content,
        btn,
        key,
        duration: 0,
      });
    } else {
      addLog(
        type,
        (title ? title.replace("Order Response from", "") : "") +
        " " +
        (content ? content : "")
      );
      if (enableNotify !== true) return;
      playSound("NOTIFY");
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
    }
  };

  const addLog = (type, content) => {
    const now = new Date();
    content = dateFormat(now, "hh:MM:ss") + " >\t" + content;

    setlogHistory((prevState) => {
      return [{ type: type, content: content }, ...prevState];
    });
  };

  const onHandleTouchStart = (e) => {
    console.log("touch start");
    isAllowUpdate = false;
  };

  const onHandleTouchEnd = (e) => {
    console.log("touch end");
    isAllowUpdate = true;
  };

  return (
    <div className="traindg-home-page">
      <Modal
        centered
        visible={isOpenModal && server_status === "BUSY"}
        footer={[
          <Button danger onClick={() => setIsOpenModal(false)}>
            閉じる
          </Button>,
        ]}
      >
        <Spin
          size="large"
          tip="注文は処理中です..."
          style={{ width: "100%" }}
        />
      </Modal>
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
              defaultFeed={curPriceFeed}
            />
          </div>
          {server_status === "BUSY" && (
            <Spin
              tip="注文は処理中です..."
              style={{ width: "100%" }}
              indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
            />
          )}
          {xs ? (
            <CarouselComponent
              className="card-swiper-wrapper"
              onHandleTouchStart={onHandleTouchStart}
              onHandleTouchEnd={onHandleTouchEnd}
              symbolList={symbolList}
              rates={rates}
              broker={curBroker}
              posInfo={parsePosList()}
              reqOrder={reqOrder}
              isMobile
            />
          ) : (
            <>
              <Row
                className="site-card-wrapper trading-cards-wrapper"
                gutter={[16, 16]}
              >
                {symbolList.length > 0 && (
                  <Col>
                    {
                      <TradingCard
                        symbols={symbolList}
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
                    {symbolList.length > 1 && (
                      <Col>
                        {
                          <TradingCard
                            symbols={symbolList}
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
                    {symbolList.length > 2 && (
                      <Col>
                        {
                          <TradingCard
                            symbols={symbolList}
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
                    {symbolList.length > 3 && (
                      <Col>
                        {
                          <TradingCard
                            symbols={symbolList}
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
                    {symbolList.length > 4 && (
                      <Col>
                        {
                          <TradingCard
                            symbols={symbolList}
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
                    {symbolList.length > 5 && (
                      <Col>
                        {
                          <TradingCard
                            symbols={symbolList}
                            rates={rates}
                            broker={curBroker}
                            posInfo={parsePosList()}
                            reqOrder={(order) => reqOrder(order)}
                            index={5}
                          />
                        }
                      </Col>
                    )}
                    {symbolList.length > 6 && (
                      <Col>
                        {
                          <TradingCard
                            symbols={symbolList}
                            rates={rates}
                            broker={curBroker}
                            posInfo={parsePosList()}
                            reqOrder={(order) => reqOrder(order)}
                            index={6}
                          />
                        }
                      </Col>
                    )}
                    {/* {symbolList.length > 7 && (
                      <Col>
                        {
                          <TradingCard
                            symbols={symbolList}
                            rates={rates}
                            broker={curBroker}
                            posInfo={parsePosList()}
                            reqOrder={(order) => reqOrder(order)}
                            index={7}
                          />
                        }
                      </Col>
                    )} */}
                  </>
                )}
              </Row>
            </>
          )}

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
                      playSound("NOTIFY");
                      message.error("対象の建玉はございません");
                      return;
                    }
                    openNotification(
                      "Request",
                      "Close Position",
                      "Request to close positions of " + symbol
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
                      playSound("NOTIFY");
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
                  reqDelOrder={(acc, ticket, symbol) => {
                    requestOrderApi({
                      Account: acc,
                      Mode: "ORDER_DELETE",
                      Symbol: symbol,
                      Ticket: ticket,
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
                callback={onHandleAccSetting}
                maxLots={maxDefaultLots}
                {...{ onChangeGlobalSettings }}
              />
              <Row></Row>
            </div>
          </div>
        </TabPane>
        <TabPane tab="設定" key="setting">
          <Row>
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
                  <Form.Item label="Account Alias" name="alias">
                    <Input placeholder="Account Alias" />
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
                <Row justify="center">
                  <div style={{ margin: "10px" }}>
                    <label>Retry Count: </label>
                    <InputBox
                      className="account-settings-default-lots-input"
                      value={retryCount}
                      step={1}
                      min={1}
                      onChange={(v) => {
                        onChangeGlobalSettings &&
                          onChangeGlobalSettings({ retryCount: v });
                      }}
                      size="middle"
                    />
                  </div>
                  <div style={{ margin: "10px" }}>
                    <label>Wait Time: </label>
                    <InputBox
                      className="account-settings-default-lots-input"
                      value={waitingTime}
                      step={10}
                      min={0}
                      size="middle"
                      onChange={(v) => {
                        onChangeGlobalSettings &&
                          onChangeGlobalSettings({ waitingTime: v });
                      }}
                    />
                    <span>ms</span>
                  </div>
                </Row>
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
                              <Typography.Text mark>[取引]</Typography.Text>
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
