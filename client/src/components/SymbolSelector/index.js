import React, { useState } from "react";
import { Menu, Dropdown, Button } from "antd";
import { DownOutlined } from "@ant-design/icons";

const SymbolSelector = ({ symbols, sym, callback }) => {
  const [symbol, setSym] = useState(sym);

  const handleMenuClick = (e) => {
    setSym(e.key);
    if (callback !== undefined) callback(e.key);
  };

  const menu = (
    <Menu onClick={handleMenuClick}>
      {symbols.map((item) => {
        return (
          <Menu.Item key={item} danger={item === "Basket"}>
            {item}
          </Menu.Item>
        );
      })}
    </Menu>
  );

  return (
    <Dropdown overlay={menu} subMenuOpenDelay={0}>
      <Button size="small">
        {symbol} <DownOutlined />
      </Button>
    </Dropdown>
  );
};

export default SymbolSelector;
