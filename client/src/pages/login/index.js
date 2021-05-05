import React, { useEffect, useState, useRef } from "react";
import { Form, Input, Button, Row, Col, message, Checkbox } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { Redirect } from "react-router-dom";

import "./style.css";
import {
  apiCall,
  authenticate,
  removeAuth,
  rememberState,
  setRememberState,
  getCredential,
  saveCredential,
} from "../../utils/api";

const Login = () => {
  const [auth, setAuth] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const formRef = useRef(null);

  useEffect(() => {
    setRememberMe(rememberState());
    if (rememberMe) {
      const cred = getCredential();
      formRef.current.setFieldsValue({
        username: cred.user,
        password: cred.pwd,
      });
    }
  }, []);

  const onFinish = (values) => {
    Object.assign(values, { login: true });
    saveCredential({ usr: values.username, pwd: values.password });

    apiCall("/api/login", values, "POST", (res) => {
      console.log(res);
      if (authenticate(res) === false) {
        message.error(
          "認証に失敗しました。ユーザーID(またはログイン名)とパスワードを正しく入力してください。"
        );
      } else {
        setAuth(true);
      }
    });
  };

  if (auth === true) {
    return <Redirect to={{ pathname: "/trading" }} />;
  }

  const onChangeRememberMe = (checked) => {
    setRememberState(checked);
    setRememberMe(checked);
    if (!checked) {
      removeAuth();
    }
  };

  return (
    <Row className="form-container" justify="center" align="middle">
      <Col sm={{ span: 18 }} md={{ span: 12 }} lg={{ span: 6 }}>
        <Form ref={formRef} className="login-form" onFinish={onFinish}>
          <Form.Item
            name="username"
            rules={[{ message: "Please input your Username!" }]}
          >
            <Input
              prefix={<UserOutlined className="site-form-item-icon" />}
              placeholder="Username"
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ message: "Please input your Password!" }]}
          >
            <Input
              prefix={<LockOutlined className="site-form-item-icon" />}
              type="password"
              placeholder="Password"
            />
          </Form.Item>
          <Checkbox
            checked={rememberMe}
            onChange={(e) => onChangeRememberMe(e.target.checked)}
            style={{ margin: "10px" }}
          >
            Remember me
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
