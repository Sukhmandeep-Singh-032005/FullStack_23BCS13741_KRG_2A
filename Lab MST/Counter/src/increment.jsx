import { useState } from "react";

function Increment() {
  const [value, setValue] = useState(0);

  const increment = () => {
    if (value >= 10) {
      alert("Maximum limit reached");
      return;
    }
    setValue(value + 1);
  };

  const decrement = () => {
    if (value <= 0) {
      alert("Can't go below 0!");
      return;
    }
    setValue(value - 1);
  };

  const reset = () => {
    setValue(0);
  };

  return (
    <div>
      <p id="text">The value is: {value}</p>
      <div className="button-container">
        <button className="buttons" onClick={decrement}>Decrement</button>
        <button className="buttons" onClick={reset}>Reset</button>
        <button className="buttons" onClick={increment}>Increment</button>
      </div>
    </div>
  );
}

export default Increment;
