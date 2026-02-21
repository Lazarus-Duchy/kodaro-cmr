import React from "react";
import "./loadingScreen.css";

const LoadingScreen = () => {
  return (
    <div className="loading-container">
      <div className="loader-wrapper">
        <div className="client-flow-loader">
          <div className="inner-circle"></div>
        </div>
        <div className="loader-text">
          Client<span>Flow</span>
        </div>
        <div className="loading-bar">
          <div className="loading-progress"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;