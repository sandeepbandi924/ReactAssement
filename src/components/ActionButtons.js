import React from "react";
import "./index.css";

const ActionButtons = ({ onCancel, onUpdate }) => {
  return (
    <div className="actions">
      <button onClick={onCancel}>Cancel</button>
      <button onClick={onUpdate}>Update</button>
    </div>
  );
};

export default ActionButtons;
