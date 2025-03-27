import React from 'react';

const LoadingScreen = () => {
  return (
    <div className="menu">
      <h2>Loading Game...</h2>
      <div className="loading-bar">
        <div className="loading-bar-fill"></div>
      </div>
      <p>Preparing weapons and maps...</p>
    </div>
  );
};

export default LoadingScreen;
