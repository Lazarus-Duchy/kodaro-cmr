import React from "react";
import "./loadingScreen.css";

const loadingScreen = () => {
  return (
    <div className="loading-container">
      <div className="loader-wrapper">
        <div className="client-flow-loader"></div>
        <div className="loader-text">ClientFlow</div>
      </div>
    </div>
  );
};

export default loadingScreen;