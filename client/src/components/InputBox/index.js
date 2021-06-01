import React, { useState, useEffect } from "react";
import { InputNumber } from "antd";

const InputBox = ({ defaultValue, value, step, min, max, onChange, size }) => {
  const [isLocked, setLock] = useState(false);
  const [curVal, setCurVal] = useState(defaultValue || 0);

  const handleClick = (e) => {
    e.target.select();
    setLock(true)
  };

  const handleBlur = (e) => {
    setLock(false);
  };

  const handleChange = (value) => {
      onChange(value)
      setCurVal(value)
  }

  useEffect(() => {
    if (!isLocked) setCurVal(value);
  }, [value, isLocked]);

  return (
    <InputNumber
      onClick={handleClick}
      onBlur={handleBlur}
      onPressEnter={handleBlur}
      onChange={handleChange}
      value={curVal}
      {...{ step, min, max, size }}
    />
  );
};

export default InputBox;
