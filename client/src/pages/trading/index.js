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
import { Account } from "../../utils/datatypes";

const { TabPane } = Tabs;

const TradingPage = () => {
  const [curBroker, setcurBroker] = useState("GPM2192267");
  const [curAccount, setcurAccount] = useState(null);
  const [accountList, setAccountList] = useState([]);
  const [RateStore, setRateStore] = useState({});
  const [rateInfo, setRateInfo] = useState({});
  const [accountNames, setAccountNames] = useState([
    "Basket",
    "GPM2206812",
    "GPM2192267",
  ]);
  const [symbolList, setSymbolList] = useState([
    "EURUSD",
    "GBPUSD",
    "USDCNH",
    "USDJPY",
    "EURJPY",
    "AUDJPY",
    "EURGBP",
    "AUDUSD",
  ]);

  const updateRateStore = (rateInfo) => {
    /* let newRateStore = RateStore;
    console.log('RATE INFO - ', rateInfo, RateStore)
    for (const key in rateInfo) {
      newRateStore = {
        ...newRateStore,
        [key]: rateInfo[key]
      };
    }
    console.log('NEW RATE STORE - ', newRateStore)
    Object.keys(rateInfo).forEach(key => {
      newRateStore = {...newRateStore, [key]: rateInfo[key]}
    })
    console.log('NEW RATE STORE - ', newRateStore)*/
    const rateData = { ...RateStore, ...rateInfo };
    console.log("RATE DATA - ", rateData);
    setRateStore(rateData);
  };

  const updateSymbolList = (symbols) => {
    symbols.forEach((sym) => {
      if (!symbolList.includes(sym)) {
        if (typeof symbolList == typeof []) {
          symbolList.push(sym);
          setSymbolList([...symbolList]);
        }
      }
    });
  };

  const parseData = (topic, {rateInfo, symbols}) => {
    if (topic === "RATE") {
      setRateInfo(rateInfo);
    }
  }

  useEffect(() => {
    createSocket(parseData);
  }, []);

  useEffect(() => {
    setRateStore(prevState => ({...prevState, ...rateInfo}));
  }, [ rateInfo]);

  const onHandleRemoveAccount = (index) => {
    accountList.splice(index, 1);
    setAccountList(...accountList);
  };

  const onFinish = (values) => {
    const new_acc = new Account(values.broker + values.accNum);
    new_acc.login = values.login;
    new_acc.password = values.password;
    accountList.push(new_acc);
    setAccountList(...accountList);
  };

  function callback(key) {
    console.log(key);
  }

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
      dataIndex: "accNum",
      align: "right",
    },
    {
      title: "Delete",
      className: "account_delete",
      align: "center",
      render: (text, record, index) => (
        <Button
          type="primary"
          danger
          icon={<CloseOutlined />}
          onClick={() => {
            onHandleRemoveAccount(index);
          }}
        />
      ),
    },
  ];

  return (
    <div className="traindg-home-page">
      <Tabs onChange={callback} type="card" size="small">
        <TabPane tab="Home" key="home">
          <div className="broker-selection-menu">
            <TradingMenu
              brokers={accountNames}
              accounts={accountNames}
              callback={({ selectedAccount, selectedBroker }) => {
                selectedBroker
                  ? setcurBroker(selectedBroker)
                  : selectedAccount
                  ? setcurAccount(selectedAccount)
                  : console.log();
              }}
            />
          </div>
          <Row
            className="site-card-wrapper trading-cards-wrapper"
            gutter={[16, 16]}
          >
            <Col>
              {<TradingCard
                symInfo={symbolList}
                rateInfo={RateStore}
                broker={curBroker}
              />}
            </Col>
          </Row>
          <div className="trading-net-info">
            <div>
              <div className="trading-table-wrapper">
                <PositionTable />
              </div>
              <div className="trading-table-wrapper">
                <OrderTable />
              </div>
            </div>
            <div className="trading-table-wrapper">
              <AccountSettingTable />
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
                  name="accNum"
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
                  name="login"
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
