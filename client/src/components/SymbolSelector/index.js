import React, { useState, useEffect, useCallback } from "react";
import { Select } from "antd";

const { Option } = Select;

const SymbolSelector = ({ symbols, callback, defaultIndex, defaultValue }) => {
  const [symbol, setSym] = useState("Select");

  const updateSymbol = useCallback(
    (sym) => {
      console.log({ sym });
      setSym(sym);
      if (callback !== undefined) callback(sym);
    },
    [callback]
  );

  useEffect(() => {
    if (symbols && symbols.length > defaultIndex && symbol === "Select") {
      console.log("updating default index");
      updateSymbol(symbols[defaultIndex]);
    }
  }, [symbols, defaultIndex, symbol, updateSymbol]);

  useEffect(() => {
    if (defaultValue && defaultValue.length > 1) {
      console.log("updating default value");
      setSym(defaultValue);
    }
  }, [defaultValue]);

  return (
    <Select value={symbol} onChange={updateSymbol}>
      {symbols.map((item, index) => (
        <Option value={item} key={index}>
          {item}
        </Option>
      ))}
    </Select>
  );
};

export default SymbolSelector;
