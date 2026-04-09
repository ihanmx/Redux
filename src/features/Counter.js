import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { increment, decrement } from "./counterSlice";

const Counter = () => {
  const count = useSelector((state) => {
    return state.counter.count;
  });
  const dispatch = useDispatch();

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
    </section>
  );
};

export default Counter;
