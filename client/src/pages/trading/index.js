import React, { useEffect, useState } from "react";
import { Row, Col, Tabs, Form, Input, Button, Select, Table } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import createSocket from "../../socket";
import { TradingCard } from "../../components";
import "./style.css";
import TradingMenu from "../../components/TradingMenu";
import PositionTable from "../../components/PositionList";
import OrderTable from "../../components/OrderTable";
import AccountSettingTable from "../../components/AccountSettingTable";


const { TabPane } = Tabs;

const TradingPage = () => {
  const [priceInfo, setPriceInfo] = useState({
    price: "",
    value: "",
  });

  const [account_list, setAccountList] = useState([
    {
      broker: "GP",
      accNum: 4444,
      login: "3333",
      password: "password123",
    },
    {
      broker: "GP",
      accNum: 555,
      login: "55555",
      password: "password123",
    },
    {
      broker: "YJFX",
      accNum: 222,
      login: "666",
      password: "password123",
    },
  ]);

  useEffect(() => {
    createSocket(parseData);
  }, []);

  const parseData = (info) => {
    // Parse info
    console.log("INFO - ", info);

    setPriceInfo({
      price: info,
    });
  };

  const onHandleRemoveAccount = (index) => {
    let acc_list = [...account_list];
    acc_list.splice(index, 1);
    setAccountList(acc_list);
  };

  const onFinish = (values) => {
    console.log(values);
    const new_acc = {
      broker: values.broker,
      accNum: values.accNum,
      login: values.login,
      password: values.password,
    };

    let acc_list = [...account_list];
    acc_list.push(new_acc);
    setAccountList(acc_list);
  };

  function callback(key) {
    console.log(key);
  }

  const symbols = [
    "EURUSD",
    "GBPUSD",
    "USDCNH",
    "USDJPY",
    "EURJPY",
    "AUDJPY",
    "EURGBP",
    "AUDUSD",
  ];

  const brokers = ["GP", "YJFX", "Saxo"];
  const accounts = ["GP45643", "YJFX2134", "Basket"];
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
            <TradingMenu brokers={brokers} accounts={accounts} />
          </div>
          <Row className="site-card-wrapper trading-cards-wrapper" gutter={[16, 16]}>
            {symbols.map((item) => (
              <Col>
                <TradingCard symbols={symbols} sym={item} />
              </Col>
            ))}
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
                    {brokers.map((item) => {
                      return <Select.Option value={item}>{item}</Select.Option>;
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
                dataSource={account_list}
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
