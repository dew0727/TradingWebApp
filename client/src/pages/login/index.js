import React, { useEffect, useState } from "react";
import { Form, Input, Button, Row, Col, message, Checkbox } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { Redirect } from "react-router-dom";

import "./style.css";
import { apiCall, authenticate, removeAuth, rememberState, setRememberState } from "../../utils/api";


const Login = () => {
  const [auth, setAuth] = useState(false);
  const [rememberMe, setRememberMe] = useState(true)
 
  useEffect(() => {
    setRememberMe(rememberState());
    apiCall(
      "/api/login",
      { },
      "POST",
      (res) => {
        if (authenticate(res) === true)
          setAuth(true);
      }
    );
  }, []);

  const onFinish = (values) => {
    Object.assign(values, {login: true});
    
    apiCall("/api/login", values, "POST", (res) => {
      console.log(res);
      if (authenticate(res) === false) {
        message.error("認証に失敗しました。ユーザーID(またはログイン名)とパスワードを正しく入力してください。");
      } else {
        setAuth(true);
      }
    });
  };

  if (auth === true) {
    return <Redirect to={{ pathname: "/trading" }} />;
  }

  const onChangeRememberMe = (checked) => {
    console.log(checked)
    setRememberState(checked)
    setRememberMe(checked)
    if (!checked){
      removeAuth();
    }
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
          <Checkbox checked={rememberMe} onChange={(e) => onChangeRememberMe(e.target.checked)}>
              Keep me logged in
            </Checkbox>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="login-form-button"
            >
              ログインする
            </Button>
          </Form.Item>
        </Form>
      </Col>
    </Row>
  );
};

export default Login;
