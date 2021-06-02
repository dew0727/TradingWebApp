import React, { useState, useEffect } from "react";
import { InputNumber, Input } from "antd";
let lastUpdateTime = new Date();

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

  const handleStep = (val) => {
    setLock(true)
    lastUpdateTime = new Date()
    setTimeout(() => {
      const curTime = new Date()
      if (curTime - lastUpdateTime > 600) {
        setLock(false)
      }
    }, 600)
  }

  return type === "number" ? (
    <InputNumber
      onClick={handleClick}
      onBlur={handleBlur}
      onPressEnter={handleBlur}
      onChange={handleChange}
      value={curVal}
      onStep={handleStep}
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
