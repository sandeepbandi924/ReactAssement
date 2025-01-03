import React from "react";
import "./index.css";

const ErrorView = ({ onRetry }) => {
  return (
    <div className="error-view">
      <button onClick={onRetry}>
        <img
          alt="error view"
          src="https://assets.ccbp.in/frontend/content/react-js/list-creation-failure-lg-output.png"
        />
      </button>
    </div>
  );
};

export default ErrorView;
