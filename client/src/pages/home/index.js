import React from "react";
import { Form, Input, Button, Checkbox, Row, Col } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";

import "./style.css";
import { apiCall } from '../../utils/api';

const authenticate = (res) => {
    console.log("authenticate: " + res.auth);
    if (res.auth !== undefined && res.auth === true)
        localStorage.setItem("authToken", res.token);
    else
        localStorage.removeItem('authToken');
}

const HomePage = () => {
  const onFinish = (values) => {
    console.log("Received values of form: ", values);
    apiCall('/api/login', values, 'POST', authenticate);
  };

  return (
    <Row className="form-container" justify="center" align="middle">
      <Col sm={{ span: 18 }} md={{ span: 12 }} lg={{ span: 6 }}>
        <Form
          className="login-form"
          initialValues={{ remember: true }}
          onFinish={onFinish}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: "Please input your Username!" }]}
          >
            <Input
              prefix={<UserOutlined className="site-form-item-icon" />}
              placeholder="Username"
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: "Please input your Password!" }]}
          >
            <Input
              prefix={<LockOutlined className="site-form-item-icon" />}
              type="password"
              placeholder="Password"
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="login-form-button"
            >
              Log in
            </Button>
          </Form.Item>
        </Form>
      </Col>
    </Row>
  );
};

export default HomePage;
