import React, { useState, useEffect } from "react";
import { InputNumber, Input } from "antd";

const InputBox = ({
  value,
  step,
  min,
  max,
  onChange,
  size,
  type = "number",
}) => {
  const [isLocked, setLock] = useState(false);
  const [curVal, setCurVal] = useState(type === "number" ? 1 : null);

  const handleClick = (e) => {
    e.target.select();
    setLock(true);
  };

  const handleBlur = (e) => {
    setLock(false);
  };

  const handleChange = (e) => {
    if (type === "number") {
      onChange(e);
      setCurVal(e);
    } else {
      const val = e.target.value;
      onChange && onChange(val);
      setCurVal(val);
    }
  };

  useEffect(() => {
    if (!isLocked && value && curVal !== value) {
      console.log("changed input value: ", value);
      setCurVal(value);
    }
  }, [value, isLocked, curVal]);

  return type === "number" ? (
    <InputNumber
      onClick={handleClick}
      onBlur={handleBlur}
      onPressEnter={handleBlur}
      onChange={handleChange}
      value={curVal}
      {...{ step, min, max, size }}
    />
  ) : (
    <Input
      onClick={handleClick}
      onBlur={handleBlur}
      onPressEnter={handleBlur}
      onChange={handleChange}
      value={curVal}
      size={size || "middle"}
    />
  );
};

export default InputBox;
