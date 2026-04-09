import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { increment, decrement, reset, incrementByAmount } from "./counterSlice";
import { useState } from "react";

const Counter = () => {
  const count = useSelector((state) => {
    return state.counter.count;
  });
  const [incrementAmount, setIncrementAmount] = useState(0);
  const dispatch = useDispatch();
  const incrementValue = Number(incrementAmount) || 0;
  const resetAll = () => {
    setIncrementAmount(0);
    dispatch(reset());
  };

  return (
    <section>
      <h1>Counter: {count}</h1>
      <button
        onClick={() => {
          dispatch(increment());
        }}
      >
        +
      </button>
      <button
        onClick={() => {
          dispatch(decrement());
        }}
      >
        -
      </button>
      <input
        type="text"
        value={incrementAmount}
        onChange={(e) => {
          setIncrementAmount(e.target.value);
        }}
      />
      <div>
        <button
          onClick={() => {
            dispatch(incrementByAmount(incrementValue));
          }}
        >
          Increment by {incrementValue}
        </button>
        <button onClick={resetAll}>Reset All</button>
      </div>
    </section>
  );
};

export default Counter;
