import React, { useState, useEffect, useCallback } from "react";
import { Menu, Dropdown, Button } from "antd";
import { DownOutlined } from "@ant-design/icons";

const SymbolSelector = ({ symbols, callback, defaultIndex, defaultValue }) => {
  const [symbol, setSym] = useState("Select");

  const updateSymbol = useCallback((sym) => {
    setSym(sym);
    if (callback !== undefined) callback(sym);
  }, []);

  useEffect(() => {
    if (symbols && symbols.length > defaultIndex && symbol === "Select") {
      updateSymbol(symbols[defaultIndex]);
    }
  }, [symbols, defaultIndex, symbol, updateSymbol, ]);

  useEffect(() => {
    if (defaultValue && defaultValue.length > 1)  { 
      setSym(defaultValue); 
    }
  }, [defaultValue])

  const menu = (
    <Menu
      onClick={(e) => {
        updateSymbol(e.key);
      }}
    >
      {symbols.map((item, index) => {
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
