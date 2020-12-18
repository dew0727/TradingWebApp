import React, { useEffect, useState } from "react";
import { Form, Input, Button, Row, Col } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { Redirect } from "react-router-dom";

import "./style.css";
import { apiCall } from "../../utils/api";

const Login = () => {
  const [auth, setAuth] = useState({
    auth: '',
  });

  // useEffect(() => {
  //   const user = localStorage.getItem("username");
  //   const pass = localStorage.getItem("password");
  //   const token = localStorage.getItem("authToken");

  //   if (token === undefined) {
  //     if (user !== undefined && pass !== undefined)
  //     apiCall(
  //       "/api/login",
  //       { username: user, password: pass },
  //       "POST",
  //       (res) => {
  //         if (res === true)
  //           setAuth({
  //             auth: localStorage.getItem("authToken"),
  //           });
  //       }
  //     );
  //   }
  // }, []);

  const onFinish = (values) => {
    apiCall("/api/login", values, "POST", (res, user, pass) => {
      if (res === true) {
        setAuth({
          auth: localStorage.getItem("authToken"),
        });
      }
    });
  };

  if (auth.auth !== "") {
    return <Redirect to={{ pathname: "/trading" }} />;
  }

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

export default Login;
